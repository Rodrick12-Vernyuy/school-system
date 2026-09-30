const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduERP Administration & HR Service API',
      version: '1.0.0',
      description: 'Employees, recruitment, payroll (configurable CNPS/PAYE rates), QR-code attendance, leave management, performance reviews, and asset tracking. All monetary values are in FCFA.',
    },
    servers: [{ url: '/api/v1/hr' }, { url: '/' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
