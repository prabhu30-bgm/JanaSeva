import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach memory-stored accessToken if available
let memoryAccessToken = null;

export const setMemoryToken = (token) => {
  memoryAccessToken = token;
  if (token) {
    import('./socket').then(({ authenticateSocket }) => {
      authenticateSocket(token);
    }).catch(() => {});
  }
};

export const getMemoryToken = () => memoryAccessToken;

apiClient.interceptors.request.use(
  (config) => {
    if (memoryAccessToken) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setMemoryToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        setMemoryToken(null);
        // Dispatch session expired event so UI can prompt login
        window.dispatchEvent(new CustomEvent('janaseva:session_expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
