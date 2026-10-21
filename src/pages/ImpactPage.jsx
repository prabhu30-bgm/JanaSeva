import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCw } from 'lucide-react';
import { Card, Button, Spinner, ErrorState } from '@janaseva/ui';
import volunteerService from '../services/volunteerService';

export function ImpactPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load impact stats:', err);
      setError(err.response?.data?.error?.message || 'Could not load impact data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = dashboardData?.metrics || {
    donationsSubmitted: 0,
    resourcesContributed: 0,
    collectionsCompleted: 0,
    distributionsRecorded: 0
  };

  const currentPoints =
    (metrics.donationsSubmitted * 10) +
    (metrics.collectionsCompleted * 15) +
    (metrics.distributionsRecorded * 25);
  const level = Math.max(1, Math.floor(currentPoints / 100) + 1);
  const targetPoints = level * 100;
  const pointsInCurrentLevel = currentPoints % 100;
  const progressPct = Math.min(100, Math.round((pointsInCurrentLevel / 100) * 100));
  const pointsToNext = 100 - pointsInCurrentLevel;

  const getRankTitle = (lvl) => {
    if (lvl >= 5) return 'Community Hero';
    if (lvl >= 4) return 'Kindness Champion';
    if (lvl >= 3) return 'Dedicated Volunteer';
    if (lvl >= 2) return 'Active Contributor';
    return 'Kindness Warrior';
  };

  const badges = [
    {
      id: 'contributor',
      name: 'Contributor',
      status: metrics.donationsSubmitted >= 1 ? 'Earned' : 'Locked',
      desc: 'Pledged or deposited verified resource packages',
      icon: '🌱',
      earned: metrics.donationsSubmitted >= 1,
      color: metrics.donationsSubmitted >= 1 ? '#0F766E' : '#9CA3AF',
      bg: metrics.donationsSubmitted >= 1 ? '#E6F4F1' : '#F3F4F6'
    },
    {
      id: 'collector',
      name: 'Collector',
      status: metrics.collectionsCompleted >= 1 ? 'Earned' : 'Locked',
      desc: 'Completed resource pickups from JanaSeva Hub',
      icon: '📦',
      earned: metrics.collectionsCompleted >= 1,
      color: metrics.collectionsCompleted >= 1 ? '#D97706' : '#9CA3AF',
      bg: metrics.collectionsCompleted >= 1 ? '#FEF3C7' : '#F3F4F6'
    },
    {
      id: 'helper',
      name: 'Helper',
      status: metrics.distributionsRecorded >= 1 ? 'Earned' : 'Locked',
      desc: 'Completed direct community distributions with proof',
      icon: '🤝',
      earned: metrics.distributionsRecorded >= 1,
      color: metrics.distributionsRecorded >= 1 ? '#059669' : '#9CA3AF',
      bg: metrics.distributionsRecorded >= 1 ? '#DCFCE7' : '#F3F4F6'
    },
    {
      id: 'community-leader',
      name: 'Community Leader',
      status: currentPoints >= 500 ? 'Earned' : 'Locked',
      desc: 'Reach 500 points to unlock zonal coordinator privileges',
      icon: '👑',
      earned: currentPoints >= 500,
      color: currentPoints >= 500 ? '#2563EB' : '#9CA3AF',
      bg: currentPoints >= 500 ? '#EFF6FF' : '#F3F4F6'
    }
  ];

  const journeyMilestones = [
    { step: 1, label: 'Joined', desc: 'Identity verified', done: true },
    { step: 2, label: 'Contributed', desc: `${metrics.donationsSubmitted} donations logged`, done: metrics.donationsSubmitted > 0 },
    { step: 3, label: 'Collected', desc: `${metrics.collectionsCompleted} pickups completed`, done: metrics.collectionsCompleted > 0 },
    { step: 4, label: 'Distributed', desc: `${metrics.distributionsRecorded} handovers with proof`, done: metrics.distributionsRecorded > 0 }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', gap: '16px' }}>
        <Spinner size="lg" />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading verified impact & volunteer metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 0' }}>
        <ErrorState
          title="Could Not Load Impact"
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

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Showcase Screen 18 */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
          Impact & Rewards
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Celebrate your community milestones, earned badges, and volunteer standing.
        </p>
      </div>

      {/* Level Progress Card matching Showcase Screen 18 */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
          padding: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Standing
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
              Level {level} • {getRankTitle(level)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F766E' }}>
              {currentPoints}
            </span>
            <span style={{ fontSize: '14px', color: '#6B7280' }}> / {targetPoints} Points</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '10px', backgroundColor: '#F3F4F6', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              backgroundColor: '#0F766E',
              borderRadius: '5px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
          <span>{pointsToNext} points remaining to Level {level + 1}</span>
          <span style={{ fontWeight: 700, color: '#0F766E' }}>{progressPct}% Completed</span>
        </div>
      </div>

      {/* Badges Showcase matching Screen 18 */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
          Earned Badges
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {badges.map((b) => (
            <div
              key={b.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '10px',
                opacity: b.earned ? 1 : 0.75
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: b.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}
              >
                {b.icon}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>{b.name}</div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: b.earned ? '#D1FAE5' : '#F3F4F6',
                  color: b.earned ? '#059669' : '#6B7280'
                }}
              >
                {b.status}
              </span>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Your Impact Journey Milestones matching Screen 18 */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
          padding: '28px'
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '20px' }}>
          Your Impact Journey
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {journeyMilestones.map((m, idx) => (
            <div key={m.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 2 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  boxShadow: '0 2px 6px rgba(15, 118, 110, 0.2)'
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>{m.label}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImpactPage;
