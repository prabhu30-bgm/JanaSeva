/**
 * Utility for sanitizing sensitive data before logging or exposure
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'token',
  'jwt',
  'secret',
  'otp',
  'code',
  'authorization',
  'auth',
  'cookie',
  'refresh_token',
  'refreshtoken',
  'access_token',
  'accesstoken',
  'api_key',
  'apikey'
]);

/**
 * Strips credentials (username/password) from database URIs for safe logging
 * @param {string} uri - Raw connection string
 * @returns {string} Sanitized connection string
 */
function sanitizeDatabaseUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  try {
    // Matches mongodb://user:pass@host... or similar URIs
    return uri.replace(/\/\/(.*?)@/, '//***:***@');
  } catch {
    return '***';
  }
}

/**
 * Recursively redacts sensitive keys from objects for logging
 * @param {*} data - Raw data
 * @returns {*} Sanitized copy of data
 */
function sanitizeLogPayload(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogPayload(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeLogPayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = {
  sanitizeDatabaseUri,
  sanitizeLogPayload
};
