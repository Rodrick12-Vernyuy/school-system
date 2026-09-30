const app = require('./app');

const PORT = process.env.GATEWAY_PORT || process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[api-gateway] listening on port ${PORT}`);
  console.log(`[api-gateway] routing /api/v1/auth, /api/v1/academic, /api/v1/finance, /api/v1/hr`);
});
