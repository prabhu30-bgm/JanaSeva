import React, { useState, useEffect } from 'react';
import {
  Search,
  Utensils,
  Shirt,
  BookOpen,
  Package,
  Edit2,
  X
} from 'lucide-react';

export function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/hubs/inventory/all');
        if (res.ok) {
          const json = await res.json();
          const items = json.data?.items || [];
          setResources(
            items.map((i) => ({
              id: i.batchId || i._id,
              category: i.category === 'clothing' ? 'Clothes' : i.category.charAt(0).toUpperCase() + i.category.slice(1),
              name: i.subCategory || i.category,
              description: i.description || 'Verified intake batch',
              pointId: i.hubId,
              pointName: i.hubName || i.hubId,
              quantity: i.qtyAvailable || 0,
              unit: i.unit || 'units',
              status: i.qtyAvailable > 0 ? 'Available' : 'Depleted',
              icon: i.category === 'food' ? Utensils : i.category === 'clothing' ? Shirt : i.category === 'books' ? BookOpen : Package,
              color: i.category === 'food' ? '#EA580C' : i.category === 'clothing' ? '#0284C7' : i.category === 'books' ? '#059669' : '#7C3AED',
              bgLight: i.category === 'food' ? '#FFF7ED' : i.category === 'clothing' ? '#F0F9FF' : i.category === 'books' ? '#ECFDF5' : '#F5F3FF',
              lastUpdated: 'Live'
            }))
          );
        }
      } catch (err) {
        console.warn('Failed to load live inventory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();

    let unsubscribe = null;
    import('../../services/socket').then(({ subscribeToInventory }) => {
      unsubscribe = subscribeToInventory(() => {
        loadInventory();
      });
    }).catch(() => {});

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Form state for adding new resource
  const [newResource, setNewResource] = useState({
    category: 'Food',
    name: '',
    description: '',
    pointId: 'P-04',
    pointName: 'Indiranagar Central',
    quantity: 10,
    unit: 'portions'
  });

  const categories = ['All', 'Food', 'Clothes', 'Books', 'Other'];

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!newResource.name) return;

    let icon = Package;
    let color = '#7C3AED';
    let bgLight = '#F5F3FF';

    if (newResource.category === 'Food') {
      icon = Utensils;
      color = '#EA580C';
      bgLight = '#FFF7ED';
    } else if (newResource.category === 'Clothes') {
      icon = Shirt;
      color = '#0284C7';
      bgLight = '#F0F9FF';
    } else if (newResource.category === 'Books') {
      icon = BookOpen;
      color = '#059669';
      bgLight = '#ECFDF5';
    }

    const item = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      category: newResource.category,
      name: newResource.name,
      description: newResource.description || `${newResource.name} inventory allocation`,
      pointId: newResource.pointId,
      pointName: newResource.pointName,
      quantity: Number(newResource.quantity),
      unit: newResource.unit,
      status: Number(newResource.quantity) > 10 ? 'Available' : 'Limited',
      icon,
      color,
      bgLight,
      lastUpdated: 'Just now'
    };

    setResources([item, ...resources]);
    setShowAddModal(false);
    setNewResource({
      category: 'Food',
      name: '',
      description: '',
      pointId: 'P-04',
      pointName: 'Indiranagar Central',
      quantity: 10,
      unit: 'portions'
    });
  };

  const handleUpdateQuantity = (resId, newQty) => {
    setResources(
      resources.map((r) => {
        if (r.id === resId) {
          const qty = Math.max(0, Number(newQty));
          return {
            ...r,
            quantity: qty,
            status: qty === 0 ? 'Out of Stock' : qty <= 10 ? 'Limited' : 'Available',
            lastUpdated: 'Just now'
          };
        }
        return r;
      })
    );
    setEditingResource(null);
  };

  const filteredResources = resources.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pointName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pointId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Master Design Showcase Screen 23 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Resources
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Track real-time inventory balances, stock limits, and intake points.
          </p>
        </div>

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
          <span>Add Resource</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar matching Screen 23 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #E5E7EB'
        }}
      >
        {/* Category Filter Pills matching Master Showcase */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeCategory === cat ? '#0E7465' : '#F3F4F6',
                color: activeCategory === cat ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
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
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 40px',
              borderRadius: '9999px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#F9FAFB',
              fontSize: '14px',
              color: '#1F2937',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Table Card matching Screen 23 */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resource
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Point
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quantity
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                  No resources found in this category.
                </td>
              </tr>
            ) : (
              filteredResources.map((item, idx) => {
                const IconComponent = item.icon;
                const isAvailable = item.status === 'Available';
                const isLimited = item.status === 'Limited';

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: idx === filteredResources.length - 1 ? 'none' : '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Resource Name and Icon */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: item.bgLight,
                            color: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Point */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '12px',
                            color: '#0E7465',
                            backgroundColor: '#E6F4F1',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {item.pointId}
                        </span>
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {item.pointName}
                        </span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>
                        {item.quantity}{' '}
                        <span style={{ fontWeight: 400, fontSize: '12px', color: '#6B7280' }}>
                          {item.unit}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        Updated {item.lastUpdated}
                      </div>
                    </td>

                    {/* Status Pill Badge matching Screen 23 */}
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: isAvailable ? '#ECFDF5' : isLimited ? '#FFFBEB' : '#FEF2F2',
                          color: isAvailable ? '#065F46' : isLimited ? '#B45309' : '#991B1B'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isAvailable ? '#10B981' : isLimited ? '#F59E0B' : '#EF4444'
                          }}
                        />
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setEditingResource(item)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#374151',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Quantity Modal */}
      {editingResource && (
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
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                Adjust Inventory Count
              </h3>
              <button
                onClick={() => setEditingResource(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0' }}>
              Updating count for <strong>{editingResource.name}</strong> at {editingResource.pointName} ({editingResource.pointId}).
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Current Quantity ({editingResource.unit})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() =>
                    setEditingResource({
                      ...editingResource,
                      quantity: Math.max(0, editingResource.quantity - 1)
                    })
                  }
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F3F4F6',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={editingResource.quantity}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      quantity: Math.max(0, parseInt(e.target.value) || 0)
                    })
                  }
                  style={{
                    width: '100px',
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '16px',
                    fontWeight: 700
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditingResource({
                      ...editingResource,
                      quantity: editingResource.quantity + 1
                    })
                  }
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#F3F4F6',
                    fontSize: '18px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateQuantity(editingResource.id, editingResource.quantity)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#0E7465',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
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
                Add New Resource Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newResource.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    let defaultUnit = 'portions';
                    if (cat === 'Clothes') defaultUnit = 'units';
                    if (cat === 'Books') defaultUnit = 'sets';
                    if (cat === 'Other') defaultUnit = 'kits';
                    setNewResource({ ...newResource, category: cat, unit: defaultUnit });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Food">Food (Cooked Meals / Perishables)</option>
                  <option value="Clothes">Clothes (Winter Wear / Blankets)</option>
                  <option value="Books">Books (Educational Texts / Novels)</option>
                  <option value="Other">Other (Hygiene & First Aid Kits)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cooked meal packets"
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
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
                  Assigned JanaSeva Point
                </label>
                <select
                  value={newResource.pointId}
                  onChange={(e) => {
                    const id = e.target.value;
                    let name = 'Indiranagar Central';
                    if (id === 'P-08') name = 'Koramangala Terminal';
                    if (id === 'P-12') name = 'Jayanagar Center';
                    if (id === 'P-16') name = 'Malleshwaram Depot';
                    setNewResource({ ...newResource, pointId: id, pointName: name });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="P-04">Point 04 (Indiranagar Central)</option>
                  <option value="P-08">Point 08 (Koramangala Terminal)</option>
                  <option value="P-12">Point 12 (Jayanagar Center)</option>
                  <option value="P-16">Point 16 (Malleshwaram Depot)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newResource.quantity}
                    onChange={(e) => setNewResource({ ...newResource, quantity: e.target.value })}
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
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    value={newResource.unit}
                    onChange={(e) => setNewResource({ ...newResource, unit: e.target.value })}
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
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default InventoryPage;
