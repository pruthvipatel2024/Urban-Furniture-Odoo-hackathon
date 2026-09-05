const { sequelize, PurchaseOrder, PurchaseOrderItem, VendorBill, Contact, Product } = require('../models');
const { add, multiply, round } = require('../utils/decimal');
const AccountingService = require('./accounting.service');
const InventoryService = require('./inventory.service');

class PurchaseService {
  /**
   * Create Purchase Order with server-calculated line totals
   */
  static async createPurchaseOrder({ vendorId, orderDate, notes, items, userId = null }) {
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
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found.`);
        }

        const qty = Number(item.quantity);
        if (qty <= 0) {
          throw new Error(`Quantity for "${product.name}" must be greater than 0.`);
        }

        const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : Number(product.cost_price);
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
      }, { transaction: t });

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
        invoice_date: invoiceDate,
        due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default Net 30
        total_amount: totalAmount,
        amount_paid: 0,
        payment_status: 'unpaid',
        notes: notes || order.notes,
      }, { transaction: t });

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
