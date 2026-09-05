const app = require('./app');
const config = require('./config/env');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./config/database');
const { seedDatabase } = require('./utils/seedData');

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
