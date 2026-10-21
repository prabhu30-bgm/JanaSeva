import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VolunteerShell from './components/VolunteerShell';

// Public Landing Page - "keep main page as Landing Page let the user see the landing page first"
import LandingPage from './pages/LandingPage';

// Unified Authentication Pages (Admin & Community Users)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyContactPage from './pages/auth/VerifyContactPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Community / Volunteer Portal Pages
import DashboardPage from './pages/DashboardPage';
import ExploreResourcesPage from './pages/ExploreResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ExploreHubsPage from './pages/ExploreHubsPage';
import HubDetailPage from './pages/HubDetailPage';
import DonatePage from './pages/DonatePage';
import MyReservationsPage from './pages/MyReservationsPage';
import DistributionsPage from './pages/DistributionsPage';
import MyActivitiesPage from './pages/MyActivitiesPage';
import ImpactPage from './pages/ImpactPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Console Components & Pages (Integrated Governance)
import AdminShell from './components/AdminShell';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminHubsPage from './pages/admin/AdminHubsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';

// Self-Service Hub Kiosk Terminal
import HubKioskShell from './components/HubKioskShell';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. Public Landing Page - Shown FIRST */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Unified Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-contact" element={<VerifyContactPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* 3. Community / Volunteer Portal Routes */}
          <Route
            element={
              <ProtectedRoute>
                <VolunteerShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExploreResourcesPage />} />
            <Route path="/explore/:resourceId" element={<ResourceDetailPage />} />
            <Route path="/contribute" element={<DonatePage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/points" element={<ExploreHubsPage />} />
            <Route path="/hubs" element={<ExploreHubsPage />} />
            <Route path="/hubs/:hubId" element={<HubDetailPage />} />
            <Route path="/reservations" element={<MyReservationsPage />} />
            <Route path="/distributions" element={<DistributionsPage />} />
            <Route path="/activities" element={<MyActivitiesPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 4. Integrated Admin Console Routes */}
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="hubs" element={<AdminHubsPage />} />
            <Route path="points" element={<AdminHubsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="resources" element={<AdminInventoryPage />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="requests" element={<AdminApprovalsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="volunteers" element={<AdminUsersPage />} />
            <Route
              path="organizations"
              element={
                <AdminPlaceholderPage
                  title="Partner Organizations (NGOs & Shelters)"
                  description="Accreditation status, quarterly resource allocation quotas, and intake reports."
                  category="Community"
                />
              }
            />
            <Route
              path="reports"
              element={
                <AdminPlaceholderPage
                  title="Public Transparency & Impact Reports"
                  description="Generate monthly distribution certificates and donor impact statements."
                  category="Governance"
                />
              }
            />
            <Route
              path="settings"
              element={
                <AdminPlaceholderPage
                  title="System Settings & Feature Flags"
                  description="Global platform parameters, notification gateways, and Hub operational hours."
                  category="System"
                />
              }
            />
            <Route path="*" element={<Navigate to="/admin/overview" replace />} />
          </Route>

          {/* 5. Self-Service Hub Kiosk Terminal */}
          <Route path="/hub" element={<HubKioskShell />} />
          <Route path="/kiosk" element={<HubKioskShell />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
