const HttpStatusCodes = require('../shared/constants/httpStatusCodes');
const ErrorCodes = require('../shared/constants/errorCodes');

/**
 * Centralized Application Error Handling Middleware
 * Ensures all errors adhere to the standardized API error structure.
 */
function errorHandler(err, req, res, next) {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Handle Malformed JSON parsing error (SyntaxError with body property from express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: ErrorCodes.MALFORMED_JSON,
        message: 'Malformed JSON payload in request body.'
      }
    });
  }

  // 2. Handle Custom Operational ApiErrors
  if (err.name === 'ApiError') {
    const response = {
      success: false,
      error: {
        code: err.code || ErrorCodes.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    };

    if (err.details) {
      response.error.details = err.details;
    }

    return res.status(err.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR).json(response);
  }

  // 3. Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));

    return res.status(HttpStatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Database schema validation failed.',
        details
      }
    });
  }

  // 4. Handle Mongoose CastError (invalid ObjectId or type)
  if (err.name === 'CastError') {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: `Invalid identifier format for field '${err.path}'.`
      }
    });
  }

  // 5. Handle CORS errors
  if (err.code === ErrorCodes.CORS_NOT_ALLOWED) {
    return res.status(HttpStatusCodes.FORBIDDEN).json({
      success: false,
      error: {
        code: ErrorCodes.CORS_NOT_ALLOWED,
        message: err.message
      }
    });
  }

  // 6. Generic/Unhandled Internal Server Errors
  // Log unexpected errors
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', err);
  }

  const statusCode = err.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
  const message = isProduction
    ? 'An unexpected internal server error occurred.'
    : err.message || 'An unexpected internal server error occurred.';

  const errorResponse = {
    success: false,
    error: {
      code: err.code || ErrorCodes.INTERNAL_SERVER_ERROR,
      message
    }
  };

  // Only include stack trace in non-production environments when specifically requested
  if (!isProduction && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  return res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
