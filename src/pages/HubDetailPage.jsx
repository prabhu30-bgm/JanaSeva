import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import hubService from '../services/hubService';
import {
  PageHeader,
  Card,
  StatusBadge,
  Button,
  Spinner,
  ErrorState,
  EmptyState,
  Alert
} from '@janaseva/ui';
import {
  MapPin,
  Clock,
  Phone,
  User,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  RotateCw,
  CheckCircle2
} from 'lucide-react';

export function HubDetailPage() {
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [hub, setHub] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHubAndInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hubRes, invRes] = await Promise.all([
        hubService.getHubDetails(hubId),
        hubService.getHubInventory(hubId)
      ]);
      setHub(hubRes);
      setInventoryData(invRes);
    } catch (err) {
      console.error('Failed to load hub details:', err);
      setError(err.response?.data?.error?.message || `Unable to load Hub details for "${hubId}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubAndInventory();

    const handleInventoryChange = (e) => {
      const updatedHub = e.detail?.hubId;
      if (!updatedHub || updatedHub.toUpperCase() === (hubId || '').toUpperCase()) {
        fetchHubAndInventory();
      }
    };
    window.addEventListener('janaseva:inventory_updated', handleInventoryChange);
    return () => {
      window.removeEventListener('janaseva:inventory_updated', handleInventoryChange);
    };
  }, [hubId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '16px' }}>
        <Spinner size="lg" />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading Hub information & authoritative inventory...</div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div style={{ padding: '24px 0' }}>
        <ErrorState
          title="Hub Not Found"
          message={error || 'The requested Hub could not be located in the JanaSeva network.'}
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" size="md" icon={<ArrowLeft size={14} />} onClick={() => navigate('/hubs')}>
                Back to Explore Hubs
              </Button>
              <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchHubAndInventory}>
                Retry
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const isClosed = hub.status !== 'active';
  const items = inventoryData?.items || [];
  const categorySummary = inventoryData?.categorySummary || [];
  const coords = hub.location?.coordinates || [77.6412, 12.9719];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: '16px' }}>
        <NavLink
          to="/hubs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={14} /> Back to Hub Discovery (3 km)
        </NavLink>
      </div>

      {/* Page Header */}
      <PageHeader
        title={hub.name}
        subtitle={`${hub.locality || ''}, ${hub.city || 'Bangalore'} • Code: ${hub.hubId}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge variant={hub.status === 'active' ? 'success' : 'neutral'}>
              {hub.status === 'active' ? 'OPEN FOR INTAKE & COLLECTION' : 'TEMPORARY CLOSURE'}
            </StatusBadge>
          </div>
        }
      />

      {/* Hub Closure Warning */}
      {isClosed && (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            variant="warning"
            title="Hub Operations Temporarily Suspended"
            message={
              hub.closureReason ||
              'This facility is temporarily paused for maintenance or sanitation. Scheduled pickups and drop-offs are paused.'
            }
          />
        </div>
      )}

      {/* Main Hub Information & Spec Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Hub Specs & Contact */}
        <Card title="Hub Facility Specifications">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                  Address & Locality
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {hub.address}
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginTop: '4px'
                  }}
                >
                  Get Directions in Google Maps <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Clock size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                  Operating Schedule
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {hub.operatingHours?.days || 'Monday – Sunday'}: {hub.operatingHours?.open || '08:30'} –{' '}
                  {hub.operatingHours?.close || '20:00'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <User size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                  Hub Coordinator
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {hub.coordinatorName || 'Designated On-Duty Operator'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Phone size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                  Direct Terminal Phone
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px', fontFamily: 'var(--font-family-mono)' }}>
                  {hub.contactPhone || '+91 98450 12345'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Capacity & Categories */}
        <Card title="Capacity & Supported Categories">
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Physical Storage Utilization</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{hub.currentUtilizationPct || 65}%</strong>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${hub.currentUtilizationPct || 65}%`,
                height: '100%',
                backgroundColor: (hub.currentUtilizationPct || 65) > 85 ? 'var(--color-error)' : 'var(--color-primary)',
                borderRadius: '4px'
              }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Max capacity: {hub.capacityUnits || 5000} standard volumetric units
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Authorized Intake Categories
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(hub.supportedCategories || ['clothing', 'food', 'books', 'groceries', 'medical']).map((cat) => (
                <span
                  key={cat}
                  className="badge badge-info"
                  style={{ textTransform: 'capitalize', fontSize: '12px', padding: '4px 10px' }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', gap: '8px' }}>
            <NavLink
              to="/donate"
              className="btn btn-primary btn-sm"
              style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
            >
              Donate at This Hub
            </NavLink>
          </div>
        </Card>
      </div>

      {/* Authoritative Available Inventory Section */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Authoritative Available Inventory
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Only verified in-stock batches with positive available stock (non-expired)
          </div>
        </div>
        <StatusBadge variant="success">
          Live Terminal Feed
        </StatusBadge>
      </div>

      {/* Category Summary Cards */}
      {categorySummary.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {categorySummary.map((cat) => (
            <Card key={cat.category} style={{ padding: '14px 16px' }}>
              <div style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                {cat.category}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {cat.totalAvailableUnits}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {cat.batchesCount} verified batch{cat.batchesCount > 1 ? 'es' : ''}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Inventory Batch Table */}
      <Card>
        {items.length === 0 ? (
          <EmptyState
            title="No Items Currently in Stock"
            message="All inventory at this Hub has been collected or reserved. New donations will appear here once inspected by the terminal operator."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Batch Reference</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Category & Item</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Available Stock</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Reserved</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Total Units</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>Status & Expiry</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.batchId} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-family-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.batchId}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {item.subCategory || item.category}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {item.description}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '14px' }}>
                        {item.qtyAvailable} {item.unit}
                      </strong>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--color-text-secondary)' }}>
                      {item.qtyReserved || 0} {item.unit}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--color-text-muted)' }}>
                      {item.qtyTotal} {item.unit}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {item.isPerishable && item.expiryDate ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-error)', fontWeight: 600, fontSize: '12px' }}>
                          <AlertTriangle size={13} />
                          Expires {new Date(item.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '12px' }}>
                          <CheckCircle2 size={13} /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Category Donation & Collection Guidelines */}
      <Card title="Hub Intake & Collection Guidelines" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Clothing & Blankets</h4>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Must be clean, washed, and gently used or new. Hub operators perform sanitation inspections before approving into stock.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Packaged & Cooked Food</h4>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Cooked rations must be deposited within 2 hours of preparation and undergo temperature checks. Sealed dry groceries require valid FSSAI/expiry dates.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>First Aid & Medical Supplies</h4>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              All first aid kits and dressing packets must remain in factory-sealed manufacturer packaging with tamper-evident seals intact.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default HubDetailPage;
