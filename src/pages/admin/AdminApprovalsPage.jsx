import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assigningRequest, setAssigningRequest] = useState(null);
  const [assignedVolunteer, setAssignedVolunteer] = useState('');
  const [volunteers, setVolunteers] = useState([]);

  // Distribution requests dataset initialized cleanly
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function loadVolunteers() {
      try {
        const res = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const vols = (json.data?.users || []).filter((u) => u.role === 'volunteer');
          setVolunteers(vols);
          if (vols.length > 0) {
            setAssignedVolunteer(vols[0].name);
          }
        }
      } catch (e) {
        // Ignore network fallback
      }
    }
    loadVolunteers();
  }, []);

  const tabs = ['All', 'Pending', 'Active', 'Done'];

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assigningRequest) return;

    setRequests(
      requests.map((r) => {
        if (r.id === assigningRequest.id) {
          return {
            ...r,
            volunteer: assignedVolunteer,
            status: 'Active'
          };
        }
        return r;
      })
    );
    setAssigningRequest(null);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesTab =
      activeTab === 'All' || req.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.volunteer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header matching Master Design Showcase Screen 25 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Distribution Requests
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Manage community dispatch requests, volunteer assignments, and fulfillment stages.
          </p>
        </div>
      </div>

      {/* Tabs and Search Bar matching Screen 25 */}
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
        {/* Status Filter Tabs matching Screen 25 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {tabs.map((tab) => {
            const count =
              tab === 'All'
                ? requests.length
                : requests.filter((r) => r.status.toLowerCase() === tab.toLowerCase()).length;
            const isCurrent = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? '#0E7465' : '#F3F4F6',
                  color: isCurrent ? '#FFFFFF' : '#4B5563',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
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
            placeholder="Search request, resource..."
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

      {/* Requests Table matching Screen 25 */}
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
                Request
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resource
              </th>
              <th style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Volunteer
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
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                  No distribution requests match this filter.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req, idx) => {
                const isPending = req.status === 'Pending';
                const isActive = req.status === 'Active';
                const isDone = req.status === 'Done';

                return (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: idx === filteredRequests.length - 1 ? 'none' : '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Request ID */}
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#0E7465'
                        }}
                      >
                        {req.id}
                      </span>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{req.createdAt}</div>
                    </td>

                    {/* Resource */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>
                        {req.resource}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {req.quantity} • {req.target}
                      </div>
                    </td>

                    {/* Volunteer */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                        {req.volunteer}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        {req.volunteerLevel}
                      </div>
                    </td>

                    {/* Status Pill Badge matching Screen 25 */}
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: isPending ? '#FFFBEB' : isActive ? '#ECFDF5' : '#EFF6FF',
                          color: isPending ? '#B45309' : isActive ? '#065F46' : '#1D4ED8'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isPending ? '#F59E0B' : isActive ? '#10B981' : '#3B82F6'
                          }}
                        />
                        {req.status}
                      </span>
                    </td>

                    {/* Action Button matching Screen 25 */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {isPending ? (
                        <button
                          onClick={() => setAssigningRequest(req)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '9999px',
                            border: 'none',
                            backgroundColor: '#0E7465',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(14, 116, 101, 0.2)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0A5247')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0E7465')}
                        >
                          Assign
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedRequest(req)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '9999px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#4B5563',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Volunteer Modal */}
      {assigningRequest && (
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
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                Assign Volunteer & Dispatch
              </h3>
              <button
                onClick={() => setAssigningRequest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Request ID</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0E7465' }}>{assigningRequest.id} • {assigningRequest.resource}</div>
              <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                <strong>Target:</strong> {assigningRequest.target}
              </div>
              <div style={{ fontSize: '13px', color: '#374151' }}>
                <strong>Quantity:</strong> {assigningRequest.quantity}
              </div>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Select Accredited Volunteer
                </label>
                <select
                  value={assignedVolunteer}
                  onChange={(e) => setAssignedVolunteer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {volunteers.length === 0 ? (
                    <option value="">No accredited volunteers found</option>
                  ) : (
                    volunteers.map((v) => (
                      <option key={v._id || v.volunteerId} value={v.name}>
                        {v.name} ({v.volunteerId || 'Volunteer'} • {v.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAssigningRequest(null)}
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
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {selectedRequest && (
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
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                Request Details {selectedRequest.id}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280' }}>Status:</span>
                <span style={{ fontWeight: 700, color: '#0E7465' }}>{selectedRequest.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280' }}>Resource:</span>
                <span style={{ fontWeight: 600 }}>{selectedRequest.resource} ({selectedRequest.quantity})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280' }}>Assigned Volunteer:</span>
                <span style={{ fontWeight: 600 }}>{selectedRequest.volunteer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280' }}>Origin Hub:</span>
                <span style={{ fontWeight: 600 }}>{selectedRequest.hub}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280' }}>Destination:</span>
                <span style={{ fontWeight: 600 }}>{selectedRequest.target}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Timeline:</span>
                <span style={{ fontWeight: 600 }}>{selectedRequest.createdAt}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: '#0E7465',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ApprovalsPage;
