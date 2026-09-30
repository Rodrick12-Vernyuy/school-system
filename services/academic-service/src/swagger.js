const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduERP Academic Service API',
      version: '1.0.0',
      description: 'Students, courses, enrollment, grades, attendance, examinations, grade appeals, and identity/auth.',
    },
    servers: [{ url: '/api/v1/academic' }, { url: '/' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
