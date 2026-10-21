import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  Filter,
  RotateCw
} from 'lucide-react';
import { Card, Button, Spinner, EmptyState, ErrorState } from '@janaseva/ui';
import hubService from '../services/hubService';

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

export function ExploreResourcesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['All', 'Food', 'Clothes', 'Books', 'Other'];

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryParam = selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase();
      const data = await hubService.getAllAvailableInventory({
        category: categoryParam,
        search: searchQuery || undefined
      });
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load available inventory:', err);
      setError(err.response?.data?.error?.message || 'Could not load available resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, searchQuery]);

  const mappedResources = items.map((item) => {
    const visual = CATEGORY_VISUALS[item.category?.toLowerCase()] || CATEGORY_VISUALS.other;
    return {
      id: item.batchId || item._id,
      category: item.category,
      title: item.subCategory || visual.title,
      subtitle: item.description || `Batch #${item.batchId}`,
      portions: `${item.qtyAvailable} ${item.unit || 'units'} available`,
      rawQuantity: item.qtyAvailable,
      unit: item.unit || 'units',
      point: item.hubName || item.hubId,
      hubAddress: item.hubAddress,
      distance: 'Within 3 km',
      availableUntil: item.expiryDate ? new Date(item.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Operating hours',
      status: 'Available',
      iconEmoji: visual.iconEmoji,
      bgLight: visual.bgLight,
      color: visual.color,
      image: visual.image,
      description: item.description || `Inspected and verified batch #${item.batchId} in Hub storage.`
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Matching Showcase Screen 7 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Explore Resources
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Find resources available near you across decentralized JanaSeva Points.
          </p>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '38px',
              paddingRight: '14px',
              borderRadius: '9999px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              color: '#1F2937',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: selectedCategory === cat ? 700 : 500,
              backgroundColor: selectedCategory === cat ? '#0F766E' : '#FFFFFF',
              color: selectedCategory === cat ? '#FFFFFF' : '#4B5563',
              border: selectedCategory === cat ? '1px solid #0F766E' : '1px solid #E5E7EB',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: selectedCategory === cat ? '0 2px 4px rgba(15, 118, 110, 0.2)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid matching Showcase Screen 7 */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <Spinner size="lg" />
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading verified available inventory from Hubs...</div>
        </div>
      ) : error ? (
        <ErrorState
          title="Could Not Retrieve Resources"
          message={error}
          action={
            <Button variant="primary" size="md" icon={<RotateCw size={14} />} onClick={fetchInventory}>
              Retry Connection
            </Button>
          }
        />
      ) : mappedResources.length === 0 ? (
        <EmptyState
          title="No Resources Available"
          message={
            selectedCategory !== 'All'
              ? `No ${selectedCategory.toLowerCase()} batches are currently available across Hubs.`
              : 'No available resources found matching your search criteria.'
          }
          action={
            selectedCategory !== 'All' || searchQuery ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={() => navigate('/donate')}>
                Contribute Resources Now
              </Button>
            )
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {mappedResources.map((res) => (
            <div
              key={res.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Top Image or 3D Illustrated Area */}
              <div
                style={{
                  height: '170px',
                  backgroundColor: res.bgLight,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={res.image}
                  alt={res.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#D1FAE5',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: '1px solid #A7F3D0'
                  }}
                >
                  ● Available
                </span>
              </div>

              {/* Card Content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', margin: '0 0 4px 0' }}>
                    {res.title}
                  </h3>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F766E' }}>
                    {res.portions}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                  <MapPin size={14} color="#0F766E" />
                  <span>{res.point} {res.hubAddress ? `• ${res.hubAddress}` : ''}</span>
                </div>

                {/* View Resource Button */}
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => navigate(`/explore/${res.id}`)}
                    style={{
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '13px',
                      backgroundColor: '#0F766E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>View Resource</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExploreResourcesPage;
