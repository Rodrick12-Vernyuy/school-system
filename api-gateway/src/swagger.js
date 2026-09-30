const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduERP API Gateway',
      version: '1.0.0',
      description: `The single public entry point for the EduERP frontend.
Routes:
- /api/v1/auth/*      -> Academic Service (identity/auth)
- /api/v1/academic/*  -> Academic Service
- /api/v1/finance/*   -> Finance & Marketing Service
- /api/v1/hr/*        -> Administration & HR Service

Each downstream service publishes its own detailed OpenAPI docs at its
own /docs endpoint (see each service's README). This gateway document
describes the routing contract only.`,
    },
    servers: [{ url: '/' }],
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
