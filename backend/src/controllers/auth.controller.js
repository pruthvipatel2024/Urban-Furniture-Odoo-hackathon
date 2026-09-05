const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const config = require('../config/env');
const { User, Contact } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');

function validatePasswordComplexity(password) {
  if (!password || password.length <= 8) {
    return 'Password must be longer than 8 characters';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, loginId, password } = req.body;
      const identifier = (loginId || email || '').trim();

      if (!identifier || !password) {
        return ApiResponse.badRequest(res, 'Login ID / Email and password are required', null, 'MISSING_CREDENTIALS');
      }

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: identifier.toLowerCase() },
            { name: identifier },
          ],
        },
        include: [{ model: Contact, as: 'contact' }],
      });

      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid Login Id or Password', 'INVALID_CREDENTIALS');
      }

      if (!user.is_active) {
        return ApiResponse.forbidden(res, 'Your account has been deactivated. Please contact an administrator.', 'ACCOUNT_DEACTIVATED');
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return ApiResponse.unauthorized(res, 'Invalid Login Id or Password', 'INVALID_CREDENTIALS');
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
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { loginId, email, password, confirmPassword } = req.body;

      // 1. Validate Login ID
      const cleanLoginId = (loginId || '').trim();
      if (!cleanLoginId || cleanLoginId.length < 6 || cleanLoginId.length > 12) {
        return ApiResponse.badRequest(res, 'Login ID must be between 6 and 12 characters', null, 'INVALID_LOGIN_ID');
      }

      // 2. Validate Email
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return ApiResponse.badRequest(res, 'Please provide a valid email address', null, 'INVALID_EMAIL');
      }

      // 3. Validate Password match & complexity
      if (password !== confirmPassword) {
        return ApiResponse.badRequest(res, 'Password and Re-entered Password do not match', null, 'PASSWORD_MISMATCH');
      }

      const pwdError = validatePasswordComplexity(password);
      if (pwdError) {
        return ApiResponse.badRequest(res, pwdError, null, 'WEAK_PASSWORD');
      }

      // Check duplicates
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: cleanEmail },
            { name: cleanLoginId },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === cleanEmail) {
          return ApiResponse.badRequest(res, 'Email ID already exists in database', null, 'DUPLICATE_EMAIL');
        }
        return ApiResponse.badRequest(res, 'Login ID already taken. Please choose another.', null, 'DUPLICATE_LOGIN_ID');
      }

      // Create contact for user if needed
      const [contact] = await Contact.findOrCreate({
        where: { email: cleanEmail },
        defaults: {
          name: cleanLoginId,
          type: 'customer',
          email: cleanEmail,
        },
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: cleanLoginId,
        email: cleanEmail,
        password_hash: passwordHash,
        role: 'contact',
        contact_id: contact.id,
        is_active: true,
      });

      await logAudit({
        req,
        userId: newUser.id,
        action: 'SIGNUP',
        entity: 'User',
        entityId: newUser.id,
      });

      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          contact_id: newUser.contact_id,
        },
        config.JWT.SECRET,
        { expiresIn: config.JWT.EXPIRES_IN }
      );

      return ApiResponse.created(res, 'Account created successfully', {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          contact_id: newUser.contact_id,
          contact,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res, next) {
    try {
      const { identifier } = req.body;
      const cleanId = (identifier || '').trim();

      if (!cleanId) {
        return ApiResponse.badRequest(res, 'Please provide your Login ID or Email', null, 'MISSING_IDENTIFIER');
      }

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: cleanId.toLowerCase() },
            { name: cleanId },
          ],
        },
      });

      if (!user) {
        return ApiResponse.notFound(res, 'No account found matching this Login ID or Email', 'USER_NOT_FOUND');
      }

      return ApiResponse.success(res, 'Account verified. You can now reset your password.', {
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  static async resetPassword(req, res, next) {
    try {
      const { identifier, newPassword, confirmPassword } = req.body;
      const cleanId = (identifier || '').trim();

      if (!cleanId || !newPassword || !confirmPassword) {
        return ApiResponse.badRequest(res, 'All fields are required', null, 'MISSING_FIELDS');
      }

      if (newPassword !== confirmPassword) {
        return ApiResponse.badRequest(res, 'Passwords do not match', null, 'PASSWORD_MISMATCH');
      }

      const pwdError = validatePasswordComplexity(newPassword);
      if (pwdError) {
        return ApiResponse.badRequest(res, pwdError, null, 'WEAK_PASSWORD');
      }

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: cleanId.toLowerCase() },
            { name: cleanId },
          ],
        },
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User account not found', 'USER_NOT_FOUND');
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
      await user.save();

      await logAudit({
        req,
        userId: user.id,
        action: 'RESET_PASSWORD',
        entity: 'User',
        entityId: user.id,
      });

      return ApiResponse.success(res, 'Password has been successfully updated. Please sign in with your new password.');
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

      const pwdError = validatePasswordComplexity(newPassword);
      if (pwdError) {
        return ApiResponse.badRequest(res, pwdError, null, 'WEAK_PASSWORD');
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

