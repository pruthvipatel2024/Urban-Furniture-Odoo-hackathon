const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Contact } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');

class UserController {
  /**
   * GET /api/users
   */
  static async getUsers(req, res, next) {
    try {
      const { search, role, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (role) {
        where.role = role;
      }
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Contact, as: 'contact' }],
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
      });

      return ApiResponse.success(res, 'Users retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        users: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/:id
   */
  static async getUserById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Contact, as: 'contact' }],
      });

      if (!user) {
        return ApiResponse.notFound(res, `User with ID ${req.params.id} not found.`);
      }

      return ApiResponse.success(res, 'User retrieved successfully', user);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/users
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, role, contact_id } = req.body;

      if (!name || !email || !password || !role) {
        return ApiResponse.badRequest(res, 'Name, email, password, and role are required.');
      }

      if (!['admin', 'accountant', 'contact'].includes(role)) {
        return ApiResponse.badRequest(res, 'Role must be admin, accountant, or contact.');
      }

      const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existing) {
        return ApiResponse.conflict(res, 'A user with this email address already exists.');
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password_hash,
        role,
        contact_id: role === 'contact' ? contact_id : null,
        is_active: true,
      });

      await logAudit({
        req,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        newValue: { name, email, role, contact_id },
      });

      const userResponse = await User.findByPk(user.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Contact, as: 'contact' }],
      });

      return ApiResponse.created(res, 'User created successfully', userResponse);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/users/:id
   */
  static async updateUser(req, res, next) {
    try {
      const { name, role, contact_id, is_active } = req.body;
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return ApiResponse.notFound(res, `User with ID ${req.params.id} not found.`);
      }

      const oldVal = user.toJSON();

      if (name) user.name = name;
      if (role && ['admin', 'accountant', 'contact'].includes(role)) {
        user.role = role;
        user.contact_id = role === 'contact' ? contact_id : null;
      }
      if (is_active !== undefined) user.is_active = Boolean(is_active);

      await user.save();

      await logAudit({
        req,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: user.id,
        oldValue: oldVal,
        newValue: user.toJSON(),
      });

      const userResponse = await User.findByPk(user.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Contact, as: 'contact' }],
      });

      return ApiResponse.success(res, 'User updated successfully', userResponse);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
