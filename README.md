# JanaSeva Platform

> **A secure, professional, community-driven resource redistribution platform connecting contributors, volunteers, and local Hubs.**

---

## 📖 Architecture & Design Documentation

All foundational blueprints, technical architecture, screen specifications, visual tokens, and security foundations have been comprehensively defined and implemented:

1. [Product Blueprint v1.0](file:///c:/Desktop/MCA_Project/docs/product-blueprint.md): Vision, objectives, core workflows, inventory invariants, and Phase 1 boundaries.
2. [Application Architecture & Module Map](file:///c:/Desktop/MCA_Project/docs/application-architecture.md): System topology, 3 application boundaries, shared domain engines, and database models.
3. [Screen-by-Screen Blueprint](file:///c:/Desktop/MCA_Project/docs/screen-blueprint.md): Complete page hierarchy, wireframes, component breakdown, and UI state specifications for all 3 apps.
4. [Visual Design System](file:///c:/Desktop/MCA_Project/docs/design-system.md): Clean editorial aesthetic, Inter typography scale, deep teal & warm saffron palette, and WCAG 2.2 AA rules.
5. [Wireframes & Visual References](file:///c:/Desktop/MCA_Project/docs/wireframes-and-visual-references.md): 12-column layout grids, ASCII wireframes, and high-fidelity visual mockups for key screens.
6. [Security, Permissions & Workflows](file:///c:/Desktop/MCA_Project/docs/security-and-workflows.md): Kiosk zero-trust design, Maker-Checker dual authorization, independent dispute reviews, non-custodial beneficiary privacy, and atomic quantity ledger.
7. [Backend Foundation & Security](file:///c:/Desktop/MCA_Project/docs/backend-foundation.md): Modular Monolith Express backend, environment validation, Mongoose singleton manager, strict CORS, and health/readiness endpoints.

---

## 🏛️ System Structure

JanaSeva contains three distinct experiences sharing a unified backend engine:

```text
                    JANASEVA PLATFORM
                           |
          +----------------+----------------+
          |                |                |
     VOLUNTEER APP     HUB TERMINAL     ADMIN DASHBOARD
          |                |                |
          +----------------+----------------+
                           |
                     Shared API Layer
                           |
        +------------------+------------------+
        |                  |                  |
   Authentication      Business Rules     Notifications
        |                  |                  |
        +------------------+------------------+
                           |
                    MongoDB Database
```

### The Three Applications:
- **Volunteer Application (`apps/volunteer-web`)**: Empowering responsive PWA for discovery, 3 km synchronized map, reservations, custody ledger, and distribution logging.
- **Hub Terminal (`apps/hub-terminal`)**: Kiosk-hardened self-service station on Hub laptops featuring QR scanning, ephemeral 45-second memory sessions, dynamic condition checklists, and physical capacity guards.
- **Admin Dashboard (`apps/admin-web`)**: Actionable operational command center featuring an urgent SLA-waiting queue, Maker-Checker dual approvals, multi-bucket inventory matrix, and immutable audit logs.

---

## 🛠️ Backend Quick Start

### 1. Install Dependencies
```bash
npm --prefix backend install
```

### 2. Environment Setup
```bash
# Copy template into active environment file (ignored by Git)
cp backend/.env.example backend/.env
```

### 3. Run Development Server
```bash
npm run dev
# Server listens at http://localhost:5000
# Liveness endpoint:  http://localhost:5000/api/health
# Readiness endpoint: http://localhost:5000/api/health/ready
```

### 4. Run Automated Test Suite
```bash
npm test
# Executes Jest test suite covering health, readiness, CORS, errors, and env validation
```

---

## 🚀 Implementation Roadmap

1. ✅ Product Definition & Architecture Specifications (`docs/`)
2. ✅ Backend Foundation & Security Infrastructure (`backend/`)
3. 🔄 Shared Domain Engine & Atomic Multi-Bucket Inventory Store
4. 🔄 Authentication, Verification & Ephemeral Kiosk Session Services
5. 🔄 Volunteer Application Shell & 3 km Discovery Map
6. 🔄 Hub Self-Service Kiosk Terminal with QR Auth
7. 🔄 Admin Operational Dashboard & Maker-Checker Queue
8. 🔄 End-to-End System Validation & Integrity Invariants
