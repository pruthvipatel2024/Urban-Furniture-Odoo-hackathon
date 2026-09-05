const { AuditLog, User } = require('../models');
const ApiResponse = require('../utils/response');

class AuditController {
  /**
   * GET /api/audit
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { action, entity, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (action) where.action = action;
      if (entity) where.entity = entity;

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        ],
      });

      return ApiResponse.success(res, 'Audit logs retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        logs: rows,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditController;
