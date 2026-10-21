import apiClient from './api';

export const hubService = {
  /**
   * Discover hubs with 3km radius, category, status, and search filters
   */
  async getHubs(params = {}) {
    const res = await apiClient.get('/hubs', { params });
    return res.data?.data;
  },

  /**
   * Get single hub details
   */
  async getHubDetails(hubId) {
    const res = await apiClient.get(`/hubs/${hubId}`);
    return res.data?.data?.hub;
  },

  /**
   * Get authoritative available inventory for a hub
   */
  async getHubInventory(hubId) {
    const res = await apiClient.get(`/hubs/${hubId}/inventory`);
    return res.data?.data;
  },

  /**
   * Get all authoritative in-stock inventory items across all active hubs
   */
  async getAllAvailableInventory(params = {}) {
    const res = await apiClient.get('/hubs/inventory/all', { params });
    return res.data?.data?.items || [];
  },

  /**
   * Get single batch details by batchId
   */
  async getBatchDetails(batchId) {
    const res = await apiClient.get(`/hubs/inventory/batch/${batchId}`);
    return res.data?.data?.batch;
  },

  /**
   * Get verified aggregate public impact statistics
   */
  async getPublicStats() {
    const res = await apiClient.get('/hubs/stats/public');
    return res.data?.data?.stats;
  }
};

export default hubService;
