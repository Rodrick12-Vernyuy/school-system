// The gateway performs a first-pass JWT check for observability and to
// reject obviously invalid/expired tokens at the edge, before they even
// reach a downstream service. Each downstream service ALSO independently
// verifies the token (see their own middleware/auth.js) - this is
// intentional defense in depth, not duplication for its own sake: any
// service must remain safe to call directly, bypassing the gateway.
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret');
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = verifyToken;
