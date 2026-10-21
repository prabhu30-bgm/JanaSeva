import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Alert, JanaSevaLogo } from '@janaseva/ui';
import { UserPlus, Lock, Mail, Phone, User } from 'lucide-react';

export function RegisterPage() {
  const { register, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    setLocalError('');

    if (!formData.agreeTerms) {
      setLocalError('Please agree to the Terms and Conditions to proceed.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    let formattedPhone = formData.phone.trim();
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
    }

    try {
      setSubmitting(true);
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formattedPhone,
        password: formData.password
      });

      if (res?.requiresVerification) {
        navigate('/verify-contact', {
          state: {
            email: formData.email.trim(),
            phone: formattedPhone,
            message: 'Account registered! Please enter the 6-digit verification code.'
          }
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Handled by context
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
        padding: '32px 16px'
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <NavLink to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
            <JanaSevaLogo size={42} showTagline={true} />
          </NavLink>
        </div>

        {/* Register Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E5E7EB'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Join our community of changemakers.
            </p>
          </div>

          {(authError || localError) && (
            <div style={{ marginBottom: '18px' }}>
              <Alert variant="error" message={localError || authError} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="name"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '42px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px'
                  }}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '42px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px'
                  }}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Mobile phone
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '42px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px'
                  }}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Password (min 8 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  name="password"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '42px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px'
                  }}
                  placeholder="Create your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    width: '100%',
                    borderRadius: '10px',
                    height: '42px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px'
                  }}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563', marginTop: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{ accentColor: 'var(--color-primary, #0F766E)', width: '16px', height: '16px' }}
              />
              <span>I agree to the Terms and Conditions</span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={<UserPlus size={16} />}
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
              Create Account
            </Button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
            Already have an account?{' '}
            <NavLink to="/login" style={{ color: 'var(--color-primary, #0F766E)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </NavLink>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <NavLink to="/" style={{ color: '#6B7280', fontSize: '12px', textDecoration: 'none' }}>
            ← Back to Home
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
