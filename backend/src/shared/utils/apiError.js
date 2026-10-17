const HttpStatusCodes = require('../constants/httpStatusCodes');
const ErrorCodes = require('../constants/errorCodes');

/**
 * Custom Operational API Error
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {string} code - Internal error code
   * @param {Array|object|null} details - Structured validation/error details
   */
  constructor(
    statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message = 'An unexpected error occurred',
    code = ErrorCodes.INTERNAL_SERVER_ERROR,
    details = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null, code = ErrorCodes.VALIDATION_ERROR) {
    return new ApiError(HttpStatusCodes.BAD_REQUEST, message, code, details);
  }

  static unauthorized(message = 'Authentication required', code = ErrorCodes.UNAUTHORIZED) {
    return new ApiError(HttpStatusCodes.UNAUTHORIZED, message, code);
  }

  static forbidden(message = 'Access denied', code = ErrorCodes.FORBIDDEN) {
    return new ApiError(HttpStatusCodes.FORBIDDEN, message, code);
  }

  static notFound(message = 'Resource not found', code = ErrorCodes.NOT_FOUND) {
    return new ApiError(HttpStatusCodes.NOT_FOUND, message, code);
  }

  static conflict(message = 'Conflict with current state', details = null, code = ErrorCodes.CONFLICT) {
    return new ApiError(HttpStatusCodes.CONFLICT, message, code, details);
  }

  static tooManyRequests(message = 'Rate limit exceeded. Please try again later.', code = ErrorCodes.RATE_LIMIT_EXCEEDED) {
    return new ApiError(HttpStatusCodes.TOO_MANY_REQUESTS, message, code);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable', code = ErrorCodes.SERVICE_UNAVAILABLE) {
    return new ApiError(HttpStatusCodes.SERVICE_UNAVAILABLE, message, code);
  }

  static internal(message = 'Internal server error', code = ErrorCodes.INTERNAL_SERVER_ERROR) {
    return new ApiError(HttpStatusCodes.INTERNAL_SERVER_ERROR, message, code);
  }
}

module.exports = ApiError;
