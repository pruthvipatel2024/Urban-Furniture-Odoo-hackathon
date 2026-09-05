const ApiResponse = require('../utils/response');
const config = require('../config/env');

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[Error caught in handler]:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors ? err.errors.map(e => e.path).join(', ') : 'field';
    return ApiResponse.conflict(res, `Duplicate entry. A record with this ${fields} already exists.`, 'DUPLICATE_ENTRY');
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors ? err.errors.map(e => ({ field: e.path, message: e.message })) : null;
    return ApiResponse.unprocessable(res, 'Database validation error', errors, 'DB_VALIDATION_ERROR');
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ApiResponse.badRequest(res, 'Foreign key constraint violation. Referenced record does not exist or cannot be deleted.', null, 'FK_CONSTRAINT_VIOLATION');
  }

  // Custom Application Error
  if (err.statusCode) {
    return ApiResponse.error(res, err.message, err.statusCode, err.code || 'APP_ERROR', err.errors || null);
  }

  // Fallback 500
  const message = config.NODE_ENV === 'production'
    ? 'An unexpected server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, 500, 'INTERNAL_SERVER_ERROR');
}

module.exports = {
  errorHandler,
};
