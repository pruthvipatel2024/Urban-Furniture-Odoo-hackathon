const { SalesOrder, SalesOrderItem, Contact, Product, User, CustomerInvoice } = require('../models');
const ApiResponse = require('../utils/response');
const SalesService = require('../services/sales.service');
const { logAudit } = require('../middleware/audit.middleware');

class SalesController {
  /**
   * GET /api/sales-orders
   */
  static async getSalesOrders(req, res, next) {
    try {
      const { status, customerId, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (status) {
        where.status = status;
      }
      // Contact role isolation
      if (req.user.role === 'contact') {
        where.customer_id = req.user.contact_id;
      } else if (customerId) {
        where.customer_id = customerId;
      }

      const { count, rows } = await SalesOrder.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['order_date', 'DESC'], ['id', 'DESC']],
        include: [
          { model: Contact, as: 'customer' },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: CustomerInvoice, as: 'invoice' },
          {
            model: SalesOrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
      });

      return ApiResponse.success(res, 'Sales Orders retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        salesOrders: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/sales-orders/:id
   */
  static async getSalesOrderById(req, res, next) {
    try {
      const order = await SalesOrder.findByPk(req.params.id, {
        include: [
          { model: Contact, as: 'customer' },
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: CustomerInvoice, as: 'invoice' },
          {
            model: SalesOrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
      });

      if (!order) {
        return ApiResponse.notFound(res, `Sales Order #${req.params.id} not found.`);
      }

      // Contact isolation check
      if (req.user.role === 'contact' && order.customer_id !== req.user.contact_id) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this sales order.');
      }

      return ApiResponse.success(res, 'Sales Order retrieved successfully', order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/sales-orders
   */
  static async createSalesOrder(req, res, next) {
    try {
      const { customerId, orderDate, notes, items, analyticAccountId } = req.body;

      // Contact role can only order for themselves
      const targetCustomerId = req.user.role === 'contact' ? req.user.contact_id : customerId;

      if (!targetCustomerId || !items) {
        return ApiResponse.badRequest(res, 'Customer ID and items array are required.');
      }

      const order = await SalesService.createSalesOrder({
        customerId: targetCustomerId,
        orderDate,
        notes,
        items,
        analyticAccountId,
        userId: req.user.id,
      });

      await logAudit({
        req,
        action: 'CREATE_SALES_ORDER',
        entity: 'SalesOrder',
        entityId: order.id,
        newValue: { customerId: targetCustomerId, itemsCount: items.length },
      });

      return ApiResponse.created(res, 'Sales Order created successfully in Draft status', order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/sales-orders/:id
   */
  static async updateSalesOrder(req, res, next) {
    try {
      const order = await SalesService.updateSalesOrder(req.params.id, req.body);

      await logAudit({
        req,
        action: 'UPDATE_SALES_ORDER',
        entity: 'SalesOrder',
        entityId: order.id,
        newValue: { customerId: order.customer_id, itemsCount: order.items?.length },
      });

      return ApiResponse.success(res, `Sales Order #${order.id} updated successfully`, order);
    } catch (err) {
      if (err.statusCode === 400 || err.message.includes('does not belong') || err.message.includes('not registered') || err.message.includes('Quantity for') || err.message.includes('must contain')) {
        return ApiResponse.badRequest(res, err.message);
      }
      if (err.statusCode === 404 || err.message.includes('not found')) {
        return ApiResponse.notFound(res, err.message);
      }
      next(err);
    }
  }

  /**
   * POST /api/sales-orders/:id/confirm
   */
  static async confirmSalesOrder(req, res, next) {
    try {
      const order = await SalesService.confirmSalesOrder(req.params.id);

      await logAudit({
        req,
        action: 'CONFIRM_SALES_ORDER',
        entity: 'SalesOrder',
        entityId: order.id,
      });

      return ApiResponse.success(res, `Sales Order #${order.id} confirmed successfully`, order);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/sales-orders/:id/cancel
   */
  static async cancelSalesOrder(req, res, next) {
    try {
      const order = await SalesOrder.findByPk(req.params.id);
      if (!order) {
        return ApiResponse.notFound(res, `Sales Order #${req.params.id} not found.`);
      }

      if (order.status === 'invoiced') {
        return ApiResponse.badRequest(res, `Cannot cancel Sales Order #${order.id} because it has already been invoiced.`);
      }

      order.status = 'cancelled';
      await order.save();

      await logAudit({
        req,
        action: 'CANCEL_SALES_ORDER',
        entity: 'SalesOrder',
        entityId: order.id,
      });

      return ApiResponse.success(res, `Sales Order #${order.id} cancelled successfully`, order);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SalesController;
