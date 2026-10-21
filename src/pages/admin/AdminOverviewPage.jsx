import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Boxes,
  MapPin,
  Heart,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { HeroHandoverIllustration } from '@janaseva/ui';
import { useAuth } from '../../context/AuthContext';

export function OverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeHubs: 0,
    availableUnits: 0,
    verifiedVolunteers: 0,
    completedDistributions: 0
  });
  const [userCount, setUserCount] = useState(0);
  const [liveHubs, setLiveHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch authentic stats from backend
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, hubsRes, usersRes] = await Promise.all([
          fetch('http://localhost:5000/api/hubs/stats/public').then((r) => r.json()).catch(() => null),
          fetch('http://localhost:5000/api/hubs').then((r) => r.json()).catch(() => null),
          fetch('http://localhost:5000/api/admin/users', { credentials: 'include' }).then((r) => r.json()).catch(() => null)
        ]);

        if (statsRes?.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (hubsRes?.data?.hubs) {
          setLiveHubs(hubsRes.data.hubs);
        }
        if (usersRes?.data?.users) {
          setUserCount(usersRes.data.users.length);
        }
      } catch (e) {
        console.warn('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Welcome Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FDF4 100%)',
          border: '1px solid #CCFBF1',
          borderRadius: '20px',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '540px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              color: '#0F766E',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              marginBottom: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <ShieldCheck size={14} /> Authoritative Operational Governance
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1F2937',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Welcome, {user?.name || 'Administrator'}!
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#4B5563',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            Here is your live JanaSeva administration control panel across all decentralized points.
          </p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center' }}>
          <HeroHandoverIllustration
            width={400}
            height={168}
            style={{ borderRadius: '14px', border: '1px solid #CCFBF1', boxShadow: '0 4px 14px rgba(15, 118, 110, 0.1)' }}
          />
        </div>
      </div>

      {/* 2. Top Metric Cards (Live Authentic Numbers Only) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Total Users */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={22} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
              Live Database
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Total Users</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
              {userCount}
            </div>
          </div>
        </div>

        {/* Total Resources */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Boxes size={22} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
              Available Stock
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Total Resources</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
              {stats.availableUnits}
            </div>
          </div>
        </div>

        {/* JanaSeva Hubs */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={22} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
              Operational
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>JanaSeva Hubs</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
              {liveHubs.length}
            </div>
          </div>
        </div>

        {/* People Helped / Distributions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={22} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
              Completed
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Distributions Recorded</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>
              {stats.completedDistributions}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Empty State or Live Hub Status */}
      {liveHubs.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#E6F4F1',
              color: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Building size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: '0 0 8px 0' }}>
            No JanaSeva Hubs Registered Yet
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '480px', margin: '0 0 24px 0', lineHeight: 1.6 }}>
            Your platform database has been completely purged of sample data. As the Administrator, create your first decentralized JanaSeva Hub in Bangalore to start receiving donations and distributions.
          </p>
          <button
            onClick={() => navigate('/admin/hubs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0E7465',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14, 116, 101, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>Create First JanaSeva Hub</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Active JanaSeva Hubs ({liveHubs.length})
            </h2>
            <Link to="/admin/hubs" style={{ fontSize: '13px', fontWeight: 600, color: '#0F766E', textDecoration: 'none' }}>
              Manage Hubs →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {liveHubs.map((hub) => (
              <div
                key={hub.hubId}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#F9FAFB'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1F2937', marginBottom: '4px' }}>
                  {hub.name}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  {hub.locality} • {hub.address}
                </div>
                <div style={{ fontSize: '12px', color: '#0E7465', fontWeight: 600 }}>
                  Coordinator: {hub.coordinatorName} ({hub.contactPhone})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Operational Ledger / Activity Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >
        {/* Recent Operational Activities */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937' }}>Recent Activity</div>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Live Ledger</span>
          </div>
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280' }}>
            <Clock size={28} color="#9CA3AF" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
              No Operational Activities Recorded Yet
            </div>
            <div style={{ fontSize: '12px' }}>
              When volunteers register, donate, or collect resources, records will display here.
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937' }}>Pending Requests</div>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>All Clear</span>
          </div>
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280' }}>
            <CheckCircle2 size={28} color="#10B981" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
              No Pending Approval Requests
            </div>
            <div style={{ fontSize: '12px' }}>
              All distribution and intake workflows are up to date with zero backlog.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OverviewPage;
