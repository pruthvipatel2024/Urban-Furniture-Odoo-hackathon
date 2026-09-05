const app = require('./app');
const config = require('./config/env');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./config/database');
const { seedDatabase } = require('./utils/seedData');

async function ensureSchemaColumns() {
  const columnsToAdd = [
    { table: 'budgets', column: 'status', def: "VARCHAR(20) NOT NULL DEFAULT 'draft'" },
    { table: 'budgets', column: 'revision_of_id', def: 'INT DEFAULT NULL' },
    { table: 'budgets', column: 'revised_budget_id', def: 'INT DEFAULT NULL' },
    { table: 'customer_invoices', column: 'invoice_number', def: 'VARCHAR(50) DEFAULT NULL' },
    { table: 'customer_invoices', column: 'analytic_account_id', def: 'INT DEFAULT NULL' },
    { table: 'vendor_bills', column: 'bill_number', def: 'VARCHAR(50) DEFAULT NULL' },
    { table: 'vendor_bills', column: 'analytic_account_id', def: 'INT DEFAULT NULL' },
    { table: 'sales_orders', column: 'order_number', def: 'VARCHAR(50) DEFAULT NULL' },
    { table: 'sales_orders', column: 'analytic_account_id', def: 'INT DEFAULT NULL' },
    { table: 'purchase_orders', column: 'order_number', def: 'VARCHAR(50) DEFAULT NULL' },
    { table: 'purchase_orders', column: 'analytic_account_id', def: 'INT DEFAULT NULL' },
    { table: 'journal_items', column: 'partner_id', def: 'INT DEFAULT NULL' },
  ];

  for (const col of columnsToAdd) {
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = '${col.table}' 
          AND COLUMN_NAME = '${col.column}'
      `);
      if (results.length === 0) {
        await sequelize.query(`ALTER TABLE \`${col.table}\` ADD COLUMN \`${col.column}\` ${col.def};`);
        // eslint-disable-next-line no-console
        console.log(`[Database] Auto-migrated missing column \`${col.column}\` on table \`${col.table}\`.`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[Database] Schema column verification note on ${col.table}.${col.column}:`, err.message);
    }
  }
}

async function startServer() {
  try {
    // 1. Ensure database exists in XAMPP/MySQL
    await ensureDatabaseExists();

    // 2. Connect & Synchronize tables
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log(`[Database] MySQL Connection established successfully on ${config.DB.HOST}:${config.DB.PORT}`);

    // Sync models with MySQL schema without altering existing columns destructively
    await sequelize.sync({ alter: false });
    // eslint-disable-next-line no-console
    console.log('[Database] Schema verified and synchronized.');

    // 2.1 Auto-migrate any new columns (budgets status, revision IDs, sequence numbers, etc.)
    await ensureSchemaColumns();

    // 3. Auto-seed initial CoA, Journals, and Admin/Test accounts if empty
    await seedDatabase();

    // 4. Start HTTP Server
    const server = app.listen(config.PORT, () => {
      // eslint-disable-next-line no-console
      console.log('================================================================');
      // eslint-disable-next-line no-console
      console.log(`   Urban Furniture Accounting & ERP Backend`);
      // eslint-disable-next-line no-console
      console.log(`   Running on: http://localhost:${config.PORT}`);
      // eslint-disable-next-line no-console
      console.log(`   Swagger API Docs: http://localhost:${config.PORT}/api/docs`);
      // eslint-disable-next-line no-console
      console.log(`   Health Check: http://localhost:${config.PORT}/api/health`);
      // eslint-disable-next-line no-console
      console.log('================================================================');
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      // eslint-disable-next-line no-console
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          // eslint-disable-next-line no-console
          console.log('[Database] MySQL connection closed.');
          process.exit(0);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[Shutdown Error]:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Fatal Startup Error]:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
