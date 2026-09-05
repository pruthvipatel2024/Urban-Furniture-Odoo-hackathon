const { sequelize, SalesOrder, SalesOrderItem, CustomerInvoice, Contact, Product } = require('../models');
const { add, multiply, round } = require('../utils/decimal');
const AccountingService = require('./accounting.service');
const InventoryService = require('./inventory.service');

class SalesService {
  /**
   * Create Sales Order with server-calculated line totals
   */
  static async createSalesOrder({ customerId, orderDate, notes, items, userId = null }) {
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
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found.`);
        }

        const qty = Number(item.quantity);
        if (qty <= 0) {
          throw new Error(`Quantity for "${product.name}" must be greater than 0.`);
        }

        const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : Number(product.sales_price);
        const taxPercent = item.tax_percent !== undefined ? Number(item.tax_percent) : 0;

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
        analytic_account_id: typeof analyticAccountId !== 'undefined' ? analyticAccountId : null,
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
