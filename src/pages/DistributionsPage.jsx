import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  Alert,
  Modal,
  Spinner,
  EmptyState,
  ErrorState
} from '@janaseva/ui';
import {
  Gift,
  Package,
  Truck,
  Clock,
  Calendar,
  CheckCircle2,
  RotateCw,
  Info,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import volunteerService from '../services/volunteerService';

export function DistributionsPage() {
  const navigate = useNavigate();

  // Tabs: 'collected' | 'history'
  const [activeTab, setActiveTab] = useState('collected');

  // Data states
  const [collectedItems, setCollectedItems] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Distribution Recording Modal State
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [distQuantity, setDistQuantity] = useState(1);
  const [distNotes, setDistNotes] = useState('');
  const [reviewStep, setReviewStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);

  // History detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  // Success alert on page
  const [pageAlert, setPageAlert] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [items, dists] = await Promise.all([
        volunteerService.getCollectedItems(),
        volunteerService.getDistributions()
      ]);
      setCollectedItems(items || []);
      setDistributions(dists || []);
    } catch (err) {
      console.error('Failed to load distribution data:', err);
      setError(err.response?.data?.error?.message || err.message || 'Could not load collected items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCollectedUnits = collectedItems.reduce((acc, it) => acc + (it.collectedQuantity || 0), 0);
    const totalDistributedUnits = collectedItems.reduce((acc, it) => acc + (it.distributedQuantity || 0), 0);
    const remainingInHandUnits = collectedItems.reduce((acc, it) => acc + (it.remainingQuantity || 0), 0);
    const eligibleBatchesCount = collectedItems.filter((it) => it.remainingQuantity > 0).length;
    return {
      totalCollectedUnits,
      totalDistributedUnits,
      remainingInHandUnits,
      eligibleBatchesCount,
      distributionEventsCount: distributions.length
    };
  }, [collectedItems, distributions]);

  const handleOpenRecordModal = (item) => {
    setSelectedItem(item);
    setDistQuantity(Math.min(item.remainingQuantity || 1, 1));
    setDistNotes('');
    setReviewStep(false);
    setSubmitError(null);
    setSuccessReceipt(null);
    setRecordModalOpen(true);
  };

  const handleSelectResourceChange = (e) => {
    const resId = e.target.value;
    const found = collectedItems.find((it) => it.reservationId === resId);
    if (found) {
      setSelectedItem(found);
      setDistQuantity(Math.min(found.remainingQuantity || 1, 1));
      setSubmitError(null);
    }
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (!selectedItem) {
      setSubmitError('Please select a collected resource.');
      return;
    }
    const qty = parseInt(distQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setSubmitError('Distributed quantity must be a positive number of at least 1.');
      return;
    }
    if (qty > selectedItem.remainingQuantity) {
      setSubmitError(`Cannot distribute more than the remaining eligible quantity (${selectedItem.remainingQuantity} ${selectedItem.unit}).`);
      return;
    }
    setSubmitError(null);
    setReviewStep(true);
  };

  const handleConfirmDistribution = async () => {
    if (!selectedItem || submitting) return;
    const qty = parseInt(distQuantity, 10);

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Generate a unique client-side idempotency key for this request attempt
      const idempotencyKey = `dist_${selectedItem.reservationId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payload = {
        reservationId: selectedItem.reservationId,
        quantityDistributed: qty,
        notes: distNotes.trim() || undefined,
        idempotencyKey
      };

      const result = await volunteerService.recordDistribution(payload, idempotencyKey);
      const recorded = result?.distribution;
      const updated = result?.updatedReservation;

      setSuccessReceipt({
        distributionId: recorded?.distributionId || 'DIST-RECORDED',
        itemDescription: selectedItem.itemDescription,
        category: selectedItem.category,
        quantityDistributed: qty,
        unit: selectedItem.unit,
        collectionReference: selectedItem.collectionReference,
        remainingQuantity: updated?.remainingQuantity != null ? updated.remainingQuantity : (selectedItem.remainingQuantity - qty),
        distributedAt: recorded?.distributedAt || new Date().toISOString(),
        isReplay: !!result?.idempotentReplay
      });

      setPageAlert({
        type: 'success',
        message: `Successfully recorded distribution of ${qty} ${selectedItem.unit} (${selectedItem.itemDescription}). Reference: ${recorded?.distributionId || 'DIST-NEW'}`
      });

      // Refresh records in background
      await fetchData();
    } catch (err) {
      console.error('Distribution record error:', err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to record distribution.';
      setSubmitError(msg);
      setReviewStep(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <PageHeader
          title="Volunteer Distribution & Activity Tracking"
          subtitle="Record community handovers of your collected resources and maintain a tamper-proof activity ledger."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Distributions', href: '/distributions', active: true }
          ]}
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCw size={14} />}
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </Button>
              {metrics.remainingInHandUnits > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Gift size={14} />}
                  onClick={() => {
                    const firstEligible = collectedItems.find((it) => it.remainingQuantity > 0);
                    if (firstEligible) handleOpenRecordModal(firstEligible);
                  }}
                >
                  Record Distribution
                </Button>
              )}
            </div>
          }
        />
      </div>

      {pageAlert && (
        <Alert
          variant={pageAlert.type}
          dismissible
          onDismiss={() => setPageAlert(null)}
          style={{ marginBottom: '20px' }}
        >
          {pageAlert.message}
        </Alert>
      )}

      {/* Top Level Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#E6F4F1', padding: '8px', borderRadius: '10px', color: '#0F766E' }}>
              <Package size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Total Collected</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937' }}>
            {metrics.totalCollectedUnits} <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>units</span>
          </div>
          <div style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600, marginTop: '4px' }}>
            From JanaSeva Hub pickups
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#DCFCE7', padding: '8px', borderRadius: '10px', color: '#059669' }}>
              <Truck size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Total Distributed</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937' }}>
            {metrics.totalDistributedUnits} <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>units</span>
          </div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
            Handed over to community
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #BBEFDF',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#0F766E', padding: '8px', borderRadius: '10px', color: '#FFFFFF' }}>
              <Gift size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F766E' }}>Remaining In-Hand</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F766E' }}>
            {metrics.remainingInHandUnits} <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F766E' }}>units</span>
          </div>
          <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
            {metrics.eligibleBatchesCount} resource {metrics.eligibleBatchesCount === 1 ? 'batch' : 'batches'} eligible
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '8px', borderRadius: '10px', color: '#D97706' }}>
              <FileText size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Ledger Events</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937' }}>
            {metrics.distributionEventsCount} <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>events</span>
          </div>
          <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600, marginTop: '4px' }}>
            Auditable distribution history
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('collected')}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'collected' ? '#0F766E' : 'transparent',
            color: activeTab === 'collected' ? '#FFFFFF' : '#4B5563',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Package size={16} />
          <span>My Collected Items</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: activeTab === 'collected' ? 'rgba(255,255,255,0.25)' : '#E5E7EB',
              color: activeTab === 'collected' ? '#FFFFFF' : '#374151'
            }}
          >
            {collectedItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'history' ? '#0F766E' : 'transparent',
            color: activeTab === 'history' ? '#FFFFFF' : '#4B5563',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Truck size={16} />
          <span>Distribution History</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: activeTab === 'history' ? 'rgba(255,255,255,0.25)' : '#E5E7EB',
              color: activeTab === 'history' ? '#FFFFFF' : '#374151'
            }}
          >
            {distributions.length}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '320px',
            gap: '16px'
          }}
        >
          <Spinner size="lg" />
          <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading volunteer distributions & items...</div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div style={{ padding: '24px 0' }}>
          <ErrorState
            title="Unable to Load Distributions"
            message={error}
            action={
              <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchData}>
                Retry
              </Button>
            }
          />
        </div>
      )}

      {/* TAB 1: Collected Items */}
      {!loading && !error && activeTab === 'collected' && (
        <div>
          {collectedItems.length === 0 ? (
            <EmptyState
              title="No Collected Items Available"
              message="You haven't collected any resources from JanaSeva Hubs yet. Reserve items on the explore page and confirm your collection pass at any self-service kiosk to start distributing to community members."
              action={
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="primary" onClick={() => navigate('/explore')}>
                    Explore Resources
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/reservations')}>
                    View Reservations
                  </Button>
                </div>
              }
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px'
              }}
            >
              {collectedItems.map((item) => {
                const percentDistributed = item.collectedQuantity > 0
                  ? Math.min(100, Math.round((item.distributedQuantity / item.collectedQuantity) * 100))
                  : 0;
                const isEligible = item.remainingQuantity > 0;

                return (
                  <Card
                    key={item.reservationId}
                    style={{
                      borderRadius: '16px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Card Header: Category & Eligibility Badge */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: '#E6F4F1',
                            color: '#0F766E',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {item.category || 'General'}
                        </span>
                        {isEligible ? (
                          <StatusBadge variant="success">Eligible ({item.remainingQuantity} left)</StatusBadge>
                        ) : (
                          <StatusBadge variant="neutral">Fully Distributed</StatusBadge>
                        )}
                      </div>

                      {/* Item Description */}
                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: 700,
                          color: '#111827',
                          margin: '0 0 6px 0',
                          lineHeight: 1.3
                        }}
                      >
                        {item.itemDescription || 'JanaSeva Resource'}
                      </h3>

                      {/* Collection Reference & Hub */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#6B7280',
                          marginBottom: '16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600 }}>Collection Ref:</span>
                          <code
                            style={{
                              backgroundColor: '#F3F4F6',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              color: '#374151'
                            }}
                          >
                            {item.collectionReference}
                          </code>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} />
                          <span>Collected: {formatDate(item.collectedAt)}</span>
                        </div>
                      </div>

                      {/* Quantity Accounting Box */}
                      <div
                        style={{
                          backgroundColor: '#F9FAFB',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          border: '1px solid #F3F4F6',
                          marginBottom: '16px'
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '8px',
                            textAlign: 'center',
                            marginBottom: '10px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Collected</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>
                              {item.collectedQuantity}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Distributed</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                              {item.distributedQuantity}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Remaining</div>
                            <div
                              style={{
                                fontSize: '16px',
                                fontWeight: 800,
                                color: isEligible ? '#0F766E' : '#9CA3AF'
                              }}
                            >
                              {item.remainingQuantity}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: '#E5E7EB',
                            borderRadius: '9999px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${percentDistributed}%`,
                              height: '100%',
                              backgroundColor: isEligible ? '#059669' : '#9CA3AF',
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: '#6B7280',
                            marginTop: '4px'
                          }}
                        >
                          <span>Progress</span>
                          <span>{percentDistributed}% Distributed</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                      {isEligible ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Gift size={14} />}
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => handleOpenRecordModal(item)}
                        >
                          Record Distribution ({item.remainingQuantity} {item.unit} available)
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<FileText size={14} />}
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => {
                            setActiveTab('history');
                          }}
                        >
                          View In Distribution Ledger
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Distribution History */}
      {!loading && !error && activeTab === 'history' && (
        <div>
          {distributions.length === 0 ? (
            <EmptyState
              title="No Distributions Recorded Yet"
              message="You haven't logged any distributions yet. When you distribute your collected items to the community, record each handover here to maintain your volunteer activity score and verified impact history."
              action={
                metrics.remainingInHandUnits > 0 ? (
                  <Button
                    variant="primary"
                    icon={<Gift size={16} />}
                    onClick={() => {
                      const firstEligible = collectedItems.find((it) => it.remainingQuantity > 0);
                      if (firstEligible) handleOpenRecordModal(firstEligible);
                    }}
                  >
                    Record First Distribution
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate('/reservations')}>
                    Check My Reservations
                  </Button>
                )
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {distributions.map((dist) => (
                <div
                  key={dist.distributionId || dist._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E5E7EB',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                    <div
                      style={{
                        backgroundColor: '#DCFCE7',
                        color: '#059669',
                        padding: '12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Truck size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#111827'
                          }}
                        >
                          {dist.distributionId}
                        </span>
                        <StatusBadge variant="success">Distributed</StatusBadge>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                        {dist.quantityDistributed} {dist.unit || 'units'} distributed
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                        Collection Ref: <span style={{ fontFamily: 'monospace' }}>{dist.collectionReference}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Note Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                      <Calendar size={13} />
                      <span>{formatDate(dist.distributedAt)}</span>
                    </div>
                    {dist.notes && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#4B5563',
                          backgroundColor: '#F9FAFB',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          maxWidth: '360px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={dist.notes}
                      >
                        <strong>Note:</strong> {dist.notes}
                      </div>
                    )}
                  </div>

                  {/* Activity Points Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        backgroundColor: '#E6F4F1',
                        color: '#0F766E',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>+25 Points</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDistribution(dist);
                        setDetailModalOpen(true);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Record Distribution Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => {
          if (!submitting) {
            setRecordModalOpen(false);
            setReviewStep(false);
            setSubmitError(null);
            setSuccessReceipt(null);
          }
        }}
        title={
          successReceipt
            ? 'Distribution Handover Complete'
            : reviewStep
            ? 'Review & Confirm Distribution'
            : 'Record Community Distribution'
        }
        footer={
          successReceipt ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <Button
                variant="primary"
                onClick={() => {
                  setRecordModalOpen(false);
                  setSuccessReceipt(null);
                  setActiveTab('history');
                }}
              >
                View in Distribution History
              </Button>
            </div>
          ) : reviewStep ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <Button
                variant="secondary"
                disabled={submitting}
                onClick={() => setReviewStep(false)}
              >
                Back to Edit
              </Button>
              <Button
                variant="primary"
                icon={<CheckCircle2 size={16} />}
                disabled={submitting}
                onClick={handleConfirmDistribution}
              >
                {submitting ? 'Confirming...' : 'Confirm Handover'}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <Button
                variant="secondary"
                onClick={() => setRecordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<ArrowRight size={16} />}
                onClick={handleProceedToReview}
              >
                Review Handover
              </Button>
            </div>
          )
        }
      >
        {successReceipt ? (
          /* Receipt Screen */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                Distribution Recorded Successfully
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                Your distribution has been persisted to the JanaSeva activity ledger.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Distribution ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0F766E' }}>
                  {successReceipt.distributionId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Resource:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{successReceipt.itemDescription}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Quantity Distributed:</span>
                <span style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}>
                  {successReceipt.quantityDistributed} {successReceipt.unit}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Remaining In-Hand Balance:</span>
                <span style={{ fontWeight: 700, color: '#1F2937' }}>
                  {successReceipt.remainingQuantity} {successReceipt.unit}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Linked Collection Ref:</span>
                <span style={{ fontFamily: 'monospace', color: '#374151' }}>
                  {successReceipt.collectionReference}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Recorded At:</span>
                <span style={{ color: '#374151' }}>{formatDate(successReceipt.distributedAt)}</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#E6F4F1',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} />
              <span>You earned <strong>+25 JanaSeva Volunteer Points</strong> for this verified community handover!</span>
            </div>
          </div>
        ) : reviewStep ? (
          /* Step 2: Review & Confirm */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Please review your distribution details carefully before confirming. Once recorded, the remaining balance of this collected resource will be permanently decremented.
              </div>
            </div>

            {submitError && (
              <Alert variant="danger" dismissible onDismiss={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Selected Resource:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{selectedItem?.itemDescription}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Collection Reference:</span>
                <span style={{ fontFamily: 'monospace', color: '#374151' }}>
                  {selectedItem?.collectionReference}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Current In-Hand Stock:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {selectedItem?.remainingQuantity} {selectedItem?.unit}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  backgroundColor: '#DCFCE7',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}
              >
                <span style={{ color: '#047857', fontWeight: 600 }}>Quantity to Distribute:</span>
                <span style={{ fontWeight: 800, color: '#047857' }}>
                  {distQuantity} {selectedItem?.unit}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Remaining Balance After:</span>
                <span style={{ fontWeight: 700, color: '#1F2937' }}>
                  {selectedItem?.remainingQuantity - parseInt(distQuantity, 10)} {selectedItem?.unit}
                </span>
              </div>
              {distNotes.trim() && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <span style={{ color: '#6B7280' }}>Handover Note:</span>
                  <div
                    style={{
                      backgroundColor: '#F9FAFB',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#374151'
                    }}
                  >
                    {distNotes.trim()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 1: Input Form */
          <form onSubmit={handleProceedToReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {submitError && (
              <Alert variant="danger" dismissible onDismiss={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}

            {/* Privacy Assurance Notice */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px',
                color: '#15803D'
              }}
            >
              <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#16A34A' }} />
              <div>
                <strong>Zero Beneficiary PII Required:</strong> JanaSeva protects privacy by design. Beneficiary names, contact numbers, and identification documents are neither required nor recorded.
              </div>
            </div>

            {/* Resource Selection */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Collected Resource Batch:
              </label>
              <select
                value={selectedItem?.reservationId || ''}
                onChange={handleSelectResourceChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  color: '#111827'
                }}
              >
                {collectedItems.map((it) => (
                  <option
                    key={it.reservationId}
                    value={it.reservationId}
                    disabled={it.remainingQuantity <= 0}
                  >
                    {it.itemDescription} ({it.remainingQuantity} of {it.collectedQuantity} {it.unit} remaining) — Ref: {it.collectionReference}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Resource Stock Info */}
            {selectedItem && (
              <div
                style={{
                  backgroundColor: '#F8FAF9',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    In-Hand Remaining Balance
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F766E' }}>
                    {selectedItem.remainingQuantity} {selectedItem.unit}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Total Collected</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {selectedItem.collectedQuantity} {selectedItem.unit}
                  </div>
                </div>
              </div>
            )}

            {/* Distribution Quantity Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Quantity Distributed:
                </label>
                {selectedItem && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setDistQuantity(1)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      1
                    </button>
                    {selectedItem.remainingQuantity >= 5 && (
                      <button
                        type="button"
                        onClick={() => setDistQuantity(5)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        5
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDistQuantity(selectedItem.remainingQuantity)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        border: '1px solid #0F766E',
                        backgroundColor: '#E6F4F1',
                        color: '#0F766E',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      All ({selectedItem.remainingQuantity})
                    </button>
                  </div>
                )}
              </div>
              <input
                type="number"
                min="1"
                max={selectedItem?.remainingQuantity || 1}
                value={distQuantity}
                onChange={(e) => setDistQuantity(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px'
                }}
              />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                Enter whole number between 1 and {selectedItem?.remainingQuantity || 1}.
              </div>
            </div>

            {/* Optional Note Input */}
            <div>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                Distribution Context / Location Note (Optional):
              </label>
              <textarea
                value={distNotes}
                onChange={(e) => setDistNotes(e.target.value)}
                placeholder="e.g. Distributed during East Ward evening food drive or community shelter outreach..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                Do not include names, phone numbers, or private beneficiary personal details.
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: Distribution Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Distribution Ledger Entry"
        footer={
          <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedDistribution && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                borderBottom: '1px solid #E5E7EB'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Distribution Reference</div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: '#1F2937' }}>
                  {selectedDistribution.distributionId}
                </div>
              </div>
              <StatusBadge variant="success">Completed</StatusBadge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#6B7280' }}>Quantity Distributed</div>
                <div style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}>
                  {selectedDistribution.quantityDistributed} {selectedDistribution.unit || 'units'}
                </div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Handover Timestamp</div>
                <div style={{ fontWeight: 600, color: '#1F2937' }}>
                  {formatDate(selectedDistribution.distributedAt)}
                </div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Linked Collection Ref</div>
                <div style={{ fontFamily: 'monospace', color: '#374151' }}>
                  {selectedDistribution.collectionReference}
                </div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Volunteer Account</div>
                <div style={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedDistribution.volunteerId}
                </div>
              </div>
            </div>

            {selectedDistribution.notes && (
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Distribution Note</div>
                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#374151',
                    border: '1px solid #F3F4F6'
                  }}
                >
                  {selectedDistribution.notes}
                </div>
              </div>
            )}

            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} />
              <span>Verified immutable activity event tracked in the JanaSeva distribution ledger.</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DistributionsPage;
