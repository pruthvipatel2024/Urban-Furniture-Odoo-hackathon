const { Product } = require('../models');
const { add, subtract } = require('../utils/decimal');

class InventoryService {
  /**
   * Increase product stock (e.g. on goods receipt from Purchase Order)
   */
  static async increaseStock({ productId, quantity, transaction = null }) {
    const qtyNum = Number(quantity);
    if (qtyNum <= 0) return;

    const product = await Product.findByPk(productId, { transaction, lock: transaction?.LOCK?.UPDATE });
    if (!product) {
      throw new Error(`Product with ID ${productId} not found for inventory increase.`);
    }

    if (product.type === 'service') {
      return product; // Services do not track physical stock
    }

    const newStock = add(product.stock_quantity, qtyNum);
    product.stock_quantity = newStock;
    await product.save({ transaction });

    return product;
  }

  /**
   * Decrease product stock (e.g. on sales dispatch/invoicing)
   */
  static async decreaseStock({ productId, quantity, allowNegative = false, transaction = null }) {
    const qtyNum = Number(quantity);
    if (qtyNum <= 0) return;

    const product = await Product.findByPk(productId, { transaction, lock: transaction?.LOCK?.UPDATE });
    if (!product) {
      throw new Error(`Product with ID ${productId} not found for inventory decrease.`);
    }

    if (product.type === 'service') {
      return product; // Services do not track physical stock
    }

    const currentStock = Number(product.stock_quantity);
    if (!allowNegative && currentStock < qtyNum) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${currentStock}, Required: ${qtyNum}.`);
    }

    const newStock = subtract(currentStock, qtyNum);
    product.stock_quantity = newStock;
    await product.save({ transaction });

    return product;
  }
}

module.exports = InventoryService;
