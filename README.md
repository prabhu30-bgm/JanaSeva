# JanaSeva — Community Resource Redistribution Platform

> A modern, responsive web application for managing community resource redistribution, connecting donors, volunteers, and local hubs.

---

## 📁 Project Structure

The project follows a clean, single-application structure:

```text
MCA_Project/
├── public/                  # Static assets
│   └── logo.png
├── src/
│   ├── components/          # Reusable UI & Layout Components
│   │   ├── ui/              # Design System (Button, Card, Modal, Alert, Form, Logo)
│   │   ├── AdminShell.jsx   # Admin console layout shell
│   │   ├── VolunteerShell.jsx # Volunteer portal layout shell
│   │   ├── HubKioskShell.jsx # Self-service hub kiosk terminal
│   │   ├── OnboardingModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/             # React Context (AuthContext)
│   ├── pages/               # Application Pages
│   │   ├── admin/           # Admin pages (Overview, Hubs, Inventory, Approvals, Users)
│   │   ├── auth/            # Auth pages (Login, Register, Verify, Forgot Password)
│   │   ├── DashboardPage.jsx
│   │   ├── DonatePage.jsx
│   │   ├── ExploreHubsPage.jsx
│   │   ├── ExploreResourcesPage.jsx
│   │   ├── HubDetailPage.jsx
│   │   ├── ImpactPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── MyActivitiesPage.jsx
│   │   ├── MyReservationsPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── ResourceDetailPage.jsx
│   ├── services/            # API & WebSocket client services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── catalogueService.js
│   │   ├── hubService.js
│   │   ├── socket.js
│   │   └── volunteerService.js
│   ├── styles/              # Global CSS & theme styling
│   │   ├── admin.css
│   │   ├── hub.css
│   │   └── volunteer.css
│   ├── App.jsx              # Main App component with React Router
│   └── main.jsx             # React entry point
├── index.html               # Main HTML document
├── package.json             # Single root package configuration
├── vite.config.js           # Vite build & development configuration
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 1. Installation
Install all dependencies with a single command:
```bash
npm install
```

### 2. Run Development Server
Start the development server:
```bash
npm run dev
```
The application will be running at:
- **Web Portal (Public, Volunteer, Admin)**: `http://localhost:3000/`
- **Hub Kiosk Terminal**: `http://localhost:3000/hub` or `http://localhost:3000/kiosk`

### 3. Production Build
To create a production-optimized build:
```bash
npm run build
```

---

## 🌟 Key Features

- **Public Landing Page**: Clean overview of JanaSeva's mission, impact statistics, and call-to-actions.
- **Authentication**: User registration, login, phone/email verification, and password recovery.
- **Volunteer Portal**:
  - Live resource exploration with filtering by category (Food, Essentials, Clothing, Books).
  - Hub discovery with distance metrics and status badges.
  - Donation submission and reservation pass generation with QR code.
  - Distribution tracking, activity logs, and personal impact dashboard.
- **Admin Console**:
  - Operational dashboard with critical metrics.
  - Dual maker-checker request approval workflow.
  - Multi-hub inventory management and batch tracking.
  - Volunteer user directory and verification.
- **Hub Kiosk Terminal** (`/hub`):
  - Kiosk-ready interface with QR code scanner support for on-site item handovers.
  - Donation intake and collection verification.
