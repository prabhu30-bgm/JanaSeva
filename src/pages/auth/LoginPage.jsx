import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Alert, JanaSevaLogo } from '@janaseva/ui';
import { LogIn, Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const { login, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    setLocalError('');

    if (!email.trim() || !password) {
      setLocalError('Please enter both email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);

      if (user.role === 'admin' || user.role === 'super_admin') {
        // Redirect administrator directly to integrated Admin Console
        localStorage.setItem('janaseva_admin', JSON.stringify(user));
        navigate('/admin/overview');
      } else {
        // Regular community user / volunteer -> move to volunteer dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      // Handled by AuthContext authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAF9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 16px',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <NavLink to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
            <JanaSevaLogo size={42} showTagline={true} />
          </NavLink>
        </div>

        {/* Unified Login Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '36px 30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E5E7EB'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              Enter your email and password to access your account.
            </p>
          </div>

          {(authError || localError) && (
            <div style={{ marginBottom: '18px' }}>
              <Alert variant="error" message={localError || authError} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '44px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                <NavLink
                  to="/forgot-password"
                  style={{
                    fontSize: '12px',
                    color: '#0F766E',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Forgot Password?
                </NavLink>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '44px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={<LogIn size={16} />}
              style={{
                width: '100%',
                borderRadius: '9999px',
                height: '44px',
                marginTop: '6px',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)'
              }}
            >
              Sign In
            </Button>
          </form>

          {/* Sign up prompt */}
          <div
            style={{
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid #F3F4F6',
              textAlign: 'center',
              fontSize: '13px',
              color: '#6B7280'
            }}
          >
            <span>Don&apos;t have an account? </span>
            <NavLink
              to="/register"
              style={{
                color: '#0F766E',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Sign-up
            </NavLink>
          </div>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <NavLink to="/" style={{ color: '#6B7280', fontSize: '12px', textDecoration: 'none' }}>
            ← Back to Home
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
