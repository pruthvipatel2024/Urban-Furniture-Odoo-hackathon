const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
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
    type: DataTypes.ENUM('customer', 'vendor', 'both'),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address_city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  address_state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  address_pincode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  profile_image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'contacts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Contact;
