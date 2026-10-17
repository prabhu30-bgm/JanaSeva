const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates and normalizes environment variables
 * @param {object} env - Environment object (defaults to process.env)
 * @returns {object} Validated configuration object
 */
function validateEnv(env = process.env) {
  const errors = [];

  const NODE_ENV = env.NODE_ENV || 'development';
  const isProd = NODE_ENV === 'production';
  const isTest = NODE_ENV === 'test';

  // PORT validation
  let PORT = 5000;
  if (env.PORT) {
    const parsedPort = parseInt(env.PORT, 10);
    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      errors.push('PORT must be a valid port number between 1 and 65535.');
    } else {
      PORT = parsedPort;
    }
  }

  // MONGODB_URI validation
  let MONGODB_URI = env.MONGODB_URI;
  if (MONGODB_URI === undefined) {
    MONGODB_URI = isTest ? 'mongodb://127.0.0.1:27017/janaseva_test' : '';
  }
  if (!MONGODB_URI) {
    errors.push('MONGODB_URI is required.');
  } else if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://.');
  }

  // JWT_SECRET validation
  let JWT_SECRET = env.JWT_SECRET;
  if (JWT_SECRET === undefined) {
    JWT_SECRET = isTest ? 'test_jwt_secret_must_be_at_least_32_characters_long' : '';
  }
  if (!JWT_SECRET) {
    errors.push('JWT_SECRET is required.');
  } else if (isProd && JWT_SECRET.length < 32) {
    errors.push('In production, JWT_SECRET must be at least 32 characters long.');
  }

  // ALLOWED_ORIGINS validation
  let allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  if (env.ALLOWED_ORIGINS) {
    allowedOrigins = env.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    if (allowedOrigins.length === 0) {
      errors.push('ALLOWED_ORIGINS must contain at least one valid origin.');
    }
  }

  // RATE_LIMIT configuration
  const rateLimitWindowMs = parseInt(env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
  const rateLimitMax = parseInt(env.RATE_LIMIT_MAX, 10) || 100;

  if (errors.length > 0) {
    const errorMessage = `Environment Configuration Validation Failed:\n- ${errors.join('\n- ')}`;
    const configError = new Error(errorMessage);
    configError.code = 'CONFIG_ERROR';
    configError.errors = errors;
    throw configError;
  }

  return Object.freeze({
    env: NODE_ENV,
    isProduction: isProd,
    isDevelopment: NODE_ENV === 'development',
    isTest,
    port: PORT,
    database: {
      uri: MONGODB_URI
    },
    auth: {
      jwtSecret: JWT_SECRET
    },
    cors: {
      allowedOrigins
    },
    rateLimit: {
      windowMs: rateLimitWindowMs,
      max: rateLimitMax
    }
  });
}

// Instantiate default configuration
let config;
try {
  config = validateEnv(process.env);
} catch (err) {
  // If running in test runner or special context, don't crash module evaluation,
  // but report failure when accessed if not valid
  config = { _error: err };
}

module.exports = {
  config,
  validateEnv
};
