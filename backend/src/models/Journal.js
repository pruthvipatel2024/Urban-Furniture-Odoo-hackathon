const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Journal = sequelize.define('Journal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('sales', 'purchase', 'bank', 'cash'),
    allowNull: false,
  },
  default_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'journals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Journal;
