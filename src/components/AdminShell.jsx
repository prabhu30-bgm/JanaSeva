import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Boxes,
  MapPin,
  ClipboardList,
  Truck,
  FileSpreadsheet,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Mail,
  Calendar,
  Lock,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { JanaSevaLogo } from '@janaseva/ui';
import { useAuth } from '../context/AuthContext';

export function AdminShell() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', to: '/admin/overview', icon: LayoutDashboard },
    { name: 'Users', to: '/admin/users', icon: Users },
    { name: 'Resources', to: '/admin/inventory', icon: Boxes },
    { name: 'JanaSeva Points', to: '/admin/hubs', icon: MapPin },
    { name: 'Requests', to: '/admin/approvals', icon: ClipboardList },
    { name: 'Distribution', to: '/admin/dispatches', icon: Truck },
    { name: 'Reports', to: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Settings', to: '/admin/settings', icon: Settings }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F8FAF9' }}>
      {/* 1. Sidebar matching Reference 4 */}
      <aside
        className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}
        aria-label="Administrative Navigation"
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          overflowY: 'auto'
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
          <NavLink to="/admin/overview" style={{ textDecoration: 'none' }}>
            <JanaSevaLogo size={32} showTagline={true} />
          </NavLink>
        </div>

        {/* Panel Subtitle Badge */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#E6F4F1',
              color: '#0F766E',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            <ShieldCheck size={14} />
            <span>Admin Panel • System Administrator</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
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
                })}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.badge && (
                  <span
                    style={{
                      backgroundColor: '#F59E0B',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '1px 6px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Artwork matching Reference 4 */}
        <div style={{ padding: '16px', borderTop: '1px solid #F3F4F6', backgroundColor: '#FAFAF9' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#E6F4F1',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px'
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
              🌿
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F766E' }}>
                Better Resources
              </div>
              <div style={{ fontSize: '10px', color: '#115E59' }}>
                Stronger Communities • Greater Impact
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' }}>
            <span style={{ color: '#6B7280' }}>Dual-Auth Guard</span>
            <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Active
            </span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('janaseva_admin');
              navigate('/login');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#DC2626',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Wrapper */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header matching Reference 4 */}
        <header
          style={{
            height: '72px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Left: Mobile Toggle & Global Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '580px' }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: '6px' }}
              aria-label="Toggle admin navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Global Admin Search Bar */}
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search users, resources, points, or requests..."
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

          {/* Right: Date Widget, Notifications, Messages & Admin Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Date Widget from Reference 4 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#F8FAF9',
                borderRadius: '9999px',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
                color: '#4B5563',
                fontWeight: 600
              }}
            >
              <Calendar size={14} color="#0F766E" />
              <span>Today: {todayDateStr}</span>
            </div>

            {/* Notification Bell */}
            <div
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F8FAF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                cursor: 'pointer'
              }}
            >
              <Bell size={18} />
            </div>

            {/* Message Envelope */}
            <div
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F8FAF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                cursor: 'pointer'
              }}
            >
              <Mail size={18} />
            </div>

            {/* Public Site Link */}
            <NavLink
              to="/"
              style={{
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0F766E',
                backgroundColor: '#E6F4F1',
                padding: '6px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Public Site →
            </NavLink>

            {/* Admin Profile Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 12px 4px 4px',
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
                  justifyContent: 'center'
                }}
              >
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AD'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>
                  {user?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600 }}>
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
