const { config } = require('./config/env');
const database = require('./config/database');
const { app } = require('./app');

// If configuration failed validation, terminate with descriptive error
if (config._error) {
  console.error('[Startup Error]', config._error.message);
  process.exit(1);
}

let server;

/**
 * Starts the JanaSeva Backend Server
 */
async function startServer() {
  try {
    // 1. Establish Database Connection
    if (config.database && config.database.uri) {
      await database.connect(config.database.uri);
    } else {
      console.warn('[Startup Warning] MONGODB_URI is not set. Database operations will not be ready.');
    }

    // 2. Start Express HTTP Server
    server = app.listen(config.port, () => {
      console.log('--------------------------------------------------');
      console.log(`JanaSeva Unified Backend API is running`);
      console.log(`Environment: ${config.env}`);
      console.log(`Port:        ${config.port}`);
      console.log(`Health:      http://localhost:${config.port}/api/health`);
      console.log(`Readiness:   http://localhost:${config.port}/api/health/ready`);
      console.log(`CORS Allowed Origins: ${config.cors.allowedOrigins.join(', ')}`);
      console.log('--------------------------------------------------');
    });

    server.on('error', (err) => {
      console.error('[Server Error]', err.message);
      process.exit(1);
    });

  } catch (err) {
    console.error('[Startup Failure]', err.message);
    process.exit(1);
  }
}

/**
 * Graceful Shutdown Handler
 * Closes HTTP listener and database connections safely on termination signals
 */
async function gracefulShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Closing server gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed.');
      try {
        await database.disconnect();
        console.log('[Shutdown] All connections terminated cleanly.');
        process.exit(0);
      } catch (err) {
        console.error('[Shutdown Error] Failed to disconnect database:', err.message);
        process.exit(1);
      }
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      console.error('[Shutdown Timeout] Forcing process termination.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});

// Launch server if run directly
if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  gracefulShutdown
};
