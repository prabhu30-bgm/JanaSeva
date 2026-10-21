import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import volunteerService from '../services/volunteerService';
import hubService from '../services/hubService';
import {
  Card,
  Banner,
  Button,
  Spinner,
  ErrorState
} from '@janaseva/ui';
import {
  Compass,
  ArrowRight,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  RotateCw,
  ChevronRight,
  PlusCircle,
  Bell
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [nearbyHub, setNearbyHub] = useState(null);
  const [publicStats, setPublicStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData, hubData, statsData, notifData] = await Promise.all([
        volunteerService.getDashboard(),
        hubService.getHubs({ limit: 1 }).catch(() => null),
        hubService.getPublicStats().catch(() => null),
        volunteerService.getNotifications().catch(() => [])
      ]);
      setDashboardData(dashData);
      if (hubData?.hubs?.length > 0) {
        setNearbyHub(hubData.hubs[0]);
      }
      setPublicStats(statsData);
      setNotifications(notifData || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.error?.message || 'Could not retrieve volunteer dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleUpdate = () => {
      fetchDashboard();
    };

    window.addEventListener('janaseva:notification', handleUpdate);
    window.addEventListener('janaseva:inventory_updated', handleUpdate);

    let unsubscribeAct = null;
    let unsubscribeRes = null;
    import('../services/socket').then(({ subscribeToVolunteerActivity, subscribeToReservationUpdates }) => {
      unsubscribeAct = subscribeToVolunteerActivity(handleUpdate);
      unsubscribeRes = subscribeToReservationUpdates(handleUpdate);
    }).catch(() => {});

    return () => {
      window.removeEventListener('janaseva:notification', handleUpdate);
      window.removeEventListener('janaseva:inventory_updated', handleUpdate);
      if (unsubscribeAct) unsubscribeAct();
      if (unsubscribeRes) unsubscribeRes();
    };
  }, []);

  const getDeadlineText = (deadline) => {
    if (!deadline) return null;
    const diffMs = new Date(deadline).getTime() - Date.now();
    if (diffMs <= 0) return 'Deadline expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `Ends in ${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '16px' }}>
        <Spinner size="lg" />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading volunteer dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 0' }}>
        <ErrorState
          title="Dashboard Unavailable"
          message={error}
          action={
            <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchDashboard}>
              Retry Connection
            </Button>
          }
        />
      </div>
    );
  }

  const volunteer = dashboardData?.volunteer || user;
  const metrics = dashboardData?.metrics || {
    resourcesContributed: 0,
    donationsSubmitted: 0,
    collectionsCompleted: 0,
    distributionsRecorded: 0
  };
  const activeReservations = dashboardData?.activeReservations || [];
  const urgentReservation = activeReservations[0];
  const recentActivities = dashboardData?.recentActivities || [];

  const totalPoints =
    (metrics.donationsSubmitted * 10) +
    (metrics.collectionsCompleted * 15) +
    (metrics.distributionsRecorded * 25);
  const level = Math.max(1, Math.floor(totalPoints / 100) + 1);
  const pointsInLevel = totalPoints % 100;
  const pointsToNext = 100 - pointsInLevel;
  const progressPercent = Math.min(100, Math.round((pointsInLevel / 100) * 100));
  const strokeDashoffset = Math.max(0, 264 - (264 * progressPercent) / 100);

  const getRankTitle = (lvl) => {
    if (lvl >= 5) return 'Community Hero';
    if (lvl >= 4) return 'Kindness Champion';
    if (lvl >= 3) return 'Dedicated Volunteer';
    if (lvl >= 2) return 'Active Contributor';
    return 'Community Helper';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Required: Urgent Reservation Deadline Banner */}
      {urgentReservation && (
        <Banner
          variant="warning"
          message={
            <span>
              <strong>⚠️ URGENT COLLECTION DEADLINE:</strong> {urgentReservation.quantity} {urgentReservation.unit || 'items'} ({urgentReservation.itemDescription}) at{' '}
              <strong>{urgentReservation.hubName || urgentReservation.hubId}</strong> — Collect before{' '}
              {new Date(urgentReservation.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
              <span style={{ fontWeight: 700, color: '#B91C1C' }}>
                ({getDeadlineText(urgentReservation.deadline)})
              </span>
            </span>
          }
          action={
            <NavLink to="/reservations" className="btn btn-sm btn-accent" style={{ textDecoration: 'none', borderRadius: '9999px' }}>
              View Plan <ArrowRight size={13} />
            </NavLink>
          }
        />
      )}

      {/* Top Split: Welcome Hero Banner + Level 4 Kindness Warrior Widget (Matching Reference 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) 280px',
          gap: '20px',
          alignItems: 'stretch'
        }}
      >
        {/* Welcome Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #E6F4F1 0%, #D1FAE5 50%, #CCFBF1 100%)',
            borderRadius: '24px',
            border: '1px solid #A7F3D0',
            padding: '28px 32px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Top Row: Greeting & Subtitle */}
          <div style={{ maxWidth: '540px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Good morning, {volunteer?.name || 'Volunteer'}! 👋
              </h1>
            </div>
            <p style={{ color: '#0F766E', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px 0', fontWeight: 500 }}>
              Thank you for being a part of JanaSeva. Your kindness creates a ripple of change in the community.
            </p>
          </div>

          {/* 4 Quick Stat Pills embedded in the Hero Banner (Matching Reference 3) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              position: 'relative',
              zIndex: 2
            }}
          >
            {[
              {
                label: 'Points',
                val: totalPoints,
                growth: 'Verified',
                icon: '🌱',
                bg: '#FFFFFF',
                path: '/impact'
              },
              {
                label: 'Contributions',
                val: metrics.donationsSubmitted || 0,
                growth: `${metrics.resourcesContributed || 0} units total`,
                icon: '📦',
                bg: '#FFFFFF',
                path: '/contribute'
              },
              {
                label: 'Collections',
                val: metrics.collectionsCompleted || 0,
                growth: 'Verified pickups',
                icon: '👥',
                bg: '#FFFFFF',
                path: '/reservations'
              },
              {
                label: 'Distributions',
                val: metrics.distributionsRecorded || 0,
                growth: 'Recorded handovers',
                icon: '📍',
                bg: '#FFFFFF',
                path: '/distributions'
              }
            ].map((stat) => (
              <div
                key={stat.label}
                onClick={() => stat.path && navigate(stat.path)}
                style={{
                  backgroundColor: stat.bg,
                  borderRadius: '16px',
                  padding: '12px 14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  cursor: stat.path ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937' }}>{stat.val}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  {stat.growth}
                </div>
              </div>
            ))}
          </div>

          {/* Right Floating Character & Quote */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              textAlign: 'right',
              pointerEvents: 'none'
            }}
          >
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#0F766E',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              Together we make a difference 🤍
            </span>
          </div>
        </div>

        {/* Top-Right Card: Level Widget (Matching Reference 3) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          {/* Circular Progress Gauge */}
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '4px auto 12px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#0F766E"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}
            >
              🌱
            </div>
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
              Level {level}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E', marginBottom: '8px' }}>
              {getRankTitle(level)}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              {totalPoints} Points ({progressPercent}%)
            </div>
          </div>

          <div
            style={{
              width: '100%',
              backgroundColor: '#F8FAF9',
              borderRadius: '12px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0F766E',
              marginTop: '12px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/profile')}
          >
            <span>{pointsToNext} points to Level {level + 1}</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Middle Row: 4 Essential Cards (Matching Reference 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* Card 1: Your Recent Activity */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Your Recent Activity
            </h3>
            <NavLink to="/activities" style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E', textDecoration: 'none' }}>
              View All →
            </NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 4).map((item, idx) => {
                const isPledged = item.activityType === 'donation_pledged';
                const isAccepted = item.activityType === 'donation_accepted';
                const isCollection = item.activityType === 'collection_completed';
                const isDist = item.activityType === 'distribution_recorded';

                const label = isAccepted
                  ? 'Contribution Accepted'
                  : isPledged
                    ? 'Donation Pledged'
                    : isCollection
                      ? 'Collection Completed'
                      : isDist
                        ? 'Distribution Recorded'
                        : item.activityType?.replace(/_/g, ' ') || 'Activity';

                const pointsText = isDist
                  ? '+25 points'
                  : isCollection
                    ? '+15 points'
                    : isAccepted
                      ? '+10 points'
                      : 'Pending';

                const color = isDist ? '#059669' : isCollection ? '#D97706' : '#0F766E';
                const bg = isDist ? '#DCFCE7' : isCollection ? '#FEF3C7' : '#E6F4F1';

                const timeStr = item.timestamp
                  ? new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : 'Recent';

                return (
                  <div key={item._id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: bg,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        flexShrink: 0
                      }}
                    >
                      ✓
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>{label}</span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{timeStr}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '1px' }}>
                        {item.description || `${item.quantity || 1} ${item.unit || 'items'} • ${item.hubName || item.hubId || 'Hub'}`}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: color }}>{pointsText}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#6B7280', fontSize: '13px' }}>
                <Package size={28} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
                No recent activity recorded yet.
                <div style={{ marginTop: '8px' }}>
                  <NavLink to="/donate" style={{ color: '#0F766E', fontWeight: 600, textDecoration: 'none' }}>
                    Pledge a contribution →
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Nearby JanaSeva Points (Mini Map & Point Card) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Nearby JanaSeva Points
            </h3>
            <NavLink to="/hubs" style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E', textDecoration: 'none' }}>
              View All →
            </NavLink>
          </div>

          {/* Mini Interactive Map Viewport */}
          <div
            style={{
              height: '140px',
              backgroundColor: '#E6ECE9',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Grid Pattern */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                opacity: 0.6
              }}
            />
            {/* Map Center Pin */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0F766E', boxShadow: '0 0 0 4px rgba(15, 118, 110, 0.3)' }} />
            </div>
            {/* Nearby Hub Markers */}
            <div style={{ position: 'absolute', top: '35%', left: '30%', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <div style={{ position: 'absolute', top: '65%', left: '70%', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <div style={{ position: 'absolute', top: '25%', left: '65%', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          </div>

          {/* Selected Live Hub Card */}
          {nearbyHub ? (
            <div
              style={{
                backgroundColor: '#F8FAF9',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#0F766E" />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#1F2937' }}>{nearbyHub.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                    {nearbyHub.address || nearbyHub.locality}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600, marginTop: '2px' }}>
                    {nearbyHub.operatingHours ? `${nearbyHub.operatingHours.open} - ${nearbyHub.operatingHours.close}` : 'Active Hub'}
                  </div>
                </div>
                <NavLink
                  to={`/hubs/${nearbyHub.hubId}`}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '9999px' }}
                >
                  View Point →
                </NavLink>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#6B7280', fontSize: '12px' }}>
              No nearby points detected. <NavLink to="/hubs" style={{ color: '#0F766E', fontWeight: 600 }}>Browse all Hubs</NavLink>
            </div>
          )}
        </div>

        {/* Card 3: Quick Actions (Matching Reference 3) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: '0 0 16px 0' }}>
            Quick Actions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { title: 'Contribute Resources', desc: 'Give what you can', icon: PlusCircle, path: '/donate', color: '#0F766E', bg: '#E6F4F1' },
              { title: 'Find Resources', desc: 'Explore nearby items', icon: Compass, path: '/explore', color: '#0F766E', bg: '#E6F4F1' },
              { title: 'Reserve Resource', desc: 'Book for collection', icon: Clock, path: '/reservations', color: '#D97706', bg: '#FEF3C7' },
              { title: 'View Hub Points', desc: 'Find points near you', icon: MapPin, path: '/hubs', color: '#059669', bg: '#D1FAE5' }
            ].map(({ title, desc, icon: Icon, path, color, bg }) => (
              <NavLink
                key={title}
                to={path}
                style={{
                  backgroundColor: bg,
                  borderRadius: '14px',
                  padding: '14px 12px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <Icon size={20} color={color} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937', lineHeight: 1.2 }}>
                  {title}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280' }}>
                  {desc}
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Card 4: Notifications Feed (Matching Reference 3) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Notifications
            </h3>
            <NavLink to="/notifications" style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E', textDecoration: 'none' }}>
              View All →
            </NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 4).map((n, idx) => (
                <div key={n._id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px' }}>
                  <span style={{ fontSize: '16px' }}>{n.category === 'donation' ? '📦' : n.category === 'reservation' ? '⏰' : '🔔'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>{n.title}</div>
                    <div style={{ color: '#6B7280', fontSize: '11px' }}>{n.message || n.subtitle}</div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                    {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 12px', color: '#6B7280', fontSize: '13px' }}>
                <Bell size={24} color="#9CA3AF" style={{ margin: '0 auto 6px', display: 'block' }} />
                No unread notifications.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Impact Overview, Upcoming Tasks, and Community Card (Matching Reference 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'stretch'
        }}
      >
        {/* Impact Overview */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: '0 0 4px 0' }}>
            Impact Overview
          </h3>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px 0' }}>
            Real People. Real Change.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ padding: '10px', backgroundColor: '#F8FAF9', borderRadius: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F766E' }}>
                {metrics.resourcesContributed || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Items Donated</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#F8FAF9', borderRadius: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#D97706' }}>
                {metrics.donationsSubmitted || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Contributions</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#F8FAF9', borderRadius: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                {metrics.collectionsCompleted || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Collections</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#F8FAF9', borderRadius: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>
                {publicStats?.activeHubs || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Active Hubs</div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Upcoming Tasks
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E' }}>
              {activeReservations.length} Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeReservations.length > 0 ? (
              activeReservations.slice(0, 3).map((res, idx) => (
                <div key={res._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAF9', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F2937' }}>
                      Collect {res.itemDescription || res.category}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>
                      {res.quantity} {res.unit || 'units'} • {res.hubName || res.hubId}
                    </div>
                  </div>
                  <NavLink to="/reservations" className="btn btn-sm btn-primary" style={{ fontSize: '11px', borderRadius: '9999px', padding: '3px 10px' }}>
                    View
                  </NavLink>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '18px 12px', color: '#6B7280', fontSize: '12px' }}>
                <CheckCircle2 size={24} color="#10B981" style={{ margin: '0 auto 6px', display: 'block' }} />
                No pending tasks at this time.
              </div>
            )}
          </div>
        </div>

        {/* Community Inspiration Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              COMMUNITY MISSION
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '12px', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              Help. Share.<br />Create Impact.
            </h3>
            <p style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.5, margin: 0 }}>
              Join hands with neighboring Hub coordinators to ensure no surplus food or essential supplies go unused.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Together we grow 🌱</span>
            <NavLink
              to="/hubs"
              className="btn btn-sm"
              style={{
                backgroundColor: '#F59E0B',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '12px'
              }}
            >
              Explore Hubs
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
