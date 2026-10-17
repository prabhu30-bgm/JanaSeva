const rateLimit = require('express-rate-limit');
const HttpStatusCodes = require('../shared/constants/httpStatusCodes');
const ErrorCodes = require('../shared/constants/errorCodes');

/**
 * Creates standardized rate limiting middleware
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting during automated tests to avoid artificial throttling
    skip: () => process.env.NODE_ENV === 'test',
    handler: (req, res) => {
      res.status(HttpStatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: ErrorCodes.RATE_LIMIT_EXCEEDED,
          message: 'Too many requests from this IP, please try again later.'
        }
      });
    }
  });
}

module.exports = createRateLimiter;
