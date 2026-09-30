require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger');
const { generalLimiter, authLimiter } = require('./middleware/rateLimit');
const verifyToken = require('./middleware/verifyToken');
const { academicProxy, financeProxy, hrProxy, authProxy } = require('./routes/proxyRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));

morgan.token('user', (req) => (req.user ? req.user.sub : 'anonymous'));
app.use(morgan(':date[iso] :method :url :status :response-time ms user=:user'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/health', verifyToken, healthRoutes);

// Apply the general rate limiter to every proxied request.
app.use('/api/v1', generalLimiter);

// Auth routes get their own stricter limiter (brute-force protection) and
// are NOT gated by verifyToken here, since login/register/refresh must be
// reachable by an unauthenticated caller. (GET /api/v1/auth/me still
// requires a token - enforced inside the Academic Service itself.)
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth', authProxy);

// Versioned, role-protected API surfaces. JWT verification happens both
// here (fail fast at the edge, avoiding a wasted round-trip to a downstream
// service for an obviously invalid token) and again inside each downstream
// service (defense in depth - each service stays safe to call directly,
// bypassing the gateway, without losing authorization enforcement).
app.use('/api/v1/academic', verifyToken, academicProxy);
app.use('/api/v1/finance', verifyToken, financeProxy);
app.use('/api/v1/hr', verifyToken, hrProxy);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[api-gateway] ${req.method} ${req.originalUrl} ->`, err.message);
  res.status(500).json({ error: 'Internal gateway error' });
});

module.exports = app;
