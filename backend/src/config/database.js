const mongoose = require('mongoose');
const { sanitizeDatabaseUri } = require('../shared/utils/sanitize');

/**
 * Reusable MongoDB Connection Manager (Singleton Pattern)
 */
class Database {
  constructor() {
    this._isConnected = false;
    this._connectionPromise = null;

    // Listen to connection state changes
    mongoose.connection.on('connected', () => {
      this._isConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
      this._isConnected = false;
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[MongoDB] Database disconnected. Reconnection will be attempted automatically.');
      }
    });

    mongoose.connection.on('error', (err) => {
      this._isConnected = false;
      if (process.env.NODE_ENV !== 'test') {
        console.error('[MongoDB] Connection error:', err.message);
      }
    });

    mongoose.connection.on('reconnected', () => {
      this._isConnected = true;
      if (process.env.NODE_ENV !== 'test') {
        console.log('[MongoDB] Connection re-established successfully.');
      }
    });
  }

  /**
   * Connects to MongoDB using Mongoose
   * @param {string} uri - MongoDB connection string
   * @param {object} options - Optional mongoose connect options
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(uri, options = {}) {
    // If already connected, return existing connection
    if (this._isConnected && mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // If connection in progress, reuse promise
    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    const sanitizedUri = sanitizeDatabaseUri(uri);

    const defaultOptions = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production',
      ...options
    };

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[MongoDB] Connecting to database at ${sanitizedUri}...`);
    }

    this._connectionPromise = mongoose.connect(uri, defaultOptions)
      .then((m) => {
        this._isConnected = true;
        this._connectionPromise = null;
        if (process.env.NODE_ENV !== 'test') {
          console.log(`[MongoDB] Successfully connected to ${sanitizedUri}`);
        }
        return m.connection;
      })
      .catch((err) => {
        this._isConnected = false;
        this._connectionPromise = null;
        if (process.env.NODE_ENV !== 'test') {
          console.error(`[MongoDB] Failed to connect to ${sanitizedUri}:`, err.message);
        }
        throw err;
      });

    return this._connectionPromise;
  }

  /**
   * Closes database connection gracefully
   */
  async disconnect() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this._isConnected = false;
      this._connectionPromise = null;
      if (process.env.NODE_ENV !== 'test') {
        console.log('[MongoDB] Connection closed gracefully.');
      }
    }
  }

  /**
   * Returns current connection state for health/readiness checks
   * Mongoose readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
   */
  getConnectionState() {
    const readyState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: readyState === 1,
      state: states[readyState] || 'unknown',
      readyState
    };
  }
}

// Export singleton instance
module.exports = new Database();
