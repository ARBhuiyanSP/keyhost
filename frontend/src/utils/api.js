import axios from 'axios';
import { toast } from 'react-toastify';

// Track last error toast time to prevent spam
let lastTimeoutErrorTime = 0;
let lastNetworkErrorTime = 0;
const ERROR_DEBOUNCE_TIME = 5000; // 5 seconds

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // Increased to 60 seconds for cPanel servers
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }

    // Preserve silent flag from config
    if (config.silent) {
      config._silent = true;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const token = localStorage.getItem('auth-storage');
        if (token) {
          const authData = JSON.parse(token);
          if (authData.state?.refreshToken) {
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
              { refreshToken: authData.state.refreshToken }
            );

            const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

            // Update stored tokens
            const updatedAuthData = {
              ...authData,
              state: {
                ...authData.state,
                token: newToken,
                refreshToken: newRefreshToken,
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedAuthData));

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear auth data and redirect to login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Only show timeout error if it's not a silent request and not shown recently
      if (!originalRequest._silent) {
        const now = Date.now();
        if (now - lastTimeoutErrorTime > ERROR_DEBOUNCE_TIME) {
          lastTimeoutErrorTime = now;
          toast.error('Request timeout. Please check your connection and try again.');
        }
      }
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      if (!originalRequest._silent) {
        const now = Date.now();
        if (now - lastNetworkErrorTime > ERROR_DEBOUNCE_TIME) {
          lastNetworkErrorTime = now;
          toast.error('Network error. Please check your internet connection.');
        }
      }
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      if (!originalRequest._silent) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.response?.status === 404) {
      if (!originalRequest._silent) {
        toast.error('Resource not found.');
      }
    } else if (error.response?.status === 403) {
      if (!originalRequest._silent) {
        toast.error('Access denied.');
      }
    } else if (error.response?.data?.message) {
      if (!originalRequest._silent) {
        toast.error(error.response.data.message);
      }
    } else if (error.message && !originalRequest._silent) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Upload file
  upload: async (url, formData, config = {}) => {
    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },
};

export default api;
