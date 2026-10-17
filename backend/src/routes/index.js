const { Router } = require('express');
const healthRoutes = require('../modules/health/health.routes');

const apiRouter = Router();

/**
 * JanaSeva Unified API Router
 *
 * Current Active Routes:
 * - /api/health          - Liveness and readiness endpoints
 *
 * Planned Route Groups (Architecture Step 2 Blueprint):
 * - /api/auth            - Authentication, OTP verification, Kiosk session tokens
 * - /api/volunteers      - Volunteer profile, QR identity, contact updates
 * - /api/hubs            - Hub discovery (3km sync map), operating status, category capabilities
 * - /api/resources       - Category catalog, acceptance checklists, condition rules
 * - /api/donations       - Donation deposits, mandatory checklist checks, physical capacity guards
 * - /api/reservations    - Atomic stock reservations, deadlines, multi-hub collection plans
 * - /api/collections     - Hub Terminal collection confirmations, discrepancy reporting
 * - /api/distributions   - Non-PII distribution logging, volunteer custody ledger
 * - /api/admin           - Operational overview, Maker-Checker dual approvals, audit logs
 */
apiRouter.use('/health', healthRoutes);

module.exports = apiRouter;
