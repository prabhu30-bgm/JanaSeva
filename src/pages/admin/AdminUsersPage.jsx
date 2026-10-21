import React, { useState, useEffect } from 'react';
import { Users, Search, Award } from 'lucide-react';

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        const rawUsers = json.data?.users || [];
        // Strictly filter out any administrator accounts - only show community users
        const communityUsers = rawUsers
          .filter((u) => u.role !== 'admin' && u.role !== 'super_admin')
          .map((u) => ({
            id: u._id,
            volunteerId: u.volunteerId || u._id,
            name: u.name,
            email: u.email,
            phone: u.phone || '+91 98450 00000',
            points: u.points || 0,
            level: u.level || 'Community Volunteer',
            status: u.status === 'active' ? 'Active' : u.status === 'suspended' ? 'Suspended' : 'Inactive',
            hub: u.assignedHubs?.[0] || 'Community Network',
            avatarBg: '#0E7465',
            joined: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })
              : '2026'
          }));
        setUsers(communityUsers);
      }
    } catch (e) {
      console.warn('Could not load community users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleSuspend = async (user) => {
    const newStatus = user.status === 'Active' ? 'suspended' : 'active';
    const confirmMsg =
      newStatus === 'suspended'
        ? `Are you sure you want to suspend user "${user.name}"? They will lose platform access.`
        : `Reinstate and activate user "${user.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          reason: newStatus === 'suspended' ? 'Suspended by Administrator' : 'Reinstated by Administrator'
        })
      });

      if (res.ok) {
        await loadUsers();
        if (selectedUser?.id === user.id) {
          setShowDetailModal(false);
        }
      } else {
        const json = await res.json();
        alert(json.error?.message || 'Failed to update user status.');
      }
    } catch (err) {
      alert('Error communicating with backend server.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove user "${user.name}" (${user.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        await loadUsers();
        if (selectedUser?.id === user.id) {
          setShowDetailModal(false);
        }
      } else {
        const json = await res.json();
        alert(json.error?.message || 'Failed to remove user.');
      }
    } catch (err) {
      alert('Error communicating with backend server.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.volunteerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || u.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Community Users & Volunteers
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Manage registered volunteers and community members. You can review, suspend, or remove users.
          </p>
        </div>

        {/* Informational badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F3F4F6',
            color: '#4B5563',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid #E5E7EB'
          }}
        >
          <Users size={16} color="#0E7465" />
          <span>{users.length} Registered {users.length === 1 ? 'User' : 'Users'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
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
            placeholder="Search community users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'all', label: `All (${users.length})` },
            { id: 'active', label: `Active (${users.filter((u) => u.status === 'Active').length})` },
            { id: 'suspended', label: `Suspended (${users.filter((u) => u.status === 'Suspended').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: filterStatus === tab.id ? '#0E7465' : '#F3F4F6',
                color: filterStatus === tab.id ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
                User
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Points
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '64px 20px', textAlign: 'center' }}>
                  <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#E6F4F1',
                        color: '#0E7465',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Users size={28} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937' }}>
                      No Community Users Yet
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                      When community volunteers sign up on the platform, their profiles, activity, and impact records will be listed here for administrative management.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => {
                const initials = user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();
                const isActive = user.status === 'Active';

                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: idx === filteredUsers.length - 1 ? 'none' : '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* User info */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: user.avatarBg,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                            flexShrink: 0
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {user.level}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4B5563' }}>
                      {user.email}
                    </td>

                    {/* Points */}
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#1F2937'
                        }}
                      >
                        <Award size={16} color="#F59E0B" />
                        {user.points}
                      </span>
                    </td>

                    {/* Status Pill Badge */}
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
                          backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2',
                          color: isActive ? '#065F46' : '#991B1B'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#10B981' : '#EF4444'
                          }}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* Action buttons: Suspend and Remove */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleSuspend(user)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isActive ? '#FEF3C7' : '#ECFDF5',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isActive ? '#92400E' : '#065F46',
                            cursor: actionLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isActive ? 'Suspend' : 'Reinstate'}
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleDeleteUser(user)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FEF2F2',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#DC2626',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
