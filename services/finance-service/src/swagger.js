const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduERP Finance & Marketing Service API',
      version: '1.0.0',
      description: 'Tuition invoices (auto-generated via RabbitMQ), simulated mobile-money payments, digital receipts, expenses, financial reports, and marketing campaigns. All monetary values are in FCFA.',
    },
    servers: [{ url: '/api/v1/finance' }, { url: '/' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
