import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Minus,
  Plus,
  Check,
  RotateCw
} from 'lucide-react';
import { Button, Card, Alert, Modal, Spinner, ErrorState } from '@janaseva/ui';
import hubService from '../services/hubService';
import volunteerService from '../services/volunteerService';

const CATEGORY_VISUALS = {
  food: {
    title: 'Nutritious Food',
    color: '#0F766E',
    bgLight: '#E6F4F1',
    iconEmoji: '🍲',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  clothes: {
    title: 'Clothing & Blankets',
    color: '#D97706',
    bgLight: '#FEF3C7',
    iconEmoji: '👕',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'
  },
  clothing: {
    title: 'Clothing & Blankets',
    color: '#D97706',
    bgLight: '#FEF3C7',
    iconEmoji: '👕',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'
  },
  books: {
    title: 'Curriculum Textbooks',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    iconEmoji: '📚',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
  },
  other: {
    title: 'Community Essentials',
    color: '#7C3AED',
    bgLight: '#F3E8FF',
    iconEmoji: '📦',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  }
};

export function ResourceDetailPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reservedQuantity, setReservedQuantity] = useState(1);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  const fetchResource = async () => {
    try {
      setLoading(true);
      setError(null);
      let found = null;
      try {
        found = await hubService.getBatchDetails(resourceId);
      } catch (e) {
        // Fallback to searching all inventory
        const allItems = await hubService.getAllAvailableInventory();
        found = allItems.find(
          (i) => i.batchId === resourceId || i._id === resourceId || i.batchId?.toLowerCase() === resourceId?.toLowerCase()
        );
      }

      if (found) {
        const visual = CATEGORY_VISUALS[found.category?.toLowerCase()] || CATEGORY_VISUALS.other;
        setResource({
          id: found.batchId || found._id,
          batchId: found.batchId,
          hubId: found.hubId,
          category: found.category,
          title: found.subCategory || visual.title,
          subtitle: found.description || `Batch #${found.batchId}`,
          portions: `${found.qtyAvailable} ${found.unit || 'units'} available`,
          rawQuantity: found.qtyAvailable,
          unit: found.unit || 'units',
          point: found.hubName || found.hubId,
          hubAddress: found.hubAddress,
          distance: 'Within 3 km',
          availableUntil: found.expiryDate ? new Date(found.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Operating hours',
          status: 'Available',
          iconEmoji: visual.iconEmoji,
          bgLight: visual.bgLight,
          color: visual.color,
          image: visual.image,
          description: found.description || `Inspected and verified batch #${found.batchId} in Hub storage.`
        });
        setReservedQuantity(Math.min(5, Math.max(1, found.qtyAvailable || 1)));
      } else {
        setError(`Resource batch "${resourceId}" not found in current inventory.`);
      }
    } catch (err) {
      console.error('Failed to load resource detail:', err);
      setError(err.response?.data?.error?.message || 'Could not load resource details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [resourceId]);

  const handleOpenReserveModal = () => {
    setReservationError(null);
    setReservationConfirmed(false);
    setIdempotencyKey(`res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    setReserveModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!resource || submitting) return;
    try {
      setSubmitting(true);
      setReservationError(null);

      await volunteerService.createReservation({
        hubId: resource.hubId,
        batchId: resource.batchId,
        quantity: reservedQuantity,
        idempotencyKey
      });

      setReservationConfirmed(true);
      setTimeout(() => {
        setReserveModalOpen(false);
        navigate('/reservations');
      }, 1500);
    } catch (err) {
      console.error('Reservation failed:', err);
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to complete reservation.';
      setReservationError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', gap: '16px' }}>
        <Spinner size="lg" />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading batch specifications from Hub...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '24px 0' }}>
        <ErrorState
          title="Resource Unavailable"
          message={error || 'Could not locate batch specifications.'}
          action={
            <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchResource}>
              Retry Connection
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Back Action matching Screen 8 */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#4B5563',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Resources</span>
        </button>
      </div>

      {/* Main Resource Showcase Card matching Screen 8 */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        {/* Hero Image */}
        <div style={{ height: '340px', position: 'relative', overflow: 'hidden' }}>
          <img
            src={resource.image}
            alt={resource.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#D1FAE5',
              color: '#059669',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '12px',
              border: '1px solid #A7F3D0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            ● {resource.status}
          </div>
        </div>

        {/* Content & Details */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#E6F4F1',
                  color: '#0F766E',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginBottom: '8px'
                }}
              >
                {resource.category}
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1F2937', margin: 0, letterSpacing: '-0.02em' }}>
                {resource.title}
              </h1>
              <p style={{ fontSize: '15px', color: '#6B7280', margin: '4px 0 0 0' }}>
                {resource.subtitle}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F766E' }}>
                {resource.portions}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Live Authoritative Stock</div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#F8FAF9',
              borderRadius: '16px',
              border: '1px solid #E5E7EB'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#E6F4F1',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Physical Location</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>
                  {resource.point} ({resource.distance})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Collection Window</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937' }}>
                  Available until {resource.availableUntil}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
              Inspection & Safety Verification
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#4B5563', margin: 0 }}>
              {resource.description}
            </p>
          </div>

          {/* Primary Action Button matching Screen 8 */}
          <div style={{ paddingTop: '12px' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleOpenReserveModal}
              style={{
                borderRadius: '9999px',
                height: '52px',
                fontSize: '16px',
                fontWeight: 700,
                backgroundColor: '#0F766E',
                boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)'
              }}
            >
              Reserve Resource →
            </Button>
          </div>
        </div>
      </div>

      {/* Screen 12: Reservation Modal */}
      {reserveModalOpen && (
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
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📦</span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                  Reserve Resource
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setReserveModalOpen(false)}
                disabled={submitting}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#9CA3AF',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {reservationError && (
              <Alert variant="danger" style={{ marginBottom: '16px' }}>
                {reservationError}
              </Alert>
            )}

            {/* Item Mini Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#F8FAF9',
                border: '1px solid #E5E7EB',
                marginBottom: '24px'
              }}
            >
              <img
                src={resource.image}
                alt={resource.title}
                style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>{resource.title}</div>
                <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600 }}>{resource.portions}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  {resource.point} • {resource.distance}
                </div>
              </div>
            </div>

            {/* Quantity Selector matching Screen 12 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '10px' }}>
                Quantity to Reserve
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <button
                  type="button"
                  disabled={submitting || reservationConfirmed}
                  onClick={() => setReservedQuantity(Math.max(1, reservedQuantity - 1))}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: submitting || reservationConfirmed ? 'not-allowed' : 'pointer',
                    color: '#1F2937'
                  }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937' }}>
                  {reservedQuantity} <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>{resource.unit}</span>
                </span>
                <button
                  type="button"
                  disabled={submitting || reservationConfirmed}
                  onClick={() => setReservedQuantity(Math.min(resource.rawQuantity, reservedQuantity + 1))}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#E6F4F1',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: submitting || reservationConfirmed ? 'not-allowed' : 'pointer',
                    color: '#0F766E'
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Confirmation Note */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                fontSize: '12px',
                color: '#1E40AF',
                marginBottom: '24px'
              }}
            >
              Once confirmed, your reservation will be locked and a Volunteer Dispatch QR Code will be ready for self-service collection at {resource.point}.
            </div>

            {/* Confirm Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting || reservationConfirmed}
              onClick={handleConfirmReservation}
              style={{
                borderRadius: '9999px',
                height: '48px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: reservationConfirmed ? '#059669' : '#0F766E'
              }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Spinner size="sm" /> Confirming with Hub...
                </span>
              ) : reservationConfirmed ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={18} /> Reservation Confirmed!
                </span>
              ) : (
                'Confirm Reservation'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceDetailPage;
