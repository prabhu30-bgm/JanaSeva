const database = require('../../config/database');

/**
 * Health & Readiness Service
 */
class HealthService {
  /**
   * Returns process liveness status
   */
  getHealth() {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Returns database readiness status
   */
  getReadiness() {
    const dbState = database.getConnectionState();

    return {
      ready: dbState.isConnected,
      database: {
        status: dbState.state
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new HealthService();
