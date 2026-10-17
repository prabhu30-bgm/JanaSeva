const cors = require('cors');
const ApiError = require('../shared/utils/apiError');
const ErrorCodes = require('../shared/constants/errorCodes');

/**
 * Creates configured CORS middleware restricted to explicitly allowed origins
 * @param {Array<string>} allowedOrigins - List of permitted origins
 */
function configureCors(allowedOrigins = []) {
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server or tests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is explicitly allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Origin not permitted
      const corsError = new ApiError(
        403,
        `Origin '${origin}' is not permitted by CORS policy.`,
        ErrorCodes.CORS_NOT_ALLOWED
      );
      return callback(corsError, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Hub-Device-Token'],
    credentials: true,
    maxAge: 86400 // 24 hours preflight cache
  };

  return cors(corsOptions);
}

module.exports = configureCors;
