import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Card } from '@janaseva/ui';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, requireVerified = true }) {
  const { user, isAuthenticated, isVerified, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-app)',
        gap: '16px'
      }}>
        <Spinner size="lg" />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          Verifying secure volunteer session...
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login preserving intent
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account suspended -> block operations
  if (user.status === 'suspended') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--color-bg-app)'
      }}>
        <Card style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-error-soft, #FEE2E2)',
            color: 'var(--color-error, #DC2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Account Suspended
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            Your volunteer account has been temporarily placed on hold by the JanaSeva administration. For assistance, contact support at <strong>support@janaseva.org</strong> or visit your nearest Hub coordinator.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn btn-secondary btn-md"
            style={{ width: '100%' }}
          >
            Return to Login
          </button>
        </Card>
      </div>
    );
  }

  // Unverified contact -> redirect to OTP verification screen
  if (requireVerified && !user.isContactVerified) {
    return <Navigate to="/verify-contact" state={{ email: user.email }} replace />;
  }

  return children;
}

export default ProtectedRoute;
