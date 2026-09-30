// Access-control middleware shared by every route in this service.
// verifyToken: confirms the caller presented a valid, unexpired access token
//   signed with our JWT_ACCESS_SECRET. This is checked here (not only at the
//   API Gateway) so the service is safe to call directly too - "defense in
//   depth" against Broken Access Control.
// requireRole: enforces role-based authorization for a given route.
const { verifyAccessToken } = require('../services/authService');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role, fullName: decoded.fullName };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role privileges' });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };
