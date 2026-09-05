const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JournalEntry = sequelize.define('JournalEntry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  journal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  reference: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'journal_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Journal entries are immutable once posted
});

module.exports = JournalEntry;
