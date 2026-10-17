const healthService = require('./health.service');
const ApiResponse = require('../../shared/utils/apiResponse');
const HttpStatusCodes = require('../../shared/constants/httpStatusCodes');
const ErrorCodes = require('../../shared/constants/errorCodes');

/**
 * Health & Readiness Controller
 */
class HealthController {
  /**
   * GET /api/health
   * Process liveness check
   */
  checkHealth(req, res) {
    const health = healthService.getHealth();
    return res.status(HttpStatusCodes.OK).json(ApiResponse.success(health));
  }

  /**
   * GET /api/health/ready
   * Service readiness check (database connectivity)
   */
  checkReadiness(req, res) {
    const readiness = healthService.getReadiness();

    if (!readiness.ready) {
      return res.status(HttpStatusCodes.SERVICE_UNAVAILABLE).json({
        success: false,
        error: {
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: 'Backend is not ready to serve database-dependent requests.'
        },
        data: readiness
      });
    }

    return res.status(HttpStatusCodes.OK).json(ApiResponse.success(readiness));
  }
}

module.exports = new HealthController();
