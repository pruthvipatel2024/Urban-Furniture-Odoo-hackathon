const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChartOfAccount = sequelize.define('ChartOfAccount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  account_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  account_type: {
    type: DataTypes.ENUM('asset', 'liability', 'expense', 'income', 'capital'),
    allowNull: false,
  },
  is_archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'chart_of_accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ChartOfAccount;
