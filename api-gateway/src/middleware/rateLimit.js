// Two-tier rate limiting:
//  - generalLimiter: broad protection for every request that passes through
//    the gateway (the single public entry point).
//  - authLimiter: a much stricter limit specifically on /auth/login, since
//    login is the highest-value target for credential-stuffing / brute
//    force attacks. This is on top of the per-account lockout implemented
//    in the Academic Service itself (defense in depth).
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

module.exports = { generalLimiter, authLimiter };
