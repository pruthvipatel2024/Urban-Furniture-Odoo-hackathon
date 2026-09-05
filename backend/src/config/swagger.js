const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./env');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Urban Furniture — ERP & Double-Entry Accounting API',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for the Urban Furniture Accounting & Inventory Management System (Odoo Hackathon).',
      contact: {
        name: 'Urban Furniture Engineering Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Local Development Server (Node/Express + MySQL/XAMPP)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT token: `Bearer <your_token>`',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
