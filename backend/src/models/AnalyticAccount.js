const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnalyticAccount = sequelize.define('AnalyticAccount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
}, {
  tableName: 'analytic_accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AnalyticAccount;
