import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', credentials);
          const { user, token, refreshToken } = response.data.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token, refreshToken } = response.data.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      logout: async () => {
        try {
          if (get().token) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          // Remove token from API headers
          delete api.defaults.headers.common['Authorization'];
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          set({
            token,
            refreshToken: newRefreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set new token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/users/profile', profileData);
          const { user } = response.data.data;
          
          set({
            user,
            isLoading: false,
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Profile update failed' 
          };
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/users/change-password', passwordData);
          set({ isLoading: false });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Password change failed' 
          };
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/forgot-password', { email });
          set({ isLoading: false });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Password reset request failed' 
          };
        }
      },

      initializeAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ isAuthenticated: true });
        }
        set({ isLoading: false });
      },

      // Getters
      isAdmin: () => {
        const { user } = get();
        return user?.user_type === 'admin';
      },

      isPropertyOwner: () => {
        const { user } = get();
        return user?.user_type === 'property_owner';
      },

      isGuest: () => {
        const { user } = get();
        return user?.user_type === 'guest';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
