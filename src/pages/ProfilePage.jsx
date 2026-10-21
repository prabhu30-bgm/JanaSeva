import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Award,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle2,
  Camera,
  RefreshCw,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Edit3
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, Button, Modal } from '@janaseva/ui';
import { useAuth } from '../context/AuthContext';
import volunteerService from '../services/volunteerService';
import authService from '../services/authService';

export function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [qrPayload, setQrPayload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  // Modal states: null | 'personal' | 'settings'
  const [activeModal, setActiveModal] = useState(null);

  // Settings form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await volunteerService.getDashboard();
        setDashboardData(data);
      } catch (e) {
        console.error('Failed to load profile metrics:', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadQr() {
      try {
        const res = await authService.getQrIdentity();
        if (res?.payload) {
          setQrPayload(res.payload);
        }
      } catch (e) {
        // Fallback to static identifier if QR identity service is not available
      }
    }
    loadQr();
  }, [user]);

  // Handle URL hash navigation (#personal or #settings)
  useEffect(() => {
    if (window.location.hash === '#personal') {
      setActiveModal('personal');
    } else if (window.location.hash === '#settings') {
      openSettingsModal();
    }
  }, []);

  const openSettingsModal = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSettingsError(null);
    setSettingsSuccess(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setActiveModal('settings');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSettingsError(null);
    setSettingsSuccess(null);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadMsg({ type: 'error', text: 'Please select an image file (PNG, JPG, WebP).' });
      return;
    }

    try {
      setUploading(true);
      setUploadMsg(null);
      const compressedDataUrl = await compressImage(file);

      // Persist to backend database
      await authService.updateProfile({ avatarUrl: compressedDataUrl });

      // Update local AuthContext and state
      if (updateUser) {
        updateUser({ avatarUrl: compressedDataUrl });
      }

      setUploadMsg({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (err) {
      console.error('Failed to update avatar:', err);
      setUploadMsg({ type: 'error', text: 'Failed to upload photo. Please try a smaller image.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      setUploadMsg(null);
      await authService.updateProfile({ avatarUrl: null });
      if (updateUser) {
        updateUser({ avatarUrl: null });
      }
      setUploadMsg({ type: 'info', text: 'Profile picture removed.' });
    } catch (err) {
      console.error('Failed to remove avatar:', err);
      setUploadMsg({ type: 'error', text: 'Failed to remove picture.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.trim().replace(/\s+/g, '');

    // Validate name
    if (!trimmedName || trimmedName.length < 2) {
      setSettingsError('Full name must be at least 2 characters long.');
      return;
    }

    // Validate email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setSettingsError('Please provide a valid email address.');
      return;
    }

    // Validate phone
    if (!cleanPhone || cleanPhone.length < 10) {
      setSettingsError('Please provide a valid mobile number (at least 10 digits).');
      return;
    }

    // Validate password if supplied
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setSettingsError('New password must be at least 8 characters long.');
        return;
      }
      if (!formData.currentPassword) {
        setSettingsError('Current password is required to set a new password.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setSettingsError('New password and confirmation do not match.');
        return;
      }
    }

    const payload = {};
    if (trimmedName !== (user?.name || '')) {
      payload.name = trimmedName;
    }
    if (trimmedEmail !== (user?.email || '').toLowerCase()) {
      payload.email = trimmedEmail;
    }
    if (cleanPhone !== (user?.phone || '')) {
      payload.phone = cleanPhone;
    }
    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setSettingsSuccess('No changes detected. Details are up to date.');
      return;
    }

    try {
      setSavingSettings(true);
      const updatedUser = await authService.updateProfile(payload);
      if (updateUser && updatedUser) {
        updateUser(updatedUser);
      }
      setSettingsSuccess('Settings and personal details updated successfully!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setUploadMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Settings update failed:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to update settings. Please check your credentials and try again.';
      setSettingsError(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const metrics = dashboardData?.metrics || {
    donationsSubmitted: 0,
    resourcesContributed: 0,
    collectionsCompleted: 0,
    distributionsRecorded: 0
  };

  const totalPoints =
    (metrics.donationsSubmitted * 10) +
    (metrics.collectionsCompleted * 15) +
    (metrics.distributionsRecorded * 25);

  const displayName = user?.name || 'Volunteer';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'V';

  const volunteerPassId = user?.volunteerId || 'V-PENDING';
  const resolvedQrValue = qrPayload || `JS-VOL:${volunteerPassId}`;

  const menuItems = [
    {
      label: 'Personal Information',
      icon: User,
      path: '#personal',
      action: () => setActiveModal('personal')
    },
    { label: 'My Contributions', icon: Package, path: '/activities' },
    { label: 'My Impact', icon: Award, path: '/impact' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    {
      label: 'Settings',
      icon: Settings,
      path: '#settings',
      action: openSettingsModal
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
          Profile
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Manage your volunteer credentials, identity QR code, and personal settings.
        </p>
      </div>

      {uploadMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: uploadMsg.type === 'error' ? '#FEE2E2' : '#E6F4F1',
            color: uploadMsg.type === 'error' ? '#DC2626' : '#0F766E',
            border: `1px solid ${uploadMsg.type === 'error' ? '#FCA5A5' : '#A7F3D0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{uploadMsg.text}</span>
          <button
            type="button"
            onClick={() => setUploadMsg(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Profile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            padding: '28px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          {/* Avatar with Camera upload button */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <div
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                backgroundColor: '#0F766E',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 800,
                overflow: 'hidden',
                border: '3px solid #E6F4F1',
                boxShadow: '0 4px 14px rgba(15, 118, 110, 0.15)'
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>

            {/* Camera Upload Action Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Add or update profile picture"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0F766E',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease'
              }}
            >
              {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={15} />}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Quick picture action links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '11.5px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F766E',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              {user?.avatarUrl ? 'Change photo' : 'Upload photo'}
            </button>
            {user?.avatarUrl && (
              <>
                <span style={{ color: '#D1D5DB' }}>•</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  Remove
                </button>
              </>
            )}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
            {displayName}
          </h2>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', backgroundColor: '#E6F4F1', padding: '3px 12px', borderRadius: '9999px', marginBottom: '16px' }}>
            {user?.role === 'admin' ? 'Administrator' : user?.role === 'hub_operator' ? 'Hub Operator' : 'Community Volunteer'}
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              padding: '14px 0',
              borderTop: '1px solid #F3F4F6',
              borderBottom: '1px solid #F3F4F6',
              marginBottom: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>{totalPoints}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Points</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>{metrics.donationsSubmitted || 0}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Contributions</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>{metrics.distributionsRecorded || 0}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Distributions</div>
            </div>
          </div>

          {/* Genuine Volunteer Scannable QR Code Pass */}
          <div style={{ width: '100%', padding: '16px', backgroundColor: '#F8FAF9', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px' }}>
              Volunteer Pass ID: {volunteerPassId}
            </div>
            <div
              style={{
                width: '128px',
                height: '128px',
                margin: '0 auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <QRCodeSVG
                value={resolvedQrValue}
                size={112}
                level="M"
                fgColor="#0F766E"
                bgColor="#FFFFFF"
                includeMargin={false}
              />
            </div>
            <div style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '8px', fontWeight: 500 }}>
              Scannable at any JanaSeva Hub Optical Reader
            </div>
          </div>
        </div>

        {/* Right Column: Menu List matching Screen 20 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.path && item.path.startsWith('/')) {
                    navigate(item.path);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#F8FAF9',
                      color: '#0F766E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </button>
            );
          })}

          {/* Logout Button matching Screen 20 */}
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #FEE2E2',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={18} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626' }}>
                Logout
              </span>
            </div>
            <ChevronRight size={16} color="#FCA5A5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. PERSONAL INFORMATION MODAL (ACTUAL REGISTERED DATA) */}
      {/* ======================================================== */}
      <Modal
        isOpen={activeModal === 'personal'}
        onClose={closeModal}
        title="Personal Information"
        maxWidth="600px"
        footer={
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                closeModal();
                setTimeout(() => openSettingsModal(), 100);
              }}
            >
              <Edit3 size={15} style={{ marginRight: '6px' }} /> Edit in Settings
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Card with Pass ID */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F0FDFA',
              borderRadius: '14px',
              border: '1px solid #CCFBF1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#134E4A' }}>
                  {user?.name || 'Registered Volunteer'}
                </div>
                <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600 }}>
                  Volunteer Pass: <span style={{ fontFamily: 'monospace' }}>{volunteerPassId}</span>
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: user?.status === 'active' ? '#D1FAE5' : '#FEF3C7',
                color: user?.status === 'active' ? '#047857' : '#B45309'
              }}
            >
              {user?.status === 'active' ? 'Active' : (user?.status || 'Pending')}
            </div>
          </div>

          {/* User Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Full Name */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                Full Name
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                {user?.name || 'Not provided'}
              </div>
            </div>

            {/* Role */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                System Role
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F766E' }}>
                {user?.role === 'admin' ? 'Administrator' : user?.role === 'hub_operator' ? 'Hub Station Operator' : 'Community Volunteer'}
              </div>
            </div>

            {/* Email Address */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                  Email Address
                </span>
                {user?.isContactVerified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827', wordBreak: 'break-all' }}>
                {user?.email || 'Not provided'}
              </div>
            </div>

            {/* Mobile Phone */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                  Mobile Number
                </span>
                {user?.isContactVerified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                {user?.phone || 'Not provided'}
              </div>
            </div>

            {/* Registration Date */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                Member Since
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Active Member'}
              </div>
            </div>

            {/* Assigned Hubs */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                Assigned Hubs
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                {user?.assignedHubs && user.assignedHubs.length > 0
                  ? user.assignedHubs.join(', ')
                  : 'Universal District Access'}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 2. SETTINGS MODAL (CHANGE NAME, EMAIL, PHONE, PASSWORD)   */}
      {/* ======================================================== */}
      <Modal
        isOpen={activeModal === 'settings'}
        onClose={closeModal}
        title="Settings & Credentials"
        maxWidth="560px"
        footer={
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeModal} disabled={savingSettings}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? (
                <>
                  <RefreshCw size={14} className="animate-spin" style={{ marginRight: '6px' }} /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Feedback Banners */}
          {settingsError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{settingsError}</span>
            </div>
          )}

          {settingsSuccess && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#047857',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{settingsSuccess}</span>
            </div>
          )}

          {/* Section 1: Profile & Contact Details */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
              Personal Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px', display: 'block' }}>
                  Changing your email address updates your login identity.
                </span>
              </div>

              {/* Mobile Number */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px', display: 'block' }}>
                  Used for SMS notifications and hub verification.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Password & Security */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', margin: 0 }}>
                Change Password
              </h3>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                Leave blank to keep current
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {/* Current Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                  Current Password {formData.newPassword && <span style={{ color: '#DC2626' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter current password to authorize change"
                    style={{
                      width: '100%',
                      padding: '9px 40px 9px 36px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      padding: '2px'
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="At least 8 characters"
                    style={{
                      width: '100%',
                      padding: '9px 40px 9px 36px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      padding: '2px'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#9CA3AF' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '9px 40px 9px 36px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      padding: '2px'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
