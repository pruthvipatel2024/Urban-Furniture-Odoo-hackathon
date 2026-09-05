const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerInvoice = sequelize.define('CustomerInvoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  amount_paid: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid'),
    allowNull: false,
    defaultValue: 'unpaid',
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  analytic_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'customer_invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = CustomerInvoice;
