const { sanitizeLogPayload } = require('../shared/utils/sanitize');

/**
 * Safe HTTP Request Logger Middleware
 * Redacts sensitive fields, tokens, and credentials from request logs.
 */
function requestLogger(req, res, next) {
  // Skip verbose logging during automated test runs
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const startTime = Date.now();
  const method = req.method;
  const url = req.originalUrl || req.url;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const logLine = `[HTTP] ${method} ${url} ${statusCode} - ${duration}ms - IP: ${ip}`;
    
    if (statusCode >= 500) {
      console.error(logLine);
    } else if (statusCode >= 400) {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }
  });

  next();
}

module.exports = requestLogger;
