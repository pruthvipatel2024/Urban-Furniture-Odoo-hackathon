const { Op } = require('sequelize');
const { Product } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');
const { toFixedNumber, multiply, add, subtract } = require('../utils/decimal');

class ProductController {
  /**
   * GET /api/products
   */
  static async getProducts(req, res, next) {
    try {
      const { category, type, search, includeArchived = 'false', page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (includeArchived !== 'true') {
        where.is_archived = false;
      }
      if (category) {
        where.category = category;
      }
      if (type && ['goods', 'service', 'combo'].includes(type)) {
        where.type = type;
      }
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['name', 'ASC']],
      });

      return ApiResponse.success(res, 'Products retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        products: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/products/:id
   */
  static async getProductById(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return ApiResponse.notFound(res, `Product with ID ${req.params.id} not found.`);
      }

      const costValuation = multiply(Number(product.stock_quantity), Number(product.cost_price));
      const salesValuation = multiply(Number(product.stock_quantity), Number(product.sales_price));

      return ApiResponse.success(res, 'Product retrieved successfully', {
        ...product.toJSON(),
        costValuation,
        salesValuation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/products
   */
  static async createProduct(req, res, next) {
    try {
      const { name, type, sales_price, cost_price, category, stock_quantity } = req.body;

      if (!name || !type || sales_price === undefined || cost_price === undefined) {
        return ApiResponse.badRequest(res, 'Product name, type (goods, service, combo), sales price, and cost price are required.');
      }

      if (!['goods', 'service', 'combo'].includes(type)) {
        return ApiResponse.badRequest(res, 'Type must be "goods", "service", or "combo".');
      }

      const sp = toFixedNumber(sales_price);
      const cp = toFixedNumber(cost_price);

      if (sp < 0 || cp < 0) {
        return ApiResponse.badRequest(res, 'Prices cannot be negative values.');
      }

      const product = await Product.create({
        name,
        type,
        sales_price: sp,
        cost_price: cp,
        category: category || 'General Furniture',
        stock_quantity: type === 'goods' ? toFixedNumber(stock_quantity || 0) : 0,
        is_archived: false,
      });

      await logAudit({
        req,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        newValue: product.toJSON(),
      });

      return ApiResponse.created(res, 'Product created successfully', product);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/products/:id
   */
  static async updateProduct(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return ApiResponse.notFound(res, `Product with ID ${req.params.id} not found.`);
      }

      const oldVal = product.toJSON();
      const { name, type, sales_price, cost_price, category } = req.body;

      if (name) product.name = name;
      if (type && ['goods', 'service', 'combo'].includes(type)) product.type = type;
      if (sales_price !== undefined) product.sales_price = toFixedNumber(sales_price);
      if (cost_price !== undefined) product.cost_price = toFixedNumber(cost_price);
      if (category !== undefined) product.category = category;

      await product.save();

      await logAudit({
        req,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        oldValue: oldVal,
        newValue: product.toJSON(),
      });

      return ApiResponse.success(res, 'Product updated successfully', product);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/products/:id (Archive)
   */
  static async archiveProduct(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return ApiResponse.notFound(res, `Product with ID ${req.params.id} not found.`);
      }

      product.is_archived = true;
      await product.save();

      await logAudit({
        req,
        action: 'ARCHIVE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
      });

      return ApiResponse.success(res, `Product "${product.name}" archived successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/products/:id/adjust-stock
   */
  static async adjustStock(req, res, next) {
    try {
      const { quantityDelta, reason } = req.body;
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return ApiResponse.notFound(res, `Product with ID ${req.params.id} not found.`);
      }

      if (product.type !== 'goods') {
        return ApiResponse.badRequest(res, 'Stock adjustments can only be made on physical Goods.');
      }

      const delta = toFixedNumber(quantityDelta);
      if (delta === 0) {
        return ApiResponse.badRequest(res, 'Quantity adjustment delta cannot be 0.');
      }

      const current = Number(product.stock_quantity);
      const newStock = add(current, delta);

      if (newStock < 0) {
        return ApiResponse.badRequest(res, `Adjustment would result in negative stock. Current: ${current}, Adjustment: ${delta}.`);
      }

      product.stock_quantity = newStock;
      await product.save();

      await logAudit({
        req,
        action: 'ADJUST_STOCK',
        entity: 'Product',
        entityId: product.id,
        oldValue: { stock: current },
        newValue: { stock: newStock, delta, reason },
      });

      return ApiResponse.success(res, `Stock adjusted for "${product.name}"`, product);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
