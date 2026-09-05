const { PurchaseOrder, PurchaseOrderItem, Contact, Product, User, VendorBill } = require('../models');
const ApiResponse = require('../utils/response');
const PurchaseService = require('../services/purchase.service');
const { logAudit } = require('../middleware/audit.middleware');

class PurchaseController {
  /**
   * GET /api/purchase-orders
   */
  static async getPurchaseOrders(req, res, next) {
    try {
      const { status, vendorId, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (status) {
        where.status = status;
      }
      // Contact role isolation
      if (req.user.role === 'contact') {
        where.vendor_id = req.user.contact_id;
      } else if (vendorId) {
        where.vendor_id = vendorId;
      }

      const { count, rows } = await PurchaseOrder.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['order_date', 'DESC'], ['id', 'DESC']],
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
      });

      return ApiResponse.success(res, 'Purchase Orders retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        purchaseOrders: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/purchase-orders/:id
   */
  static async getPurchaseOrderById(req, res, next) {
    try {
      const order = await PurchaseOrder.findByPk(req.params.id, {
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
      });

      if (!order) {
        return ApiResponse.notFound(res, `Purchase Order #${req.params.id} not found.`);
      }

      // Contact isolation check
      if (req.user.role === 'contact' && order.vendor_id !== req.user.contact_id) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this purchase order.');
      }

      return ApiResponse.success(res, 'Purchase Order retrieved successfully', order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/purchase-orders
   */
  static async createPurchaseOrder(req, res, next) {
    try {
      const { vendorId, orderDate, notes, items, analyticAccountId } = req.body;

      if (!vendorId || !items) {
        return ApiResponse.badRequest(res, 'Vendor ID and items array are required.');
      }

      const order = await PurchaseService.createPurchaseOrder({
        vendorId,
        orderDate,
        notes,
        items,
        analyticAccountId,
        userId: req.user.id,
      });

      await logAudit({
        req,
        action: 'CREATE_PURCHASE_ORDER',
        entity: 'PurchaseOrder',
        entityId: order.id,
        newValue: { vendorId, itemsCount: items.length },
      });

      return ApiResponse.created(res, 'Purchase Order created successfully in Draft status', order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/purchase-orders/:id/confirm
   */
  static async confirmPurchaseOrder(req, res, next) {
    try {
      const order = await PurchaseService.confirmPurchaseOrder(req.params.id);

      await logAudit({
        req,
        action: 'CONFIRM_PURCHASE_ORDER',
        entity: 'PurchaseOrder',
        entityId: order.id,
      });

      return ApiResponse.success(res, `Purchase Order #${order.id} confirmed successfully`, order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/purchase-orders/:id/cancel
   */
  static async cancelPurchaseOrder(req, res, next) {
    try {
      const order = await PurchaseOrder.findByPk(req.params.id);
      if (!order) {
        return ApiResponse.notFound(res, `Purchase Order #${req.params.id} not found.`);
      }

      if (order.status === 'billed') {
        return ApiResponse.badRequest(res, `Cannot cancel Purchase Order #${order.id} because it has already been billed.`);
      }

      order.status = 'cancelled';
      await order.save();

      await logAudit({
        req,
        action: 'CANCEL_PURCHASE_ORDER',
        entity: 'PurchaseOrder',
        entityId: order.id,
      });

      return ApiResponse.success(res, `Purchase Order #${order.id} cancelled successfully`, order);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PurchaseController;
