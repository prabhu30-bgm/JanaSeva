import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { Card, Button, Alert } from '@janaseva/ui';
import { KeyRound, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request reset token, 2 = enter reset token & new password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [successDone, setSuccessDone] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.trim());
      setMessage(res.message || 'If an account exists, a single-use password reset link/token has been issued.');
      // If dev mode returns token or simulated token, we advance to step 2
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({ token: resetToken.trim(), newPassword });
      setSuccessDone(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
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
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
            Password Recovery
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Restore secure access to your volunteer credentials
          </p>
        </div>

        <Card style={{ padding: '28px 24px', boxShadow: 'var(--shadow-sm)' }}>
          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert variant="error" message={error} />
            </div>
          )}

          {message && (
            <div style={{ marginBottom: '16px' }}>
              <Alert variant="info" message={message} />
            </div>
          )}

          {successDone ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-soft, #D1FAE5)',
                color: 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                Password Updated Successfully
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                Your volunteer credentials have been updated. You can now sign in with your new password.
              </p>
              <NavLink to="/login" className="btn btn-primary btn-md" style={{ width: '100%' }}>
                Go to Sign In
              </NavLink>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  Registered Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%' }}
                    placeholder="volunteer@example.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={<ArrowRight size={16} />}
                style={{ width: '100%' }}
              >
                Send Password Reset Code
              </Button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <NavLink to="/login" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                  <ArrowLeft size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Back to Sign In
                </NavLink>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Reset Token / Code
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', fontFamily: 'var(--font-family-mono)' }}
                  placeholder="Paste reset token from email/admin"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%' }}
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%' }}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={<ArrowRight size={16} />}
                style={{ width: '100%', marginTop: '6px' }}
              >
                Reset Password
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Change Email / Re-request
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
