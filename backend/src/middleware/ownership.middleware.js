const ApiResponse = require('../utils/response');

/**
 * Object-level Authorization Middleware
 * Ensures that if a user has role 'contact', they can ONLY access records associated with their contact_id.
 * Admins and Accountants bypass this check.
 */
function checkContactOwnership(getRecordContactId) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required', 'AUTH_REQUIRED');
      }

      // Admins and Accountants have system-wide access
      if (req.user.role === 'admin' || req.user.role === 'accountant') {
        return next();
      }

      // If user is a contact, verify contact_id is set
      if (!req.user.contact_id) {
        return ApiResponse.forbidden(res, 'Contact account is not linked to any contact record', 'CONTACT_NOT_LINKED');
      }

      // Resolve contact ID of the target resource
      const targetContactId = await getRecordContactId(req);

      if (!targetContactId) {
        return ApiResponse.notFound(res, 'Requested resource not found', 'RESOURCE_NOT_FOUND');
      }

      if (parseInt(targetContactId, 10) !== parseInt(req.user.contact_id, 10)) {
        return ApiResponse.forbidden(res, 'Access denied. You do not own this financial record.', 'ACCESS_DENIED_OWNERSHIP');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  checkContactOwnership,
};
