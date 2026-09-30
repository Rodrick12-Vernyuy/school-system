// API Gateway routing table. The frontend only ever talks to the gateway;
// the gateway forwards ("proxies") each request to the correct downstream
// microservice.
//
// Implementation note: pathRewrite is given as a FUNCTION that reads
// req.originalUrl rather than the `path` argument, because Express already
// strips the app.use() mount prefix from req.url before this middleware
// runs - relying on that undocumented-feeling interaction is a common
// source of subtle proxy bugs, so we recompute the target path explicitly
// and deterministically from the full original URL instead.
const { createProxyMiddleware } = require('http-proxy-middleware');

const ACADEMIC_URL = process.env.ACADEMIC_SERVICE_URL || 'http://localhost:4001';
const FINANCE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:4002';
const HR_URL = process.env.HR_SERVICE_URL || 'http://localhost:4003';

function proxyFor(target, stripPrefix, replacementPrefix = '') {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (_path, req) => req.originalUrl.replace(stripPrefix, replacementPrefix),
    onError: (err, req, res) => {
      console.error(`[api-gateway] proxy error for ${req.originalUrl}:`, err.message);
      res.status(502).json({ error: 'Upstream service unavailable' });
    },
    logLevel: 'silent',
  });
}

module.exports = {
  // academic-service, finance-service, and hr-service each mount their
  // routes at their own root (e.g. "/students"), so the full "/api/v1/x"
  // prefix is stripped entirely.
  academicProxy: proxyFor(ACADEMIC_URL, '/api/v1/academic'),
  financeProxy: proxyFor(FINANCE_URL, '/api/v1/finance'),
  hrProxy: proxyFor(HR_URL, '/api/v1/hr'),
  // academic-service mounts auth routes at "/auth" (not at root), so
  // "/api/v1/auth" is rewritten to "/auth", keeping that segment.
  authProxy: proxyFor(ACADEMIC_URL, '/api/v1/auth', '/auth'),
};
