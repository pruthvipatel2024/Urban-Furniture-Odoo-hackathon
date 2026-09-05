const { sequelize, SalesOrder, SalesOrderItem, CustomerInvoice, Contact, Product } = require('../models');
const { add, multiply, round } = require('../utils/decimal');
const AccountingService = require('./accounting.service');
const InventoryService = require('./inventory.service');

class SalesService {
  /**
   * Create Sales Order with server-calculated line totals
   */
  static async createSalesOrder({ customerId, orderDate, notes, items, analyticAccountId = null, userId = null }) {
    if (!items || items.length === 0) {
      throw new Error('A sales order must contain at least one product item.');
    }

    const customer = await Contact.findByPk(customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found.`);
    }

    if (customer.type !== 'customer' && customer.type !== 'both') {
      throw new Error(`Contact "${customer.name}" is not registered as a Customer.`);
    }

    return sequelize.transaction(async (t) => {
      // Validate items & fetch products
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

        const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (item.unit_price !== undefined ? Number(item.unit_price) : Number(product.sales_price));
        const taxPercent = item.taxPercent !== undefined ? Number(item.taxPercent) : (item.tax_percent !== undefined ? Number(item.tax_percent) : 0);

        // Backend authoritative calculation: Qty * UnitPrice * (1 + Tax / 100)
        const subtotal = multiply(qty, unitPrice);
        const taxAmount = multiply(subtotal, taxPercent / 100);
        const lineTotal = round(add(subtotal, taxAmount));

        lineItems.push({
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
          tax_percent: taxPercent,
          line_total: lineTotal,
        });
      }

      const salesOrder = await SalesOrder.create({
        customer_id: customerId,
        order_date: orderDate || new Date(),
        status: 'draft',
        notes,
        created_by: userId,
        analytic_account_id: analyticAccountId || null,
      }, { transaction: t });

      // Generate sequence number S00001
      salesOrder.order_number = 'S' + String(salesOrder.id).padStart(5, '0');
      await salesOrder.save({ transaction: t });

      const itemsWithOrderId = lineItems.map(item => ({
        ...item,
        sales_order_id: salesOrder.id,
      }));

      await SalesOrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

      return SalesOrder.findByPk(salesOrder.id, {
        include: [
          { model: Contact, as: 'customer' },
          { model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        ],
        transaction: t,
      });
    });
  }

  /**
   * Update Sales Order with child-line reconciliation & foreign child rejection
   */
  static async updateSalesOrder(salesOrderId, { customerId, customer_id, orderDate, order_date, notes, items, analyticAccountId, analytic_account_id }) {
    return sequelize.transaction(async (t) => {
      const order = await SalesOrder.findByPk(salesOrderId, {
        include: [{ model: SalesOrderItem, as: 'items' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        const error = new Error(`Sales Order #${salesOrderId} not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (order.status !== 'draft') {
        const error = new Error(`Cannot edit Sales Order #${salesOrderId} because current status is "${order.status}". Only draft orders can be edited.`);
        error.statusCode = 400;
        throw error;
      }

      const effectiveCustomerId = customerId !== undefined ? customerId : customer_id;
      if (effectiveCustomerId !== undefined && effectiveCustomerId !== order.customer_id) {
        const customer = await Contact.findByPk(effectiveCustomerId, { transaction: t });
        if (!customer) {
          const error = new Error(`Customer with ID ${effectiveCustomerId} not found.`);
          error.statusCode = 400;
          throw error;
        }
        if (customer.type !== 'customer' && customer.type !== 'both') {
          const error = new Error(`Contact "${customer.name}" is not registered as a Customer.`);
          error.statusCode = 400;
          throw error;
        }
        order.customer_id = effectiveCustomerId;
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
          const error = new Error('A sales order must contain at least one product item.');
          error.statusCode = 400;
          throw error;
        }

        const existingItems = order.items || [];
        const existingItemMap = new Map(existingItems.map(item => [item.id, item]));
        const updatedItemIds = new Set();

        for (const rawItem of items) {
          const lineId = rawItem.id || rawItem.item_id || rawItem.sales_order_item_id;
          const productId = rawItem.productId !== undefined ? rawItem.productId : rawItem.product_id;
          const quantity = rawItem.quantity !== undefined ? rawItem.quantity : rawItem.qty;
          const unitPriceRaw = rawItem.unitPrice !== undefined ? rawItem.unitPrice : rawItem.unit_price;
          const taxPercentRaw = rawItem.taxPercent !== undefined ? rawItem.taxPercent : rawItem.tax_percent;

          if (lineId) {
            // Verify ownership: must belong to this sales order
            if (!existingItemMap.has(Number(lineId))) {
              const error = new Error(`Sales Order Item #${lineId} does not belong to Sales Order #${salesOrderId}.`);
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

            const unitPrice = unitPriceRaw !== undefined ? Number(unitPriceRaw) : (existingLine.unit_price !== undefined ? Number(existingLine.unit_price) : Number(product.sales_price));
            const taxPercent = taxPercentRaw !== undefined ? Number(taxPercentRaw) : (existingLine.tax_percent !== undefined ? Number(existingLine.tax_percent) : 0);

            const subtotal = multiply(qty, unitPrice);
            const taxAmount = multiply(subtotal, taxPercent / 100);
            const lineTotal = round(add(subtotal, taxAmount));

            await existingLine.update({
              product_id: product.id,
              quantity: qty,
              unit_price: unitPrice,
              tax_percent: taxPercent,
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

            const unitPrice = unitPriceRaw !== undefined ? Number(unitPriceRaw) : Number(product.sales_price);
            const taxPercent = taxPercentRaw !== undefined ? Number(taxPercentRaw) : 0;

            const subtotal = multiply(qty, unitPrice);
            const taxAmount = multiply(subtotal, taxPercent / 100);
            const lineTotal = round(add(subtotal, taxAmount));

            await SalesOrderItem.create({
              sales_order_id: order.id,
              product_id: product.id,
              quantity: qty,
              unit_price: unitPrice,
              tax_percent: taxPercent,
              line_total: lineTotal,
            }, { transaction: t });
          }
        }

        // Delete removed lines (existing items whose ID was not in the payload)
        for (const existingLine of existingItems) {
          if (!updatedItemIds.has(existingLine.id)) {
            await existingLine.destroy({ transaction: t });
          }
        }
      }

      return SalesOrder.findByPk(order.id, {
        include: [
          { model: Contact, as: 'customer' },
          { model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        ],
        transaction: t,
      });
    });
  }

  /**
   * Confirm Sales Order
   */
  static async confirmSalesOrder(salesOrderId) {
    const order = await SalesOrder.findByPk(salesOrderId, {
      include: [{ model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    if (!order) {
      throw new Error(`Sales Order #${salesOrderId} not found.`);
    }

    if (order.status !== 'draft') {
      throw new Error(`Cannot confirm Sales Order #${salesOrderId} because current status is "${order.status}".`);
    }

    // Check stock availability
    for (const item of order.items) {
      if (item.product && item.product.type === 'goods') {
        const available = Number(item.product.stock_quantity);
        const needed = Number(item.quantity);
        if (available < needed) {
          throw new Error(`Insufficient stock for "${item.product.name}". Available: ${available}, Needed: ${needed}.`);
        }
      }
    }

    order.status = 'confirmed';
    await order.save();
    return order;
  }

  /**
   * Convert Sales Order -> Customer Invoice & Auto-post Double Entry & Decrement Stock
   */
  static async convertToInvoice({ salesOrderId, invoiceDate = new Date(), dueDate = null, notes = null, userId = null }) {
    return sequelize.transaction(async (t) => {
      const order = await SalesOrder.findByPk(salesOrderId, {
        include: [{ model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new Error(`Sales Order #${salesOrderId} not found.`);
      }

      if (order.status === 'invoiced') {
        throw new Error(`Sales Order #${salesOrderId} is already invoiced.`);
      }

      if (order.status === 'cancelled') {
        throw new Error(`Cannot invoice a cancelled Sales Order #${salesOrderId}.`);
      }

      // Decrement inventory stock
      for (const item of order.items) {
        await InventoryService.decreaseStock({
          productId: item.product_id,
          quantity: item.quantity,
          allowNegative: false,
          transaction: t,
        });
      }

      // Calculate total amount from server order items
      const totalAmount = order.items.reduce((sum, item) => add(sum, Number(item.line_total)), 0);

      // Create Customer Invoice
      const invoice = await CustomerInvoice.create({
        sales_order_id: order.id,
        customer_id: order.customer_id,
        analytic_account_id: order.analytic_account_id || null,
        invoice_date: invoiceDate,
        due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default Net 30
        total_amount: totalAmount,
        amount_paid: 0,
        payment_status: 'unpaid',
        notes: notes || order.notes,
      }, { transaction: t });

      // Generate sequence number INV/2026/0001
      const year = new Date(invoiceDate).getFullYear() || 2026;
      invoice.invoice_number = `INV/${year}/${String(invoice.id).padStart(4, '0')}`;
      await invoice.save({ transaction: t });

      // Update Sales Order Status
      order.status = 'invoiced';
      await order.save({ transaction: t });

      // Auto-post double-entry into Journal & General Ledger
      await AccountingService.postCustomerInvoice({
        invoiceId: invoice.id,
        userId,
        transaction: t,
      });

      return CustomerInvoice.findByPk(invoice.id, {
        include: [
          { model: Contact, as: 'customer' },
          { model: SalesOrder, as: 'salesOrder', include: [{ model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }] },
        ],
        transaction: t,
      });
    });
  }
}

module.exports = SalesService;
