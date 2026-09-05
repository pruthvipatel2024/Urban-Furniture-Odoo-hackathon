const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Contact } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');

class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.badRequest(res, 'Email and password are required', null, 'MISSING_CREDENTIALS');
      }

      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
        include: [{ model: Contact, as: 'contact' }],
      });

      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      if (!user.is_active) {
        return ApiResponse.forbidden(res, 'Your account has been deactivated. Please contact an administrator.', 'ACCOUNT_DEACTIVATED');
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return ApiResponse.unauthorized(res, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          contact_id: user.contact_id,
        },
        config.JWT.SECRET,
        { expiresIn: config.JWT.EXPIRES_IN }
      );

      // Audit Log
      await logAudit({
        req,
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
      });

      return ApiResponse.success(res, 'Login successful', {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          contact_id: user.contact_id,
          contact: user.contact || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async me(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Contact, as: 'contact' }],
      });

      return ApiResponse.success(res, 'User profile retrieved', user);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return ApiResponse.badRequest(res, 'Both current and new password are required', null, 'MISSING_PASSWORDS');
      }

      if (newPassword.length < 6) {
        return ApiResponse.badRequest(res, 'New password must be at least 6 characters long', null, 'PASSWORD_TOO_SHORT');
      }

      const user = await User.findByPk(req.user.id);
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

      if (!isMatch) {
        return ApiResponse.badRequest(res, 'Current password is incorrect', null, 'INVALID_CURRENT_PASSWORD');
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
      await user.save();

      await logAudit({
        req,
        userId: user.id,
        action: 'CHANGE_PASSWORD',
        entity: 'User',
        entityId: user.id,
      });

      return ApiResponse.success(res, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req, res, next) {
    try {
      if (req.user) {
        await logAudit({
          req,
          userId: req.user.id,
          action: 'LOGOUT',
          entity: 'User',
          entityId: req.user.id,
        });
      }
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
