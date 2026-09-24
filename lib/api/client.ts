import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // The auth store is the single source of truth for the session
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      // A 401 from login/register is just a wrong password; anything else means the session
      // ended (expired, deactivated, roles changed), so sign out and go to the login page
      const isAuthRequest = error.config?.url?.startsWith('/Auth/') ?? false;
      if (status === 401 && !isAuthRequest && typeof window !== 'undefined') {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      if (status === 403) {
        // Forbidden - log but don't redirect (let the component handle it)
        console.warn('Access forbidden:', error.config?.url);
        // Don't auto-redirect on 403 - this can cause loops
        // Components should handle 403 errors appropriately
      }
      
      if (status === 404) {
        // Only log 404 if it's not a stats endpoint (those might not be implemented yet)
        const url = error.config?.url || '';
        if (!url.includes('/stats/')) {
          console.error('Resource not found:', url);
        }
      }
      
      if (status >= 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
