const ApiResponse = require('../utils/response');

/**
 * RBAC Role Authorization Middleware
 * Allowed roles: 'admin', 'accountant', 'contact'
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required before role verification', 'AUTH_REQUIRED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is: ${req.user.role}`,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}

module.exports = {
  requireRole,
  isAdmin: requireRole('admin'),
  isAdminOrAccountant: requireRole('admin', 'accountant'),
};
