import React, { useState, useEffect } from 'react';
import { Card, StatusBadge, Button, Alert, Modal, Spinner, EmptyState, ErrorState } from '@janaseva/ui';
import { MapPin, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import volunteerService from '../services/volunteerService';

export function MyReservationsPage() {
  const navigate = useNavigate();

  // Modals & Selection
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Data & Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async (status = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getReservations(status);
      setReservations(data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setError(err.response?.data?.error?.message || err.message || 'Could not load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(statusFilter);
  }, [statusFilter]);

  const handleOpenCancelModal = (res) => {
    setSelectedRes(res);
    setCancelReason('');
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleOpenDetailModal = (res) => {
    setSelectedRes(res);
    setDetailModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRes || cancelling) return;
    const resId = selectedRes.reservationId || selectedRes._id || selectedRes.id;

    try {
      setCancelling(true);
      setCancelError(null);
      const result = await volunteerService.cancelReservation(resId, cancelReason || 'Cancelled by volunteer via dashboard');
      setCancelModalOpen(false);
      setActionSuccess(
        `Reservation #${resId} was successfully cancelled.${
          result?.releasedStock ? ` ${result.releasedStock} units released back to Hub available stock.` : ''
        }`
      );
      // Refresh list
      await fetchReservations(statusFilter);
    } catch (err) {
      console.error('Cancellation failed:', err);
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to cancel reservation.';
      setCancelError(errMsg);
    } finally {
      setCancelling(false);
    }
  };

  const getDeadlineText = (deadline) => {
    if (!deadline) return 'No deadline set';
    const diffMs = new Date(deadline).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeStr = new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${timeStr} (${hours}h ${mins}m left)`;
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

  const activeReservations = reservations.filter(
    (r) => r.status === 'active' || r.status === 'PENDING_COLLECTION' || r.status === 'ready_for_collection'
  );
  const distinctHubs = [...new Set(activeReservations.map((r) => r.hubName || r.hubId))];
  const totalReservedUnits = activeReservations.reduce((sum, r) => sum + (r.quantity || 0), 0);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
      case 'ready_for_collection':
      case 'READY_FOR_COLLECTION':
        return 'success';
      case 'completed':
      case 'collected':
        return 'neutral';
      case 'cancelled':
        return 'danger';
      case 'expired':
        return 'warning';
      case 'blocked':
      case 'DISCREPANCY_LOCKED':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            My Reservations & Collection Plan
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Manage active reserved items and coordinate physical collections across Hubs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCw size={14} />}
            onClick={() => fetchReservations(statusFilter)}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/explore')}
          >
            Browse Resources
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <Alert
          variant="success"
          dismissible
          onDismiss={() => setActionSuccess(null)}
          style={{ marginBottom: '20px' }}
        >
          {actionSuccess}
        </Alert>
      )}

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'all', label: 'All Reservations' },
          { key: 'active', label: 'Active & Pending' },
          { key: 'completed', label: 'Collected / Completed' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'expired', label: 'Expired' }
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border-subtle)',
                backgroundColor: isActive ? 'var(--color-primary-soft)' : '#FFFFFF',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', gap: '16px' }}>
          <Spinner size="lg" />
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading your reserved resources...</div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div style={{ padding: '24px 0' }}>
          <ErrorState
            title="Could Not Load Reservations"
            message={error}
            action={
              <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={() => fetchReservations(statusFilter)}>
                Retry Connection
              </Button>
            }
          />
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Combined Collection Plan Summary */}
          {activeReservations.length > 0 && statusFilter !== 'cancelled' && statusFilter !== 'expired' && (
            <Card style={{ marginBottom: '24px', backgroundColor: 'var(--color-primary-soft)', borderColor: '#BBEFDF' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F514C', marginBottom: '8px' }}>
                Combined Collection Plan ({distinctHubs.length} Active {distinctHubs.length === 1 ? 'Hub' : 'Hubs'})
              </h3>
              <p style={{ fontSize: '13px', color: '#0F514C', lineHeight: 1.5, marginBottom: '12px' }}>
                You have {totalReservedUnits} units reserved across {distinctHubs.length} {distinctHubs.length === 1 ? 'Hub' : 'Hubs'}. Please plan your visit according to the earliest collection deadline.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#0F514C' }}>
                {activeReservations.map((r, idx) => (
                  <div key={r._id || idx}>
                    <strong>Stop {idx + 1}:</strong> {r.hubName || r.hubId} ({r.quantity} {r.unit || 'units'}) • Deadline: {getDeadlineText(r.deadline)}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reservations List */}
          {reservations.length === 0 ? (
            <EmptyState
              title={statusFilter === 'all' ? 'No Reservations Found' : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Reservations`}
              message="Explore genuine available inventory at local JanaSeva Hubs to reserve items for community distribution."
              action={
                <Button variant="primary" size="md" onClick={() => navigate('/explore')}>
                  Explore Available Resources
                </Button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reservations.map((res) => {
                const isBlocked = res.status === 'blocked' || res.status === 'DISCREPANCY_LOCKED';
                const isCancellable = res.status === 'active' || res.status === 'pending' || res.status === 'ready_for_collection';
                const statusVariant = getStatusVariant(res.status);

                return (
                  <Card key={res._id || res.id || res.reservationId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>
                          Reservation #{res.reservationId || res.id || res._id}
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '2px 0' }}>
                          {res.itemDescription || `${res.category ? res.category.toUpperCase() : 'Resource'} Package`}
                        </h3>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {res.hubName || res.hubId} {res.hubAddress ? `(${res.hubAddress})` : ''}
                        </div>
                      </div>

                      <StatusBadge variant={statusVariant}>
                        {(res.status || 'active').replace(/_/g, ' ')}
                      </StatusBadge>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <div>Reserved: <strong>{res.quantity} {res.unit || 'units'}</strong></div>
                      {res.collectedQuantity > 0 && (
                        <div>Collected: <strong>{res.collectedQuantity} {res.unit || 'units'}</strong></div>
                      )}
                      <div>Deadline: <strong style={{ color: statusVariant === 'warning' ? 'var(--color-warning)' : 'inherit' }}>{getDeadlineText(res.deadline)}</strong></div>
                      <div>Created: <strong>{formatDate(res.createdAt)}</strong></div>
                    </div>

                    {res.status === 'cancelled' && (
                      <div style={{ fontSize: '12px', color: '#B91C1C', backgroundColor: '#FEF2F2', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                        Cancelled on {formatDate(res.cancelledAt || res.updatedAt)} {res.cancellationReason ? `— "${res.cancellationReason}"` : ''}
                      </div>
                    )}

                    {isBlocked && (
                      <Alert variant="danger" style={{ marginBottom: '12px' }}>
                        <strong>Collection Blocked:</strong> {res.blockReason || 'Discrepancy reported. Under admin investigation.'}
                      </Alert>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDetailModal(res)}
                      >
                        View Details
                      </Button>

                      {res.status === 'collected' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate('/distributions')}
                        >
                          Distribute
                        </Button>
                      )}

                      {isCancellable && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleOpenCancelModal(res)}
                          disabled={isBlocked}
                        >
                          Cancel Reservation
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !cancelling && setCancelModalOpen(false)}
        title="Cancel Reservation?"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={cancelling}
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Reservation
            </Button>
            <Button
              variant="danger"
              disabled={cancelling}
              onClick={handleConfirmCancel}
            >
              {cancelling ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Spinner size="sm" /> Cancelling...
                </span>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cancelError && (
            <Alert variant="danger">
              {cancelError}
            </Alert>
          )}

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to cancel reservation <strong>#{selectedRes?.reservationId || selectedRes?._id}</strong> for <strong>{selectedRes?.quantity} {selectedRes?.unit || 'units'}</strong> at <strong>{selectedRes?.hubName || selectedRes?.hubId}</strong>?
          </p>

          <p style={{ fontSize: '13px', color: '#4B5563', margin: 0 }}>
            Uncollected eligible inventory will be immediately released back to available stock for other volunteers.
          </p>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Reason for Cancellation (optional):
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelling}
              placeholder="e.g. Schedule conflict, transportation unavailable..."
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
          </div>
        </div>
      </Modal>

      {/* Reservation Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Reservation Details"
        footer={
          <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Reference Code</div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-family-mono)', color: '#1F2937' }}>
                  {selectedRes.reservationId || selectedRes._id}
                </div>
              </div>
              <StatusBadge variant={getStatusVariant(selectedRes.status)}>
                {(selectedRes.status || 'active').replace(/_/g, ' ')}
              </StatusBadge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#6B7280' }}>JanaSeva Hub</div>
                <div style={{ fontWeight: 600, color: '#1F2937' }}>{selectedRes.hubName || selectedRes.hubId}</div>
                {selectedRes.hubAddress && <div style={{ fontSize: '12px', color: '#6B7280' }}>{selectedRes.hubAddress}</div>}
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Category & Resource</div>
                <div style={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedRes.itemDescription || selectedRes.category}
                </div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Reserved Quantity</div>
                <div style={{ fontWeight: 700, color: '#0F766E', fontSize: '15px' }}>
                  {selectedRes.quantity} {selectedRes.unit || 'units'}
                </div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Collected Quantity</div>
                <div style={{ fontWeight: 600, color: '#1F2937' }}>
                  {selectedRes.collectedQuantity || 0} {selectedRes.unit || 'units'}
                </div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Reserved At</div>
                <div style={{ fontWeight: 500, color: '#1F2937' }}>{formatDate(selectedRes.createdAt)}</div>
              </div>

              <div>
                <div style={{ color: '#6B7280' }}>Collection Deadline</div>
                <div style={{ fontWeight: 600, color: '#D97706' }}>{formatDate(selectedRes.deadline)}</div>
              </div>
            </div>

            {selectedRes.status === 'cancelled' && (
              <div style={{ padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FEE2E2', fontSize: '13px', color: '#991B1B' }}>
                <div><strong>Cancelled At:</strong> {formatDate(selectedRes.cancelledAt || selectedRes.updatedAt)}</div>
                {selectedRes.cancellationReason && (
                  <div style={{ marginTop: '4px' }}><strong>Reason:</strong> {selectedRes.cancellationReason}</div>
                )}
              </div>
            )}

            <div style={{ padding: '12px', backgroundColor: '#F8FAF9', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', color: '#4B5563' }}>
              <strong>Self-Service Hub Collection:</strong> Present your volunteer QR code or reference ID at the JanaSeva Hub kiosk to claim your reserved resources before the deadline.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MyReservationsPage;
