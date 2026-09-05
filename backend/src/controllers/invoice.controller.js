const { CustomerInvoice, SalesOrder, SalesOrderItem, Contact, Product, Payment } = require('../models');
const ApiResponse = require('../utils/response');
const SalesService = require('../services/sales.service');
const { logAudit } = require('../middleware/audit.middleware');
const { subtract } = require('../utils/decimal');

class InvoiceController {
  /**
   * GET /api/invoices
   */
  static async getInvoices(req, res, next) {
    try {
      const { paymentStatus, customerId, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (paymentStatus) {
        where.payment_status = paymentStatus;
      }
      // Contact role isolation
      if (req.user.role === 'contact') {
        where.customer_id = req.user.contact_id;
      } else if (customerId) {
        where.customer_id = customerId;
      }

      const { count, rows } = await CustomerInvoice.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['invoice_date', 'DESC'], ['id', 'DESC']],
        include: [
          { model: Contact, as: 'customer' },
          { model: Payment, as: 'payments' },
          {
            model: SalesOrder,
            as: 'salesOrder',
            include: [{ model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
          },
        ],
      });

      const formatted = rows.map((inv) => {
        const total = Number(inv.total_amount);
        const paid = Number(inv.amount_paid);
        const balance = subtract(total, paid);
        return {
          ...inv.toJSON(),
          balance,
        };
      });

      return ApiResponse.success(res, 'Customer Invoices retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        invoices: formatted,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/invoices/:id
   */
  static async getInvoiceById(req, res, next) {
    try {
      const invoice = await CustomerInvoice.findByPk(req.params.id, {
        include: [
          { model: Contact, as: 'customer' },
          { model: Payment, as: 'payments' },
          {
            model: SalesOrder,
            as: 'salesOrder',
            include: [{ model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
          },
        ],
      });

      if (!invoice) {
        return ApiResponse.notFound(res, `Customer Invoice #${req.params.id} not found.`);
      }

      // Contact isolation check
      if (req.user.role === 'contact' && invoice.customer_id !== req.user.contact_id) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this customer invoice.');
      }

      const total = Number(invoice.total_amount);
      const paid = Number(invoice.amount_paid);
      const balance = subtract(total, paid);

      return ApiResponse.success(res, 'Customer Invoice retrieved successfully', {
        ...invoice.toJSON(),
        balance,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/invoices/generate-from-so
   */
  static async convertSOToInvoice(req, res, next) {
    try {
      const { salesOrderId, invoiceDate, dueDate, notes } = req.body;

      if (!salesOrderId) {
        return ApiResponse.badRequest(res, 'salesOrderId is required.');
      }

      const invoice = await SalesService.convertToInvoice({
        salesOrderId,
        invoiceDate,
        dueDate,
        notes,
        userId: req.user.id,
      });

      await logAudit({
        req,
        action: 'CONVERT_SO_TO_INVOICE',
        entity: 'CustomerInvoice',
        entityId: invoice.id,
        newValue: { salesOrderId, invoiceTotal: invoice.total_amount },
      });

      return ApiResponse.created(res, `Customer Invoice #${invoice.id} generated and double-entry posted`, invoice);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InvoiceController;
