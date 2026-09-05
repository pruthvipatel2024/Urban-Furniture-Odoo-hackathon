const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  responsible_person: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  planned_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  analytic_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'revised', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft',
  },
  revision_of_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  revised_budget_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'budgets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Budget;
