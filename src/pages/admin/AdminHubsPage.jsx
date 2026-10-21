import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Phone,
  User,
  Package,
  X,
  Navigation,
  Compass,
  Building
} from 'lucide-react';

export function HubsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [points, setPoints] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // New Hub Form State
  const [newHub, setNewHub] = useState({
    name: '',
    locality: '',
    address: '',
    coordinatorName: '',
    contactPhone: '',
    openHours: '08:00 AM',
    closeHours: '08:00 PM',
    lat: 12.9716,
    lng: 77.6412
  });

  const loadHubs = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/hubs');
      if (res.ok) {
        const json = await res.json();
        const rawHubs = json.data?.hubs || [];
        const formatted = rawHubs.map((h, idx) => ({
          id: h.hubId,
          code: h.code || `Point ${idx + 1}`,
          name: h.name,
          address: h.address,
          locality: h.locality,
          lat: h.location?.coordinates?.[1] || 12.9716,
          lng: h.location?.coordinates?.[0] || 77.5946,
          mapX: 45 + ((idx % 3) * 20),
          mapY: 35 + ((idx % 4) * 15),
          status: h.status === 'active' ? 'Active' : 'Inactive',
          capacityPct: h.currentUtilizationPct || 0,
          resourcesCount: 0,
          coordinator: h.coordinatorName,
          phone: h.contactPhone,
          hours: `${h.operatingHours?.open || '08:00 AM'} – ${h.operatingHours?.close || '08:00 PM'}`,
          categories: h.supportedCategories || ['Food', 'Clothes', 'Books', 'Other']
        }));
        setPoints(formatted);
        if (formatted.length > 0 && !selectedPointId) {
          setSelectedPointId(formatted[0].id);
        }
      }
    } catch (e) {
      console.warn('Failed to load hubs from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubs();
  }, []);

  const handleCreateHub = async (e) => {
    e.preventDefault();
    if (!newHub.name || !newHub.locality || !newHub.address) return;

    try {
      const res = await fetch('http://localhost:5000/api/hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHub.name,
          locality: newHub.locality,
          address: newHub.address,
          coordinatorName: newHub.coordinatorName,
          contactPhone: newHub.contactPhone,
          operatingHours: {
            open: newHub.openHours,
            close: newHub.closeHours,
            days: 'Monday – Saturday'
          },
          coordinates: [Number(newHub.lng), Number(newHub.lat)]
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewHub({
          name: '',
          locality: '',
          address: '',
          coordinatorName: '',
          contactPhone: '',
          openHours: '08:00 AM',
          closeHours: '08:00 PM',
          lat: 12.9716,
          lng: 77.6412
        });
        await loadHubs();
      }
    } catch (err) {
      console.error('Error creating hub:', err);
    }
  };

  const selectedPoint = points.find((p) => p.id === selectedPointId) || points[0] || null;

  const filteredPoints = points.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            JanaSeva Points & Hubs
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Operational intake hubs, capacity limits, and geographic distribution network.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <input
              type="text"
              placeholder="Search points..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 40px',
                borderRadius: '9999px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontSize: '14px',
                color: '#1F2937',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Add Hub Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0E7465',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(14, 116, 101, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0A5247')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0E7465')}
          >
            <Plus size={16} />
            <span>Add JanaSeva Hub</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1.8fr) minmax(320px, 1fr)',
          gap: '24px',
          alignItems: 'stretch'
        }}
      >
        {/* Left Side: Map matching Screen 24 */}
        <div
          style={{
            backgroundColor: '#EBF4F1',
            borderRadius: '20px',
            border: '1px solid #D1E5DF',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '520px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Vector Map Background */}
          <svg
            viewBox="0 0 800 600"
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="800" height="600" fill="#E8F4F1" />
            <path d="M 100 80 Q 220 50 280 140 T 180 280 Q 80 220 100 80 Z" fill="#D6EEDB" opacity="0.8" />
            <path d="M 520 280 Q 640 240 700 340 T 600 480 Q 480 440 520 280 Z" fill="#D6EEDB" opacity="0.8" />
            <path d="M 0 350 Q 200 320 400 380 T 800 360" fill="none" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M 450 0 Q 480 200 420 400 T 500 600" fill="none" stroke="#FFFFFF" strokeWidth="6" />
          </svg>

          {/* Compass Rose */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#0E7465',
              zIndex: 10
            }}
          >
            <Compass size={22} />
          </div>

          {/* Map Badge Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '9999px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0E7465',
              zIndex: 10
            }}
          >
            <Navigation size={14} />
            <span>Interactive Point Network • {points.length} Registered Hubs</span>
          </div>

          {/* Empty State when 0 Hubs */}
          {points.length === 0 ? (
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#0E7465',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(14, 116, 101, 0.15)'
                }}
              >
                <MapPin size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0' }}>
                No JanaSeva Hubs Registered Yet
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '380px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                There are currently no active community hubs. As the administrator, add and configure your initial JanaSeva points in Bangalore.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0E7465',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 22px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(14, 116, 101, 0.25)'
                }}
              >
                <Plus size={16} />
                <span>Add First Hub</span>
              </button>
            </div>
          ) : (
            filteredPoints.map((pt) => {
              const isSelected = pt.id === selectedPointId;
              return (
                <div
                  key={pt.id}
                  onClick={() => setSelectedPointId(pt.id)}
                  style={{
                    position: 'absolute',
                    left: `${pt.mapX}%`,
                    top: `${pt.mapY}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 20 : 10,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 116, 101, 0.25)'
                      }}
                    />
                  )}
                  <div
                    style={{
                      backgroundColor: isSelected ? '#0E7465' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#0E7465',
                      borderRadius: '9999px',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isSelected
                        ? '0 8px 16px rgba(14, 116, 101, 0.35)'
                        : '0 4px 10px rgba(0,0,0,0.12)',
                      border: isSelected ? '2px solid #FFFFFF' : '2px solid #0E7465',
                      fontWeight: 700,
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <MapPin size={16} />
                    <span>{pt.code}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Point Details Inspector */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          {selectedPoint ? (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: '0 0 20px 0' }}>
                Point Details
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E7465', margin: '0 0 4px 0' }}>
                    {selectedPoint.code}
                  </h3>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                    {selectedPoint.name}
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#ECFDF5',
                    color: '#065F46'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Status: {selectedPoint.status}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                {selectedPoint.address}
              </p>

              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Capacity Utilization</span>
                    <span style={{ fontWeight: 700, color: '#0E7465' }}>{selectedPoint.capacityPct}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${selectedPoint.capacityPct}%`,
                        height: '100%',
                        backgroundColor: '#0E7465',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package size={18} color="#0E7465" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                      Available Stock
                    </span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                    {selectedPoint.resourcesCount} units
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={15} color="#9CA3AF" />
                    <span><strong>Coordinator:</strong> {selectedPoint.coordinator}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#9CA3AF" />
                    <span>{selectedPoint.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="#9CA3AF" />
                    <span>{selectedPoint.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
              <Building size={36} color="#9CA3AF" style={{ marginBottom: '12px' }} />
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#374151', marginBottom: '4px' }}>
                No Point Selected
              </div>
              <div style={{ fontSize: '13px' }}>
                Create a JanaSeva Point to manage its capacity, resources, and coordinator details.
              </div>
            </div>
          )}

          {selectedPoint && (
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#0E7465',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(14, 116, 101, 0.25)'
                }}
              >
                <Edit2 size={16} />
                <span>Edit Point</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Hub Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                Add New JanaSeva Hub / Point
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHub} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Hub Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar Central Hub"
                  value={newHub.name}
                  onChange={(e) => setNewHub({ ...newHub, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Locality / Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar"
                  value={newHub.locality}
                  onChange={(e) => setNewHub({ ...newHub, locality: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Full Physical Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100ft Road, HAL 2nd Stage, Indiranagar, Bangalore"
                  value={newHub.address}
                  onChange={(e) => setNewHub({ ...newHub, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    value={newHub.coordinatorName}
                    onChange={(e) => setNewHub({ ...newHub, coordinatorName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newHub.contactPhone}
                    onChange={(e) => setNewHub({ ...newHub, contactPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '9999px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: '#0E7465',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create JanaSeva Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default HubsPage;
