const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalesOrderItem = sequelize.define('SalesOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  tax_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  line_total: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
  },
}, {
  tableName: 'sales_order_items',
  timestamps: false,
});

module.exports = SalesOrderItem;
