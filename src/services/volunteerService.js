import apiClient from './api';

export const volunteerService = {
  /**
   * Get volunteer dashboard data (metrics, upcoming reservations, recent activities, unread notifications)
   */
  async getDashboard() {
    const res = await apiClient.get('/volunteers/dashboard');
    return res.data?.data;
  },

  /**
   * Get active and past reservations
   * @param {string} [status] Optional filter by status ('all', 'active', 'completed', 'cancelled', 'expired')
   */
  async getReservations(status) {
    const params = status && status !== 'all' ? { status } : {};
    const res = await apiClient.get('/volunteers/reservations', { params });
    return res.data?.data?.reservations || [];
  },

  /**
   * Get single reservation by ID
   * @param {string} id Reservation ID or _id
   */
  async getReservationById(id) {
    const res = await apiClient.get(`/volunteers/reservations/${id}`);
    return res.data?.data?.reservation;
  },

  /**
   * Create a new reservation with concurrency-safe atomic inventory decrement
   * @param {Object} data { hubId, batchId, quantity, idempotencyKey }
   */
  async createReservation(data) {
    const res = await apiClient.post('/volunteers/reservations', data);
    return res.data?.data;
  },

  /**
   * Cancel an active reservation and release eligible uncollected stock
   * @param {string} id Reservation ID or _id
   * @param {string} [reason] Cancellation reason
   */
  async cancelReservation(id, reason) {
    const res = await apiClient.post(`/volunteers/reservations/${id}/cancel`, { reason });
    return res.data?.data;
  },

  /**
   * Get activity history
   */
  async getActivities() {
    const res = await apiClient.get('/volunteers/activities');
    return res.data?.data?.activities || [];
  },

  /**
   * Get notifications
   */
  async getNotifications() {
    const res = await apiClient.get('/volunteers/notifications');
    return res.data?.data?.notifications || [];
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(id) {
    const res = await apiClient.patch(`/volunteers/notifications/${id}/read`);
    return res.data;
  },

  /**
   * Get collected items eligible or tracked for distribution
   */
  async getCollectedItems() {
    const res = await apiClient.get('/volunteers/collections');
    return res.data?.data?.items || [];
  },

  /**
   * Get volunteer distribution records
   */
  async getDistributions() {
    const res = await apiClient.get('/volunteers/distributions');
    return res.data?.data?.distributions || [];
  },

  /**
   * Get distribution details by ID
   * @param {string} id
   */
  async getDistributionById(id) {
    const res = await apiClient.get(`/volunteers/distributions/${id}`);
    return res.data?.data?.distribution;
  },

  /**
   * Record a volunteer community distribution from collected items
   * @param {Object} data { reservationId, quantityDistributed, notes, idempotencyKey }
   * @param {string} [idempotencyKey]
   */
  async recordDistribution(data, idempotencyKey) {
    const headers = {};
    const key = idempotencyKey || data?.idempotencyKey;
    if (key) {
      headers['Idempotency-Key'] = key;
    }
    const res = await apiClient.post('/volunteers/distributions', data, { headers });
    return res.data?.data;
  }
};

export default volunteerService;
