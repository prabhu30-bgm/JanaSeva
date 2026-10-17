const express = require('express');
const helmet = require('helmet');
const { config } = require('./config/env');
const configureCors = require('./middleware/cors');
const requestLogger = require('./middleware/requestLogger');
const createRateLimiter = require('./middleware/rateLimiter');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const apiRouter = require('./routes');

/**
 * Creates and configures the Express application
 * @param {object} appConfig - Configuration object
 * @returns {express.Application}
 */
function createApp(appConfig = config) {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Disable x-powered-by header
  app.disable('x-powered-by');

  // 2. Cross-Origin Resource Sharing (CORS)
  app.use(configureCors(appConfig.cors ? appConfig.cors.allowedOrigins : []));

  // 3. Request Parsing with strict size limits to prevent memory exhaustion
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 4. Request Logging with sensitive data redaction
  app.use(requestLogger);

  // 5. Global Rate Limiter
  app.use(createRateLimiter({
    windowMs: appConfig.rateLimit ? appConfig.rateLimit.windowMs : 15 * 60 * 1000,
    max: appConfig.rateLimit ? appConfig.rateLimit.max : 100
  }));

  // 6. Mount API Routes under /api
  app.use('/api', apiRouter);

  // 7. Centralized 404 Handler for undefined routes
  app.use(notFoundHandler);

  // 8. Centralized Application Error Handler
  app.use(errorHandler);

  return app;
}

// Default application instance
const app = createApp();

module.exports = {
  createApp,
  app
};
