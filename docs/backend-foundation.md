# JanaSeva — Backend Foundation & Security Specification

**Document:** 06 — Backend Foundation & Security  
**Version:** 1.0  
**Status:** Completed Architecture Step 2  
**Applies to:** Shared Backend for Volunteer App, Hub Terminal, and Admin Dashboard

---

## 1. Backend Architecture

JanaSeva implements a single, shared **Modular Monolith** Node.js and Express backend that powers all three application interfaces:
- **Volunteer Application** (`apps/volunteer-web`)
- **Hub Terminal** (`apps/hub-terminal`)
- **Admin Dashboard** (`apps/admin-web`)

All three applications consume this shared API and interact with the authoritative MongoDB database instance.

```text
c:\Desktop\MCA_Project\
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                # Centralized environment validation
│   │   │   └── database.js           # Reusable Mongoose singleton connection manager
│   │   ├── middleware/
│   │   │   ├── cors.js               # Strict whitelist-based CORS middleware
│   │   │   ├── errorHandler.js       # Centralized error handler with standardized JSON
│   │   │   ├── notFoundHandler.js    # Standard 404 handler for undefined routes
│   │   │   ├── rateLimiter.js        # Configurable rate limiting with custom 429 handler
│   │   │   └── requestLogger.js      # Sanitized request logging without sensitive data leaks
│   │   ├── modules/
│   │   │   └── health/               # Process liveness & database readiness checks
│   │   │       ├── health.controller.js
│   │   │       ├── health.routes.js
│   │   │       └── health.service.js
│   │   ├── routes/
│   │   │   └── index.js              # Central API route registry mounting /api
│   │   ├── shared/
│   │   │   ├── constants/
│   │   │   │   ├── errorCodes.js     # Standard application error codes
│   │   │   │   └── httpStatusCodes.js# Standard HTTP status code constants
│   │   │   └── utils/
│   │   │       ├── apiError.js       # Custom operational ApiError factory
│   │   │       ├── apiResponse.js    # Standard API success response builder
│   │   │       └── sanitize.js       # URI and payload secret redactor
│   │   ├── app.js                    # Express app factory (isolated from network ports)
│   │   └── server.js                 # Server entry point with graceful shutdown handling
│   ├── tests/
│   │   ├── cors.test.js              # CORS origin validation tests
│   │   ├── env.test.js               # Configuration and validation tests
│   │   ├── errorHandling.test.js     # 404, malformed JSON, and ApiError tests
│   │   └── health.test.js            # Liveness and readiness tests
│   ├── .env.example                  # Safe configuration template
│   ├── .gitignore                    # Git ignore for dependencies and local secrets
│   └── package.json                  # Backend dependencies and scripts
```

---

## 2. Environment Variables & Validation

Configuration is validated at process startup using `backend/src/config/env.js`. If any required environment variable is missing or malformed, the process fails fast with an explicit descriptive error before binding to ports or attempting connections.

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | Number | `5000` | Port on which the Express server listens (1–65535). |
| `NODE_ENV` | String | `development` | Environment mode (`development`, `test`, `production`). |
| `MONGODB_URI` | String | Required | Connection string starting with `mongodb://` or `mongodb+srv://`. |
| `JWT_SECRET` | String | Required | Secret for signing tokens. Enforces $\ge 32$ characters in production. |
| `ALLOWED_ORIGINS` | String | Local defaults | Comma-separated list of permitted frontend origins. |
| `RATE_LIMIT_WINDOW_MS`| Number | `900000` (15m) | Rate limiting window in milliseconds. |
| `RATE_LIMIT_MAX` | Number | `100` | Maximum requests permitted per window per IP. |

> **Security Rule:** Real `.env` files are strictly excluded from version control via `.gitignore`. The repository maintains a sanitized `backend/.env.example` with clear placeholders.

---

## 3. MongoDB Connection Management

The database connection is managed by a singleton in `backend/src/config/database.js`:
- Uses Mongoose with connection pooling and timeouts (`serverSelectionTimeoutMS: 5000`, `connectTimeoutMS: 10000`).
- Sanitizes connection URIs before logging (`sanitizeDatabaseUri`) so credentials are never leaked.
- Attaches event listeners for `error`, `disconnected`, and `reconnected` state transitions.
- Implements graceful shutdown: intercepts `SIGTERM` and `SIGINT` signals, closes the HTTP listener, and safely terminates database connections.
- Exposes `getConnectionState()` for real-time readiness reporting.

---

## 4. Allowed Frontend Origins & Strict CORS Policy

CORS is strictly configured via `backend/src/middleware/cors.js`:
- Origins are checked against `config.cors.allowedOrigins` (e.g., `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`).
- Disallowed origins are rejected with HTTP 403 and code `CORS_NOT_ALLOWED`.
- Requests with no `Origin` header (such as server-to-server calls or automated tests) are safely permitted.
- Permissive wildcards (`*`) are disallowed.

---

## 5. Development & Testing Commands

### Install Dependencies
```bash
# From workspace root
npm --prefix backend install
```

### Run Server in Development
```bash
# Starts backend server with Node watch mode
npm --prefix backend run dev
# Or from root:
npm run dev
```

### Run Automated Tests
```bash
# Runs full Jest test suite with Supertest
npm --prefix backend test
# Or from root:
npm test
```

---

## 6. Health & Readiness Endpoints

The backend provides two distinct endpoints under `/api/health`:

### A. Process Liveness (`GET /api/health`)
- **Purpose**: Verifies that the Node.js application process is running and responding to HTTP requests.
- **Status Code**: `200 OK`
- **Response Format**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 142,
    "timestamp": "2026-10-17T14:45:28.332Z"
  }
}
```

### B. Service Readiness (`GET /api/health/ready`)
- **Purpose**: Verifies that the backend is ready to accept and serve traffic requiring database persistence.
- **Status Codes**:
  - `200 OK` when the database connection is active (`readyState === 1`).
  - `503 Service Unavailable` when the database is connecting, disconnecting, or offline.
- **Ready Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "ready": true,
    "database": {
      "status": "connected"
    },
    "timestamp": "2026-10-17T14:45:45.330Z"
  }
}
```
- **Not Ready Response (503 Service Unavailable)**:
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Backend is not ready to serve database-dependent requests."
  },
  "data": {
    "ready": false,
    "database": {
      "status": "disconnected"
    },
    "timestamp": "2026-10-17T14:45:50.102Z"
  }
}
```

> **Distinction:** Liveness probes (e.g. in Kubernetes/Docker) monitor if the process crashed and should be restarted. Readiness probes determine whether ingress traffic should be routed to this instance based on whether dependencies (MongoDB) are available.

---

## 7. Error Handling & API Conventions

All endpoints adhere to standardized JSON envelopes:

### Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_CONSTANT",
    "message": "Human-readable explanation of error",
    "details": [ ... ]
  }
}
```

### Handled Error Scenarios
- **Malformed JSON (400 Bad Request)**: Returns code `MALFORMED_JSON` when request body contains unparsable JSON.
- **Route Not Found (404 Not Found)**: Returns code `NOT_FOUND` with path details.
- **CORS Rejected (403 Forbidden)**: Returns code `CORS_NOT_ALLOWED`.
- **Rate Limit Exceeded (429 Too Many Requests)**: Returns code `RATE_LIMIT_EXCEEDED`.
- **Internal Server Errors (500)**: Generic safe message in production without leaking internal stack traces.

---

## 8. Security Foundations Implemented

1. **Helmet Security Headers**: Configured with strict Content Security Policy, HSTS, frameguard, and disabled `x-powered-by`.
2. **Payload Size Guard**: Body parsing is limited to `10kb` to prevent memory exhaustion and DoS attacks.
3. **Sensitive Data Redaction**: Loggers automatically scrub fields matching `password`, `token`, `secret`, `otp`, `authorization`, etc.
4. **Isolated App Construction**: `app.js` is separated from `server.js`, enabling automated testing via Supertest without binding to network ports.
5. **No Hardcoded Credentials**: Secrets and connection strings are strictly injected via validated environment variables.

---

## 9. Security Features Deliberately Deferred to Later Steps

In accordance with Step 2 scope boundaries, the following features are planned for subsequent steps:
- **Authentication Module**: Volunteer OTP verification, password hashing with Argon2/Bcrypt, and short-lived Kiosk session tokens.
- **RBAC & Authorization Middleware**: Role enforcement (`Volunteer`, `HubKiosk`, `OpsAdmin`, `SuperAdmin`).
- **Resource Level Authorizers**: Ensuring volunteers can only update their own records and collection plans.
- **Dual-Approval Engine**: "Maker-Checker" validation enforcing `Requester != Approver` on high-impact administrative actions.
- **Atomic Multi-Bucket Inventory Mutations**: Database transaction boundary for atomic reservations and capacity checks.
