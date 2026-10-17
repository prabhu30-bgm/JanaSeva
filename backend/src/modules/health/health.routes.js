const { Router } = require('express');
const healthController = require('./health.controller');

const router = Router();

/**
 * Health and Readiness Endpoints
 * GET /api/health       - Process liveness check
 * GET /api/health/ready - Database readiness check
 */
router.get('/', healthController.checkHealth.bind(healthController));
router.get('/ready', healthController.checkReadiness.bind(healthController));

module.exports = router;
