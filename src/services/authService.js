import apiClient, { setMemoryToken } from './api';

export const authService = {
  async register(data) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async verifyContact(data) {
    const res = await apiClient.post('/auth/verify-contact', data);
    if (res.data?.data?.accessToken) {
      setMemoryToken(res.data.data.accessToken);
    }
    return res.data;
  },

  async resendVerification(email) {
    const res = await apiClient.post('/auth/resend-verification', { email });
    return res.data;
  },

  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.data?.accessToken) {
      setMemoryToken(res.data.data.accessToken);
    }
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data?.data?.user;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setMemoryToken(null);
    }
  },

  async forgotPassword(email) {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data) {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },

  async getQrIdentity() {
    const res = await apiClient.get('/auth/qr-identity');
    return res.data?.data;
  },

  async updateProfile(data) {
    const res = await apiClient.patch('/auth/profile', data);
    return res.data?.data?.user;
  }
};

export default authService;
