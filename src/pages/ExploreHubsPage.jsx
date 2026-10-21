import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Navigation,
  Search,
  RotateCw,
  Clock,
  ArrowRight,
  X,
  List,
  Map as MapIcon
} from 'lucide-react';

const CATEGORIES = ['all', 'clothing', 'food', 'books', 'medical', 'groceries'];
const STATUSES = ['all', 'active', 'temporary_closure'];

// Default reference center (Bengaluru Central) for fallback when location is not yet granted
const BLR_DEFAULT_LAT = 12.9716;
const BLR_DEFAULT_LNG = 77.5946;

export function ExploreHubsPage() {
  const navigate = useNavigate();
  const listContainerRef = useRef(null);

  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [use3kmRadius, setUse3kmRadius] = useState(true);

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'fallback'
  const [locationNotice, setLocationNotice] = useState(null);

  // View state: 'both' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('both');
  const [selectedHubId, setSelectedHubId] = useState(null);

  // Request browser geolocation with clear user explanation
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('fallback');
      setLocationNotice('Browser geolocation is not supported on this device. Showing all verified JanaSeva Hubs.');
      return;
    }

    setLocationStatus('requesting');
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationStatus('granted');
        setLocationNotice('Using your device coordinates for 3 km Hub discovery.');
      },
      (err) => {
        console.warn('Geolocation denied or error:', err.message);
        setLocationStatus('denied');
        if (err.code === err.PERMISSION_DENIED) {
          setLocationNotice('Location permission was not granted. Displaying all network Hubs across the region.');
        } else {
          setLocationNotice('Location is currently unavailable. Displaying all network Hubs.');
        }
        // When location is denied, turn off strict 3km radius query so user can still see all Hubs
        setUse3kmRadius(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Fetch Hubs from authoritative backend
  const fetchHubs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      // Enforce 3 km discovery rule using real coordinates or fallback Bengaluru center
      if (use3kmRadius) {
        const queryLat = userCoords?.lat || BLR_DEFAULT_LAT;
        const queryLng = userCoords?.lng || BLR_DEFAULT_LNG;
        params.lat = queryLat;
        params.lng = queryLng;
        params.radiusKm = 3;
      }

      const res = await hubService.getHubs(params);
      const hubList = res?.hubs || [];
      setHubs(hubList);

      if (hubList.length > 0) {
        // Retain or select first hub
        setSelectedHubId((prev) => (hubList.some((h) => h.hubId === prev) ? prev : hubList[0].hubId));
      } else {
        setSelectedHubId(null);
      }
    } catch (err) {
      console.error('Failed to load hubs:', err);
      setError(err.response?.data?.error?.message || 'Could not fetch Hub network. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();

    const handleInventoryChange = () => {
      fetchHubs();
    };
    window.addEventListener('janaseva:inventory_updated', handleInventoryChange);
    return () => {
      window.removeEventListener('janaseva:inventory_updated', handleInventoryChange);
    };
  }, [selectedCategory, selectedStatus, use3kmRadius, userCoords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHubs();
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setUse3kmRadius(true);
  };

  // Select a hub from map or list and ensure visible focus
  const handleSelectHub = (hubId) => {
    setSelectedHubId(hubId);
    // Smooth scroll list item into view if in desktop or list mode
    const cardEl = document.getElementById(`hub-card-${hubId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const selectedHub = hubs.find((h) => h.hubId === selectedHubId) || hubs[0];

  // Map projection helpers: bounds around Bengaluru and active hubs
  const mapCenterLat = userCoords?.lat || BLR_DEFAULT_LAT;
  const mapCenterLng = userCoords?.lng || BLR_DEFAULT_LNG;

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Explore Nearby Hubs"
        subtitle="Discover verified resource collection and drop-off points within your 3 km community radius"
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-control)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`btn btn-sm ${viewMode === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 0, padding: '4px 10px', fontSize: '12px' }}
                title="Split Map and List View"
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 0, padding: '4px 10px', fontSize: '12px' }}
                title="List Only View"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 0, padding: '4px 10px', fontSize: '12px' }}
                title="Map Only View"
              >
                <MapIcon size={14} />
              </button>
            </div>

            {/* 3 km Discovery Zone Toggle */}
            <button
              type="button"
              onClick={() => setUse3kmRadius(!use3kmRadius)}
              className={`btn btn-sm ${use3kmRadius ? 'btn-primary' : 'btn-secondary'}`}
              title="Toggle 3 km radius filtering"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Navigation size={14} />
              <span>{use3kmRadius ? '3.0 km Radius Active' : 'All Network Hubs'}</span>
            </button>

            {/* Location Permission Trigger */}
            {locationStatus !== 'granted' && (
              <button
                type="button"
                onClick={requestUserLocation}
                disabled={locationStatus === 'requesting'}
                className="btn btn-sm btn-secondary"
                title="Use current GPS location for 3 km radius discovery"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <MapPin size={14} />
                <span>{locationStatus === 'requesting' ? 'Locating...' : 'Use My GPS'}</span>
              </button>
            )}
          </div>
        }
      />

      {/* Geolocation Notice Banner */}
      {locationNotice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert
            variant={locationStatus === 'granted' ? 'success' : 'info'}
            message={locationNotice}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="Search by Hub name, locality, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search Hubs"
                />
              </div>
              <Button type="submit" variant="secondary" size="md">
                Search
              </Button>
            </form>

            {/* Operational Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status:</span>
              <select
                className="input"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter by operational status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Open / Active Only</option>
                <option value="temporary_closure">Temporary Closure</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
                Categories:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '12px', padding: '4px 10px' }}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery.trim() || !use3kmRadius) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '16px' }}>
          <Spinner size="lg" />
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Querying authoritative Hub network within 3 km discovery zone...
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Discovery Service Error"
          message={error}
          action={
            <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchHubs}>
              Retry Discovery
            </Button>
          }
        />
      ) : hubs.length === 0 ? (
        <EmptyState
          title="No Hubs Found"
          message={
            use3kmRadius
              ? 'No Hubs found within the 3.0 km radius matching your filter criteria. You can expand to view All Network Hubs or reset filters.'
              : 'No Hubs match your current search and filter selections.'
          }
          action={
            <Button variant="primary" size="md" onClick={handleClearFilters}>
              Reset Filters & Show All
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              viewMode === 'map'
                ? '1fr'
                : viewMode === 'list'
                ? '1fr'
                : 'minmax(340px, 1fr) minmax(380px, 1.25fr)',
            gap: '24px',
            alignItems: 'start'
          }}
        >
          {/* Synchronized Interactive Map Viewport */}
          {(viewMode === 'both' || viewMode === 'map') && (
            <div style={{ position: viewMode === 'both' ? 'sticky' : 'static', top: '80px' }}>
              <Card
                title="Synchronized 3 km Radius Map Viewport"
                style={{ padding: '16px' }}
              >
                <div
                  style={{
                    height: viewMode === 'map' ? '540px' : '360px',
                    backgroundColor: '#E8EFEA',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-border)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px'
                  }}
                  role="region"
                  aria-label="Hub discovery map viewport"
                >
                  {/* Map Grid Pattern */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'radial-gradient(#CBD5E1 1px, transparent 1px), radial-gradient(#CBD5E1 1px, #E8EFEA 1px)',
                      backgroundSize: '24px 24px',
                      backgroundPosition: '0 0, 12px 12px',
                      opacity: 0.6,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* 3 km Perimeter Dashed Circle */}
                  {use3kmRadius && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '280px',
                        height: '280px',
                        borderRadius: '50%',
                        border: '2px dashed var(--color-primary)',
                        backgroundColor: 'rgba(15, 118, 110, 0.05)',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                      title="3 km Radius Boundary"
                    />
                  )}

                  {/* Center Location Pin */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pointerEvents: 'none',
                      zIndex: 3
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        boxShadow: '0 0 0 4px rgba(15, 118, 110, 0.25)'
                      }}
                    />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px', textShadow: '0 1px 2px #fff' }}>
                      {userCoords ? 'Your Location' : 'Bengaluru Central'}
                    </span>
                  </div>

                  {/* Interactive Hub Pins */}
                  {hubs.map((h, idx) => {
                    const isSelected = selectedHubId === h.hubId;
                    const isClosed = h.status !== 'active';

                    // Compute relative map positioning from lat/lng
                    const hubLng = h.location?.coordinates ? h.location.coordinates[0] : BLR_DEFAULT_LNG;
                    const hubLat = h.location?.coordinates ? h.location.coordinates[1] : BLR_DEFAULT_LAT;

                    // Approximate projection around center
                    const deltaX = (hubLng - mapCenterLng) * 1100;
                    const deltaY = (mapCenterLat - hubLat) * 1100;
                    const clampedX = Math.max(-125, Math.min(125, deltaX));
                    const clampedY = Math.max(-125, Math.min(125, deltaY));

                    return (
                      <button
                        key={h.hubId}
                        type="button"
                        onClick={() => handleSelectHub(h.hubId)}
                        style={{
                          position: 'absolute',
                          top: `calc(50% + ${clampedY}px)`,
                          left: `calc(50% + ${clampedX}px)`,
                          transform: 'translate(-50%, -50%)',
                          background: isSelected
                            ? 'var(--color-primary)'
                            : isClosed
                            ? '#94A3B8'
                            : 'var(--color-surface)',
                          color: isSelected || isClosed ? '#FFF' : 'var(--color-text-primary)',
                          border: `2px solid ${
                            isSelected
                              ? 'var(--color-primary-dark, #0D5D56)'
                              : isClosed
                              ? '#64748B'
                              : 'var(--color-primary)'
                          }`,
                          borderRadius: '16px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          zIndex: isSelected ? 10 : 2,
                          transition: 'all 0.15s ease'
                        }}
                        aria-label={`Select Hub ${h.name}`}
                        aria-pressed={isSelected}
                      >
                        <MapPin size={12} />
                        <span>{h.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}

                  {/* Selected Hub Detail Popover (Inside Map) */}
                  {selectedHub && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(4px)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-control)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '13px' }}>
                            {selectedHub.name}
                          </span>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-muted)' }}>
                            #{selectedHub.hubId}
                          </span>
                          <StatusBadge variant={selectedHub.status === 'active' ? 'success' : 'neutral'}>
                            {selectedHub.status === 'active' ? 'OPEN' : 'CLOSED'}
                          </StatusBadge>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {selectedHub.distanceKm !== null ? `${selectedHub.distanceKm} km away • ` : ''}
                          {selectedHub.address}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<ArrowRight size={13} />}
                        onClick={() => navigate(`/hubs/${selectedHub.hubId}`)}
                      >
                        Details
                      </Button>
                    </div>
                  )}

                  {/* Map Status Header */}
                  <div
                    style={{
                      zIndex: 4,
                      alignSelf: 'flex-start',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    📍 {use3kmRadius ? '3 km Perimeter Enforced' : 'All Regional Hubs'} • {hubs.length} Hubs
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Synchronized Hub Cards List */}
          {(viewMode === 'both' || viewMode === 'list') && (
            <div
              ref={listContainerRef}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {hubs.length === 0 ? (
                <EmptyState
                  icon={<MapPin size={36} color="var(--color-primary)" />}
                  title="No JanaSeva Hubs Registered Yet"
                  description="There are currently no active community hubs in this regional network. The administrator will be provisioning new hubs shortly."
                  action={
                    <Button variant="secondary" onClick={() => loadHubs()}>
                      Refresh Discovery
                    </Button>
                  }
                />
              ) : (
                hubs.map((hub) => {
                const isSelected = selectedHubId === hub.hubId;
                const isClosed = hub.status !== 'active';

                return (
                  <Card
                    key={hub.hubId}
                    id={`hub-card-${hub.hubId}`}
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3
                            style={{
                              fontSize: '17px',
                              fontWeight: 700,
                              color: 'var(--color-text-primary)',
                              margin: 0,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSelectHub(hub.hubId)}
                          >
                            {hub.name}
                          </h3>
                          <span style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-muted)' }}>
                            #{hub.hubId}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          {hub.distanceKm !== null ? (
                            <strong style={{ color: 'var(--color-primary)' }}>{hub.distanceKm} km away • </strong>
                          ) : null}
                          {hub.address}
                        </div>
                      </div>
                      <StatusBadge variant={hub.status === 'active' ? 'success' : 'neutral'}>
                        {hub.status === 'active' ? 'OPEN' : 'CLOSED'}
                      </StatusBadge>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} color="var(--color-text-muted)" />
                        <span>
                          {hub.operatingHours?.days || 'Mon–Sun'}: {hub.operatingHours?.open || '08:30'} – {hub.operatingHours?.close || '20:00'}
                        </span>
                      </div>
                      <div>
                        Capacity: <strong>{hub.currentUtilizationPct || 65}%</strong>
                      </div>
                    </div>

                    {/* Supported Categories */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      {(hub.supportedCategories || ['clothing', 'food', 'books']).map((cat) => (
                        <span
                          key={cat}
                          className="badge badge-info"
                          style={{ textTransform: 'capitalize', fontSize: '11px', padding: '2px 8px' }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Button
                        variant={isClosed ? 'secondary' : 'primary'}
                        size="sm"
                        icon={<ArrowRight size={14} />}
                        onClick={() => navigate(`/hubs/${hub.hubId}`)}
                      >
                        {isClosed ? 'View Hub Status & Hours' : 'View Hub & Live Inventory'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleSelectHub(hub.hubId)}
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {isSelected ? 'Pin Selected' : 'Locate on Map'}
                      </button>
                    </div>
                  </Card>
                );
              }))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExploreHubsPage;
