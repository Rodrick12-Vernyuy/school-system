// Finance Service does not own user accounts - it trusts JWTs issued by the
// Academic Service's /auth endpoints, verified here with the SAME shared
// JWT_ACCESS_SECRET (set via environment variable in every service). This
// is standard for microservices: identity is centralized, verification is
// distributed so each service stays independently deployable and safe to
// call directly (defense in depth against Broken Access Control).
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret');
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role, fullName: decoded.fullName };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role privileges' });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };
