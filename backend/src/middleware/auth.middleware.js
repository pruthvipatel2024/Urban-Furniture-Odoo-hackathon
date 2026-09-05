const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Contact } = require('../models');
const ApiResponse = require('../utils/response');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Authentication token missing or invalid format', 'AUTH_TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication token missing', 'AUTH_TOKEN_MISSING');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Token has expired. Please login again.', 'AUTH_TOKEN_EXPIRED');
      }
      return ApiResponse.unauthorized(res, 'Invalid authentication token', 'AUTH_TOKEN_INVALID');
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Contact, as: 'contact' }],
    });

    if (!user) {
      return ApiResponse.unauthorized(res, 'User account no longer exists', 'USER_NOT_FOUND');
    }

    if (!user.is_active) {
      return ApiResponse.forbidden(res, 'User account has been deactivated. Contact admin.', 'USER_DEACTIVATED');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
};
