import React, { useState, useEffect } from 'react';
import {
  Clock,
  Package,
  Truck,
  HeartHandshake,
  Upload,
  Camera,
  Check,
  RotateCw
} from 'lucide-react';
import { Button, Modal, Spinner, EmptyState, ErrorState } from '@janaseva/ui';
import volunteerService from '../services/volunteerService';

export function MyActivitiesPage() {
  // Tabs: 'Contributions' | 'Reservations' | 'Collections' | 'Distributions'
  const [activeTab, setActiveTab] = useState('Contributions');

  // Modals for Showcase Screens 14, 15, 16
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  // Fulfillment State
  const [distributionStage, setDistributionStage] = useState('IN TRANSIT'); // 'JANASEVA' | 'IN TRANSIT' | 'DISTRIBUTED'
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofComments, setProofComments] = useState('');

  // Live activities state
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getActivities();
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError(err.response?.data?.error?.message || 'Could not load your activity ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Map backend VolunteerActivity records to visual representation
  const mappedActivities = activities.map((act) => {
    const isDonation = act.activityType?.startsWith('donation');
    const isReservation = act.activityType?.startsWith('reservation');
    const isCollection = act.activityType?.startsWith('collection');
    const isDistribution = act.activityType?.startsWith('distribution');

    let tab = 'Contributions';
    let title = 'Contribution';
    let Icon = HeartHandshake;
    let color = '#0F766E';
    let bg = '#E6F4F1';
    let points = '+10 points';

    if (isDonation) {
      tab = 'Contributions';
      title = act.activityType === 'donation_accepted' ? 'Contribution Accepted' : 'Contribution Pledged';
      Icon = HeartHandshake;
      color = '#0F766E';
      bg = '#E6F4F1';
      points = act.activityType === 'donation_accepted' ? '+10 points' : 'Pledged';
    } else if (isReservation) {
      tab = 'Reservations';
      title = 'Resource Reservation';
      Icon = Clock;
      color = '#3B82F6';
      bg = '#EFF6FF';
      points = 'Confirmed';
    } else if (isCollection) {
      tab = 'Collections';
      title = 'Collection Completed';
      Icon = Package;
      color = '#D97706';
      bg = '#FEF3C7';
      points = '+15 points';
    } else if (isDistribution) {
      tab = 'Distributions';
      title = 'Distribution Recorded';
      Icon = Truck;
      color = '#059669';
      bg = '#DCFCE7';
      points = '+25 points';
    }

    const dateObj = act.timestamp ? new Date(act.timestamp) : new Date();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      id: act._id || act.activityId,
      tab,
      title,
      subtitle: act.description || `${act.quantity || 1} ${act.unit || 'units'} • ${act.hubName || act.hubId || 'Hub'}`,
      time: timeStr,
      date: dateStr,
      points,
      icon: Icon,
      color,
      bg
    };
  });

  const filteredItems = mappedActivities.filter(
    (item) => activeTab === 'All' || item.tab === activeTab
  );

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Showcase Screen 13 */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
          My Activity
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Real-time activity ledger tracking your contributions, reservations, collections, and distributions.
        </p>
      </div>

      {/* 4 Tabs Bar matching Showcase Screen 13 */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', overflowX: 'auto' }}>
        {['Contributions', 'Reservations', 'Collections', 'Distributions'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: isActive ? '1px solid #0F766E' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#0F766E' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5563',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Timeline Feed matching Showcase Screen 13 */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '16px' }}>
          <Spinner size="lg" />
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading volunteer activity records...</div>
        </div>
      ) : error ? (
        <ErrorState
          title="Could Not Load Activities"
          message={error}
          action={
            <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchActivities}>
              Retry Connection
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} Records Found`}
          message={`You currently have no recorded ${activeTab.toLowerCase()} in your ledger.`}
          action={
            <Button variant="primary" size="md" onClick={() => setActiveTab('All')}>
              View All Activities
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Activity Feed
          </div>

          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: item.bg,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: item.color,
                        display: 'block'
                      }}
                    >
                      {item.points}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.time}</span>
                  </div>

                  {item.tab === 'Collections' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCollectionModalOpen(true)}
                      style={{ borderRadius: '9999px', fontSize: '12px' }}
                    >
                      Collection Task
                    </Button>
                  )}

                  {item.tab === 'Distributions' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setDistributionModalOpen(true)}
                      style={{ borderRadius: '9999px', fontSize: '12px', backgroundColor: '#0F766E' }}
                    >
                      Track Progress
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 14: Collection Flow Modal                                */}
      {/* ============================================================== */}
      {collectionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📦</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  Collection Task
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCollectionModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#9CA3AF', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#F8FAF9', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>JanaSeva Point 04</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', marginTop: '2px' }}>Food • 5 portions</div>
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  Ready for Collection
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, marginBottom: '24px' }}>
              Scan your Volunteer QR code at the Hub Self-Service Kiosk to unlock the locker shelf and take custody of this batch.
            </p>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                alert('Collection started! Physical locker unlocked at Point 04.');
                setCollectionModalOpen(false);
              }}
              style={{ borderRadius: '9999px', height: '48px', backgroundColor: '#0F766E', fontWeight: 700 }}
            >
              Start Collection
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 15: Distribution Progress Flow Modal                     */}
      {/* ============================================================== */}
      {distributionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🚚</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  Distribution Progress
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDistributionModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#9CA3AF', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Stepper matching Showcase Screen 15: JANASEVA -> IN TRANSIT -> DISTRIBUTED */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '0 10px' }}>
              {['JANASEVA', 'IN TRANSIT', 'DISTRIBUTED'].map((stage, idx) => {
                const isCurrent = distributionStage === stage;
                const isPast = (stage === 'JANASEVA' && (distributionStage === 'IN TRANSIT' || distributionStage === 'DISTRIBUTED')) ||
                  (stage === 'IN TRANSIT' && distributionStage === 'DISTRIBUTED');
                return (
                  <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isPast ? '#0F766E' : isCurrent ? '#0F766E' : '#E5E7EB',
                        color: isPast || isCurrent ? '#FFFFFF' : '#6B7280',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isPast ? <Check size={16} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isCurrent ? '#0F766E' : '#6B7280' }}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#F8FAF9', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                <strong>Resource:</strong> Food • 5 portions
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                <strong>Destination:</strong> Community Center
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                <strong>Recipient / Organization:</strong> Selected community outreach center
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setDistributionModalOpen(false);
                  setProofModalOpen(true);
                }}
                style={{ flex: 1, borderRadius: '9999px', fontSize: '14px' }}
              >
                Upload Proof
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setDistributionStage('DISTRIBUTED');
                  alert('Distribution confirmed completed!');
                  setDistributionModalOpen(false);
                }}
                style={{ flex: 1, borderRadius: '9999px', fontSize: '14px', backgroundColor: '#0F766E' }}
              >
                Complete Distribution
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 16: Proof Upload Modal                                   */}
      {/* ============================================================== */}
      {proofModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📸</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  Distribution Proof
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProofModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#9CA3AF', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Upload Area matching Showcase Screen 16 */}
            <div
              onClick={() => setProofUploaded(true)}
              style={{
                border: '2px dashed #0F766E',
                borderRadius: '16px',
                backgroundColor: proofUploaded ? '#E6F4F1' : '#F8FAF9',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                {proofUploaded ? <Check size={24} color="#059669" /> : <Camera size={24} />}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                {proofUploaded ? 'Handover_Photo_Proof.jpg attached' : 'Upload Proof Image (JPG / PNG)'}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                {proofUploaded ? '✓ Verified file ready for audit ledger' : 'Click to select verified handover photo'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Optional Comment / Note
              </label>
              <input
                type="text"
                placeholder="Add optional handover note..."
                value={proofComments}
                onChange={(e) => setProofComments(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '0 14px',
                  fontSize: '13px',
                  color: '#1F2937',
                  outline: 'none'
                }}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                alert('Distribution proof submitted to audit ledger!');
                setProofModalOpen(false);
              }}
              style={{ borderRadius: '9999px', height: '48px', backgroundColor: '#0F766E', fontWeight: 700 }}
            >
              Submit Proof
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyActivitiesPage;
