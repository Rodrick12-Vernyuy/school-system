// Centralized error handler. Never leaks stack traces or internals to the
// client; logs full detail server-side (without secrets) for debugging.
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[academic-service] ${req.method} ${req.originalUrl} ->`, err.message);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
}

module.exports = { notFoundHandler, errorHandler };
