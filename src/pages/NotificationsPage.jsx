import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  Clock,
  Package,
  Award,
  Truck,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { Button, Spinner, EmptyState, ErrorState } from '@janaseva/ui';
import volunteerService from '../services/volunteerService';

export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Unread'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.response?.data?.error?.message || 'Could not load your notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotif = (e) => {
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev.filter((n) => n._id !== e.detail._id)]);
      }
    };
    window.addEventListener('janaseva:notification', handleNewNotif);
    return () => {
      window.removeEventListener('janaseva:notification', handleNewNotif);
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await volunteerService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const mappedNotifications = notifications.map((n) => {
    let Icon = Bell;
    let color = '#0F766E';
    let bg = '#E6F4F1';
    let link = '/dashboard';

    if (n.category === 'reservation') {
      Icon = Clock;
      color = '#D97706';
      bg = '#FEF3C7';
      link = '/reservations';
    } else if (n.category === 'resource' || n.category === 'donation') {
      Icon = Package;
      color = '#0F766E';
      bg = '#E6F4F1';
      link = '/explore';
    } else if (n.category === 'badge') {
      Icon = Award;
      color = '#2563EB';
      bg = '#EFF6FF';
      link = '/impact';
    } else if (n.category === 'distribution') {
      Icon = Truck;
      color = '#059669';
      bg = '#DCFCE7';
      link = '/activities';
    }

    const dateObj = n.timestamp ? new Date(n.timestamp) : new Date();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      id: n._id || n.id,
      title: n.title,
      subtitle: n.message || n.subtitle,
      time: timeStr,
      unread: !n.isRead,
      category: n.category || 'general',
      icon: Icon,
      color,
      bg,
      link
    };
  });

  const filteredNotifs = mappedNotifications.filter((n) => {
    if (activeFilter === 'Unread') return n.unread;
    return true;
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Showcase Screen 19 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Stay updated on new resource batches, pickup deadlines, and verified achievements.
          </p>
        </div>

        {/* Filter Pills matching Screen 19: All | Unread */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '9999px' }}>
          {['All', 'Unread'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '6px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: isActive ? '#0F766E' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List matching Screen 19 */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '16px' }}>
          <Spinner size="lg" />
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading volunteer notifications...</div>
        </div>
      ) : error ? (
        <ErrorState
          title="Could Not Load Notifications"
          message={error}
          action={
            <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchNotifications}>
              Retry Connection
            </Button>
          }
        />
      ) : filteredNotifs.length === 0 ? (
        <EmptyState
          title={activeFilter === 'Unread' ? 'No Unread Notifications' : 'No Notifications'}
          message={activeFilter === 'Unread' ? 'You have caught up with all notifications.' : 'You have no notifications at this time.'}
          action={
            activeFilter === 'Unread' ? (
              <Button variant="secondary" size="md" onClick={() => setActiveFilter('All')}>
                View All Notifications
              </Button>
            ) : null
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Latest Notifications
          </div>

          {filteredNotifs.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: n.unread ? '1px solid #CCFBF1' : '1px solid #E5E7EB',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: n.unread ? '0 2px 8px rgba(15, 118, 110, 0.06)' : 'none',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: n.bg,
                      color: n.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                        {n.title}
                      </h3>
                      {n.unread && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#0F766E'
                          }}
                        />
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      {n.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                    {n.time}
                  </span>
                  {n.unread && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F8FAF9',
                        color: '#0F766E',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Mark read
                    </button>
                  )}
                  <NavLink
                    to={n.link}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#F8FAF9',
                      color: '#0F766E',
                      border: '1px solid #E5E7EB',
                      textDecoration: 'none'
                    }}
                  >
                    <ArrowRight size={14} />
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
