const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const swaggerSpec = require('./config/swagger');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const ApiResponse = require('./utils/response');
const { sequelize } = require('./models');

const path = require('path');
const app = express();

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: config.CORS_ORIGIN === '*' ? true : [config.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Urban Furniture API Documentation',
}));

// Health Check Endpoints
const healthHandler = async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  return ApiResponse.success(res, 'Urban Furniture Accounting API is running smoothly', {
    status: 'healthy',
    timestamp: new Date(),
    database: dbStatus,
    environment: config.NODE_ENV,
    version: '1.0.0',
    docs: '/api/docs',
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Master REST API Router
app.use('/api', apiRoutes);

// 404 Handler for Undefined Routes
app.use((req, res) => {
  return ApiResponse.notFound(res, `Route ${req.method} ${req.originalUrl} not found. Refer to /api/docs for valid endpoints.`, 'ROUTE_NOT_FOUND');
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
