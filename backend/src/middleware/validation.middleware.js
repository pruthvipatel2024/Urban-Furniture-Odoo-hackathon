const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return ApiResponse.unprocessable(res, 'Request validation failed', formattedErrors, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = {
  validate,
};
