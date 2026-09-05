const { Payment, CustomerInvoice, VendorBill, Contact, User } = require('../models');
const ApiResponse = require('../utils/response');
const PaymentService = require('../services/payment.service');
const { logAudit } = require('../middleware/audit.middleware');

class PaymentController {
  /**
   * GET /api/payments
   */
  static async getPayments(req, res, next) {
    try {
      const { method, page = 1, limit = 50 } = req.query;
      const where = {};
      if (method && ['cash', 'bank'].includes(method)) {
        where.method = method;
      }

      const include = [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ];

      if (req.user.role === 'contact') {
        const { Op } = require('sequelize');
        include.push(
          {
            model: CustomerInvoice,
            as: 'customerInvoice',
            required: false,
            where: { customer_id: req.user.contact_id },
            include: [{ model: Contact, as: 'customer' }],
          },
          {
            model: VendorBill,
            as: 'vendorBill',
            required: false,
            where: { vendor_id: req.user.contact_id },
            include: [{ model: Contact, as: 'vendor' }],
          }
        );
        where[Op.or] = [
          { '$customerInvoice.customer_id$': req.user.contact_id },
          { '$vendorBill.vendor_id$': req.user.contact_id },
        ];
      } else {
        include.push(
          { model: CustomerInvoice, as: 'customerInvoice', include: [{ model: Contact, as: 'customer' }] },
          { model: VendorBill, as: 'vendorBill', include: [{ model: Contact, as: 'vendor' }] }
        );
      }

      const { count, rows } = await Payment.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['payment_date', 'DESC'], ['id', 'DESC']],
        include,
      });

      return ApiResponse.success(res, 'Payments retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        payments: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payments/:id
   */
  static async getPaymentById(req, res, next) {
    try {
      const payment = await Payment.findByPk(req.params.id, {
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: CustomerInvoice, as: 'customerInvoice', include: [{ model: Contact, as: 'customer' }] },
          { model: VendorBill, as: 'vendorBill', include: [{ model: Contact, as: 'vendor' }] },
        ],
      });

      if (!payment) {
        return ApiResponse.notFound(res, `Payment #${req.params.id} not found.`);
      }

      // Contact isolation check
      if (req.user.role === 'contact') {
        const isOwner = (payment.customerInvoice && payment.customerInvoice.customer_id === req.user.contact_id) ||
                        (payment.vendorBill && payment.vendorBill.vendor_id === req.user.contact_id);
        if (!isOwner) {
          return ApiResponse.forbidden(res, 'You do not have permission to view this payment voucher.');
        }
      }

      return ApiResponse.success(res, 'Payment voucher retrieved successfully', payment);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payments
   */
  static async recordPayment(req, res, next) {
    try {
      const { paymentDate, amount, method, vendorBillId, customerInvoiceId, notes } = req.body;

      if (!amount || !method) {
        return ApiResponse.badRequest(res, 'Payment amount and method (cash, bank) are required.');
      }

      // Contact role can only pay their own customer invoices
      if (req.user.role === 'contact') {
        if (!customerInvoiceId) {
          return ApiResponse.forbidden(res, 'Contacts can only record payments against Customer Invoices.');
        }
        const inv = await CustomerInvoice.findByPk(customerInvoiceId);
        if (!inv || Number(inv.customer_id) !== Number(req.user.contact_id)) {
          return ApiResponse.forbidden(res, 'You do not have permission to pay this customer invoice.');
        }
      }

      const payment = await PaymentService.recordPayment({
        paymentDate,
        amount,
        method,
        vendorBillId: req.user.role === 'contact' ? null : vendorBillId,
        customerInvoiceId,
        notes,
        userId: req.user.id,
      });

      await logAudit({
        req,
        action: 'RECORD_PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        newValue: { amount, method, vendorBillId, customerInvoiceId },
      });

      return ApiResponse.created(res, 'Payment recorded and posted to general ledger', payment);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
