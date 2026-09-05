const { sequelize, PurchaseOrder, PurchaseOrderItem, VendorBill, Contact, Product, User } = require('../models');
const { add, multiply, round } = require('../utils/decimal');
const AccountingService = require('./accounting.service');
const InventoryService = require('./inventory.service');

class PurchaseService {
  /**
   * Create Purchase Order with server-calculated line totals
   */
  static async createPurchaseOrder({ vendorId, orderDate, notes, items, analyticAccountId = null, userId = null }) {
    if (!items || items.length === 0) {
      throw new Error('A purchase order must contain at least one product item.');
    }

    const vendor = await Contact.findByPk(vendorId);
    if (!vendor) {
      throw new Error(`Vendor with ID ${vendorId} not found.`);
    }

    if (vendor.type !== 'vendor' && vendor.type !== 'both') {
      throw new Error(`Contact "${vendor.name}" is not registered as a Vendor.`);
    }

    return sequelize.transaction(async (t) => {
      const lineItems = [];
      for (const item of items) {
        const rawProductId = item.productId || item.product_id;
        const product = await Product.findByPk(rawProductId, { transaction: t });
        if (!product) {
          throw new Error(`Product with ID ${rawProductId} not found.`);
        }

        const qty = Number(item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1));
        if (qty <= 0) {
          throw new Error(`Quantity for "${product.name}" must be greater than 0.`);
        }

        const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (item.unit_price !== undefined ? Number(item.unit_price) : Number(product.cost_price));
        const lineTotal = round(multiply(qty, unitPrice));

        lineItems.push({
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
          line_total: lineTotal,
        });
      }

      const purchaseOrder = await PurchaseOrder.create({
        vendor_id: vendorId,
        order_date: orderDate || new Date(),
        status: 'draft',
        notes,
        created_by: userId,
        analytic_account_id: analyticAccountId || null,
      }, { transaction: t });

      // Generate sequence number P00001
      purchaseOrder.order_number = 'P' + String(purchaseOrder.id).padStart(5, '0');
      await purchaseOrder.save({ transaction: t });

      const itemsWithOrderId = lineItems.map(item => ({
        ...item,
        purchase_order_id: purchaseOrder.id,
      }));

      await PurchaseOrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

      return PurchaseOrder.findByPk(purchaseOrder.id, {
        include: [
          { model: Contact, as: 'vendor' },
          { model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        ],
        transaction: t,
      });
    });
  }

  /**
   * Update Purchase Order with child-line reconciliation & foreign child rejection
   */
  static async updatePurchaseOrder(purchaseOrderId, { vendorId, vendor_id, orderDate, order_date, notes, items, analyticAccountId, analytic_account_id }) {
    return sequelize.transaction(async (t) => {
      const order = await PurchaseOrder.findByPk(purchaseOrderId, {
        include: [{ model: PurchaseOrderItem, as: 'items' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        const error = new Error(`Purchase Order #${purchaseOrderId} not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (order.status !== 'draft') {
        const error = new Error(`Cannot edit Purchase Order #${purchaseOrderId} because current status is "${order.status}". Only draft orders can be edited.`);
        error.statusCode = 400;
        throw error;
      }

      const effectiveVendorId = vendorId !== undefined ? vendorId : vendor_id;
      if (effectiveVendorId !== undefined && effectiveVendorId !== order.vendor_id) {
        const vendor = await Contact.findByPk(effectiveVendorId, { transaction: t });
        if (!vendor) {
          const error = new Error(`Vendor with ID ${effectiveVendorId} not found.`);
          error.statusCode = 400;
          throw error;
        }
        if (vendor.type !== 'vendor' && vendor.type !== 'both') {
          const error = new Error(`Contact "${vendor.name}" is not registered as a Vendor.`);
          error.statusCode = 400;
          throw error;
        }
        order.vendor_id = effectiveVendorId;
      }

      const effectiveOrderDate = orderDate !== undefined ? orderDate : order_date;
      if (effectiveOrderDate !== undefined) {
        order.order_date = effectiveOrderDate;
      }

      if (notes !== undefined) {
        order.notes = notes;
      }

      const effectiveAnalytic = analyticAccountId !== undefined ? analyticAccountId : analytic_account_id;
      if (effectiveAnalytic !== undefined) {
        order.analytic_account_id = effectiveAnalytic || null;
      }

      await order.save({ transaction: t });

      // Child-line reconciliation if items provided
      if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
          const error = new Error('A purchase order must contain at least one product item.');
          error.statusCode = 400;
          throw error;
        }

        const existingItems = order.items || [];
        const existingItemMap = new Map(existingItems.map(item => [item.id, item]));
        const updatedItemIds = new Set();

        for (const rawItem of items) {
          const lineId = rawItem.id || rawItem.item_id || rawItem.purchase_order_item_id;
          const productId = rawItem.productId !== undefined ? rawItem.productId : rawItem.product_id;
          const quantity = rawItem.quantity !== undefined ? rawItem.quantity : rawItem.qty;
          const unitPriceRaw = rawItem.unitPrice !== undefined ? rawItem.unitPrice : rawItem.unit_price;

          if (lineId) {
            // Verify ownership: must belong to this purchase order
            if (!existingItemMap.has(Number(lineId))) {
              const error = new Error(`Purchase Order Item #${lineId} does not belong to Purchase Order #${purchaseOrderId}.`);
              error.statusCode = 400;
              throw error;
            }

            const existingLine = existingItemMap.get(Number(lineId));
            const targetProductId = productId !== undefined ? productId : existingLine.product_id;
            const product = await Product.findByPk(targetProductId, { transaction: t });
            if (!product) {
              const error = new Error(`Product with ID ${targetProductId} not found.`);
              error.statusCode = 400;
              throw error;
            }

            const qty = quantity !== undefined ? Number(quantity) : Number(existingLine.quantity);
            if (qty <= 0) {
              const error = new Error(`Quantity for "${product.name}" must be greater than 0.`);
              error.statusCode = 400;
              throw error;
            }

            const unitPrice = unitPriceRaw !== undefined ? Number(unitPriceRaw) : (existingLine.unit_price !== undefined ? Number(existingLine.unit_price) : Number(product.cost_price));
            const lineTotal = round(multiply(qty, unitPrice));

            await existingLine.update({
              product_id: product.id,
              quantity: qty,
              unit_price: unitPrice,
              line_total: lineTotal,
            }, { transaction: t });

            updatedItemIds.add(Number(lineId));
          } else {
            // New line item without ID -> create
            if (!productId) {
              const error = new Error('Product ID is required for each order item.');
              error.statusCode = 400;
              throw error;
            }
            const product = await Product.findByPk(productId, { transaction: t });
            if (!product) {
              const error = new Error(`Product with ID ${productId} not found.`);
              error.statusCode = 400;
              throw error;
            }

            const qty = Number(quantity);
            if (!qty || qty <= 0) {
              const error = new Error(`Quantity for "${product.name}" must be greater than 0.`);
              error.statusCode = 400;
              throw error;
            }

            const unitPrice = unitPriceRaw !== undefined ? Number(unitPriceRaw) : Number(product.cost_price);
            const lineTotal = round(multiply(qty, unitPrice));

            await PurchaseOrderItem.create({
              purchase_order_id: order.id,
              product_id: product.id,
              quantity: qty,
              unit_price: unitPrice,
              line_total: lineTotal,
            }, { transaction: t });
          }
        }

        // Delete removed lines
        for (const existingLine of existingItems) {
          if (!updatedItemIds.has(existingLine.id)) {
            await existingLine.destroy({ transaction: t });
          }
        }
      }

      return PurchaseOrder.findByPk(order.id, {
        include: [
          { model: Contact, as: 'vendor' },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: VendorBill, as: 'vendorBill' },
          {
            model: PurchaseOrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
        transaction: t,
      });
    });
  }

  /**
   * Confirm Purchase Order
   */
  static async confirmPurchaseOrder(purchaseOrderId) {
    const order = await PurchaseOrder.findByPk(purchaseOrderId);
    if (!order) {
      throw new Error(`Purchase Order #${purchaseOrderId} not found.`);
    }

    if (order.status !== 'draft') {
      throw new Error(`Cannot confirm Purchase Order #${purchaseOrderId} because status is "${order.status}".`);
    }

    order.status = 'confirmed';
    await order.save();
    return order;
  }

  /**
   * Convert PO -> Goods Received & Vendor Bill & Auto-post Double Entry & Increment Stock
   */
  static async convertToBill({ purchaseOrderId, invoiceDate = new Date(), dueDate = null, notes = null, userId = null }) {
    return sequelize.transaction(async (t) => {
      const order = await PurchaseOrder.findByPk(purchaseOrderId, {
        include: [{ model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new Error(`Purchase Order #${purchaseOrderId} not found.`);
      }

      if (order.status === 'billed') {
        throw new Error(`Purchase Order #${purchaseOrderId} is already billed.`);
      }

      if (order.status === 'cancelled') {
        throw new Error(`Cannot bill a cancelled Purchase Order #${purchaseOrderId}.`);
      }

      // Increment inventory stock (Goods Received)
      for (const item of order.items) {
        await InventoryService.increaseStock({
          productId: item.product_id,
          quantity: item.quantity,
          transaction: t,
        });
      }

      // Calculate total amount from server PO items
      const totalAmount = order.items.reduce((sum, item) => add(sum, Number(item.line_total)), 0);

      // Create Vendor Bill
      const bill = await VendorBill.create({
        purchase_order_id: order.id,
        vendor_id: order.vendor_id,
        analytic_account_id: order.analytic_account_id || null,
        invoice_date: invoiceDate,
        due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default Net 30
        total_amount: totalAmount,
        amount_paid: 0,
        payment_status: 'unpaid',
        notes: notes || order.notes,
      }, { transaction: t });

      // Generate sequence number Bill/2026/0001
      const year = new Date(invoiceDate).getFullYear() || 2026;
      bill.bill_number = `Bill/${year}/${String(bill.id).padStart(4, '0')}`;
      await bill.save({ transaction: t });

      // Update Purchase Order Status
      order.status = 'billed';
      await order.save({ transaction: t });

      // Auto-post double-entry into Journal & General Ledger
      await AccountingService.postVendorBill({
        billId: bill.id,
        userId,
        transaction: t,
      });

      return VendorBill.findByPk(bill.id, {
        include: [
          { model: Contact, as: 'vendor' },
          { model: PurchaseOrder, as: 'purchaseOrder', include: [{ model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }] },
        ],
        transaction: t,
      });
    });
  }
}

module.exports = PurchaseService;
