import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import volunteerService from '../services/volunteerService';
import OnboardingModal from './OnboardingModal';
import { JanaSevaLogo } from '@janaseva/ui';
import {
  LayoutDashboard,
  Compass,
  HeartHandshake,
  MapPin,
  ListOrdered,
  Award,
  Gift,
  Bell,
  Clock,
  User,
  Search,
  Menu,
  X,
  LogOut,
  HelpCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/explore', label: 'Explore Resources', icon: Compass },
  { path: '/reservations', label: 'My Reservations', icon: Clock },
  { path: '/distributions', label: 'Distributions', icon: Gift },
  { path: '/contribute', label: 'Contribute', icon: HeartHandshake },
  { path: '/points', label: 'JanaSeva Points', icon: MapPin },
  { path: '/activities', label: 'My Activity', icon: ListOrdered },
  { path: '/impact', label: 'Impact & Rewards', icon: Award },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/profile', label: 'Profile', icon: User }
];

export function VolunteerShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const notifs = await volunteerService.getNotifications();
        if (isMounted && Array.isArray(notifs)) {
          const unread = notifs.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (e) {
        // silent
      }
    }
    loadNotifications();

    // Real-time notification and inventory subscription
    let unsubscribeNotifs = null;
    let unsubscribeInv = null;
    import('../services/socket').then(({ subscribeToNotifications, subscribeToInventory }) => {
      if (!isMounted) return;
      unsubscribeNotifs = subscribeToNotifications((notif) => {
        if (!isMounted) return;
        setUnreadCount((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent('janaseva:notification', { detail: notif }));
      });
      unsubscribeInv = subscribeToInventory((inv) => {
        if (!isMounted) return;
        window.dispatchEvent(new CustomEvent('janaseva:inventory_updated', { detail: inv }));
      });
    }).catch(() => {});

    return () => {
      isMounted = false;
      if (unsubscribeNotifs) unsubscribeNotifs();
      if (unsubscribeInv) unsubscribeInv();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hubs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PS';

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F8FAF9' }}>
      {/* 1. Desktop Persistent Left Sidebar */}
      <aside
        className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Volunteer Navigation"
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '72px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #F3F4F6'
          }}
        >
          <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
            <JanaSevaLogo size={32} showTagline={true} />
          </NavLink>
        </div>

        {/* Sidebar Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {NAV_ITEMS.map(({ path, label, icon: Icon, hasBadge }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={`${path}-${label}`}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0F766E' : '#4B5563',
                  backgroundColor: isActive ? '#E6F4F1' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={isActive ? '#0F766E' : '#6B7280'} />
                <span style={{ flex: 1 }}>{label}</span>
                {hasBadge && unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '1px 6px',
                      lineHeight: '16px'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Inspiration Artwork & Profile Card */}
        <div style={{ padding: '16px', borderTop: '1px solid #F3F4F6', backgroundColor: '#FAFAF9' }}>
          {/* Hands holding leaves graphic & motto matching Reference 3 */}
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#E6F4F1',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}
            >
              🌱
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E' }}>
                Small actions.
              </div>
              <div style={{ fontSize: '11px', color: '#115E59' }}>
                Big impact.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div style={{ fontSize: '12px' }}>
                <div style={{ fontWeight: 700, color: '#1F2937' }}>{user?.name || 'Volunteer'}</div>
                <div style={{ color: '#6B7280', fontSize: '11px' }}>{user?.volunteerId || (user?.role === 'admin' ? 'Administrator' : 'Volunteer')}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar Header matching Reference 3 */}
        <header
          style={{
            height: '72px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}
        >
          {/* Left: Mobile Toggle & Global Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '580px' }}>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: '6px' }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Global Search Bar from Reference 3 */}
            <form onSubmit={handleGlobalSearch} style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search resources, points, or anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  backgroundColor: '#F8FAF9',
                  border: '1px solid #E5E7EB',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  color: '#1F2937',
                  outline: 'none'
                }}
              />
            </form>
          </div>

          {/* Right: Actions, Notifications & Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Guide Tour button */}
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              style={{
                background: 'none',
                border: '1px solid #E5E7EB',
                borderRadius: '9999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#4B5563',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="View JanaSeva Welcome Tour"
            >
              <HelpCircle size={14} color="#0F766E" />
              <span>Tour Guide</span>
            </button>

            {/* Notification Bell with Red Badge matching Reference 3 */}
            <NavLink
              to="/notifications"
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#F8FAF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                textDecoration: 'none'
              }}
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444'
                  }}
                />
              )}
            </NavLink>

            {/* User Profile Pill matching Reference 3 */}
            <NavLink
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                padding: '4px 10px 4px 4px',
                borderRadius: '9999px',
                backgroundColor: '#F8FAF9',
                border: '1px solid #E5E7EB'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>
                  {user?.name || 'Volunteer'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Volunteer'}
                </div>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Onboarding Tour Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

export default VolunteerShell;
