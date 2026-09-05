const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const config = require('./env');

// Ensure database exists before Sequelize connects
async function ensureDatabaseExists() {
  try {
    const connection = await mysql.createConnection({
      host: config.DB.HOST,
      port: config.DB.PORT,
      user: config.DB.USER,
      password: config.DB.PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.DB.NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    // eslint-disable-next-line no-console
    console.log(`[DB] Database "${config.DB.NAME}" verified/ready on ${config.DB.HOST}:${config.DB.PORT}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[DB] Note: Could not auto-create database "${config.DB.NAME}". Ensure it exists in XAMPP/MySQL. Error: ${err.message}`);
  }
}

const sequelize = new Sequelize(config.DB.NAME, config.DB.USER, config.DB.PASSWORD, {
  host: config.DB.HOST,
  port: config.DB.PORT,
  dialect: 'mysql',
  logging: config.NODE_ENV === 'development' ? (msg) => console.log(`[SQL] ${msg}`) : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  dialectOptions: {
    decimalNumbers: true,
    dateStrings: true,
    typeCast: true,
  },
});

module.exports = {
  sequelize,
  ensureDatabaseExists,
};
