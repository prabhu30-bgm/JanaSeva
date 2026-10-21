import React, { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { Card, Button, Alert } from '@janaseva/ui';
import { ShieldCheck, ArrowRight, RotateCw, Mail } from 'lucide-react';

export function VerifyContactPage() {
  const { verifyContact, authError, clearAuthError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [localError, setLocalError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    clearAuthError();
    setLocalError('');

    if (!email.trim() || !code.trim()) {
      setLocalError('Please provide your email and 6-digit verification code.');
      return;
    }

    try {
      setSubmitting(true);
      await verifyContact({ email: email.trim(), code: code.trim() });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Auth error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setLocalError('Please enter your email to request a new code.');
      return;
    }

    try {
      setResending(true);
      setResendStatus('');
      setLocalError('');
      const res = await authService.resendVerification(email.trim());
      setResendStatus(res.message || 'Verification code resent. Check your inbox or phone.');
    } catch (err) {
      setLocalError(err.response?.data?.error?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-app)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            marginBottom: '12px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
            Verify Volunteer Contact
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Enter the 6-digit security code sent to your registered contact
          </p>
        </div>

        <Card style={{ padding: '28px 24px', boxShadow: 'var(--shadow-sm)' }}>
          {(authError || localError) && (
            <div style={{ marginBottom: '16px' }}>
              <Alert variant="error" message={localError || authError} />
            </div>
          )}

          {resendStatus && (
            <div style={{ marginBottom: '16px' }}>
              <Alert variant="success" message={resendStatus} />
            </div>
          )}

          {location.state?.message && !resendStatus && (
            <div style={{ marginBottom: '16px' }}>
              <Alert variant="info" message={location.state.message} />
            </div>
          )}

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Registered Email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                6-Digit Security Code (OTP)
              </label>
              <input
                type="text"
                className="input"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '22px',
                  letterSpacing: '8px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-family-mono)'
                }}
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'center' }}>
                Code expires in 10 minutes. 3 attempts maximum.
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={<ArrowRight size={16} />}
              style={{ width: '100%', marginTop: '6px' }}
            >
              Verify & Enter Portal
            </Button>
          </form>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: '13px'
          }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <RotateCw size={13} className={resending ? 'animate-spin' : ''} />
              Resend Code
            </button>

            <NavLink to="/login" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Back to Sign In
            </NavLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default VerifyContactPage;
