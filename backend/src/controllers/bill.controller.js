const { VendorBill, PurchaseOrder, PurchaseOrderItem, Contact, Product, Payment } = require('../models');
const ApiResponse = require('../utils/response');
const PurchaseService = require('../services/purchase.service');
const { logAudit } = require('../middleware/audit.middleware');
const { subtract } = require('../utils/decimal');

class BillController {
  /**
   * GET /api/bills
   */
  static async getBills(req, res, next) {
    try {
      const { paymentStatus, vendorId, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (paymentStatus) {
        where.payment_status = paymentStatus;
      }
      // Contact role isolation
      if (req.user.role === 'contact') {
        where.vendor_id = req.user.contact_id;
      } else if (vendorId) {
        where.vendor_id = vendorId;
      }

      const { count, rows } = await VendorBill.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['invoice_date', 'DESC'], ['id', 'DESC']],
        include: [
          { model: Contact, as: 'vendor' },
          { model: Payment, as: 'payments' },
          {
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [{ model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
          },
        ],
      });

      const formatted = rows.map((b) => {
        const total = Number(b.total_amount);
        const paid = Number(b.amount_paid);
        const balance = subtract(total, paid);
        return {
          ...b.toJSON(),
          balance,
        };
      });

      return ApiResponse.success(res, 'Vendor Bills retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        bills: formatted,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/bills/:id
   */
  static async getBillById(req, res, next) {
    try {
      const bill = await VendorBill.findByPk(req.params.id, {
        include: [
          { model: Contact, as: 'vendor' },
          { model: Payment, as: 'payments' },
          {
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [{ model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
          },
        ],
      });

      if (!bill) {
        return ApiResponse.notFound(res, `Vendor Bill #${req.params.id} not found.`);
      }

      // Contact isolation check
      if (req.user.role === 'contact' && bill.vendor_id !== req.user.contact_id) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this vendor bill.');
      }

      const total = Number(bill.total_amount);
      const paid = Number(bill.amount_paid);
      const balance = subtract(total, paid);

      return ApiResponse.success(res, 'Vendor Bill retrieved successfully', {
        ...bill.toJSON(),
        balance,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/bills/generate-from-po
   */
  static async convertPOToBill(req, res, next) {
    try {
      const { purchaseOrderId, invoiceDate, dueDate, notes } = req.body;

      if (!purchaseOrderId) {
        return ApiResponse.badRequest(res, 'purchaseOrderId is required.');
      }

      const bill = await PurchaseService.convertToBill({
        purchaseOrderId,
        invoiceDate,
        dueDate,
        notes,
        userId: req.user.id,
      });

      await logAudit({
        req,
        action: 'CONVERT_PO_TO_BILL',
        entity: 'VendorBill',
        entityId: bill.id,
        newValue: { purchaseOrderId, billTotal: bill.total_amount },
      });

      return ApiResponse.created(res, `Vendor Bill #${bill.id} generated, goods received, and double-entry posted`, bill);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BillController;
