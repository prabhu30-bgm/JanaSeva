const HttpStatusCodes = require('../shared/constants/httpStatusCodes');
const ErrorCodes = require('../shared/constants/errorCodes');

/**
 * 404 Not Found Middleware
 * Handles requests to endpoints that do not exist.
 */
function notFoundHandler(req, res, next) {
  res.status(HttpStatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: `Cannot ${req.method} ${req.originalUrl || req.url} - Endpoint not found.`
    }
  });
}

module.exports = notFoundHandler;
