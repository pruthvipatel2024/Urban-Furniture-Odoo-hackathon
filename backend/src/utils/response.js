/**
 * Standard API Response Formatter
 */

class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200) {
    const payload = {
      success: true,
      message,
    };
    if (data !== null && data !== undefined) {
      payload.data = data;
    }
    return res.status(statusCode).json(payload);
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', errors = null) {
    const payload = {
      success: false,
      message,
      code,
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }

  static badRequest(res, message = 'Bad Request', errors = null, code = 'BAD_REQUEST') {
    return ApiResponse.error(res, message, 400, code, errors);
  }

  static unauthorized(res, message = 'Unauthorized access', code = 'UNAUTHORIZED') {
    return ApiResponse.error(res, message, 401, code);
  }

  static forbidden(res, message = 'Forbidden. You do not have permission', code = 'FORBIDDEN') {
    return ApiResponse.error(res, message, 403, code);
  }

  static notFound(res, message = 'Resource not found', code = 'NOT_FOUND') {
    return ApiResponse.error(res, message, 404, code);
  }

  static conflict(res, message = 'Conflict with existing resource', code = 'CONFLICT') {
    return ApiResponse.error(res, message, 409, code);
  }

  static unprocessable(res, message = 'Validation failed', errors = null, code = 'UNPROCESSABLE_ENTITY') {
    return ApiResponse.error(res, message, 422, code, errors);
  }
}

module.exports = ApiResponse;
