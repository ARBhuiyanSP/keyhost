import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        site_name: 'Keyhost Homes',
        site_tagline: '',
        site_description: '',
        site_logo: '',
        site_favicon: '',
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        maintenance_mode: false,
        registration_enabled: true,
        email_verification_required: true,
        phone_verification_required: false,
        contact_email: '',
        contact_phone: '',
        support_email: '',
      },
      globalSettings: null,
      
      // Load public settings from API
      loadPublicSettings: async () => {
        try {
          console.log('Loading public settings...'); // Debug
          // Mark request as silent to avoid showing error toast
          const response = await api.get('/settings/public', {
            silent: true
          });
          const publicSettings = response.data?.data || {};
          
          console.log('Loaded settings:', publicSettings); // Debug
          
          set((state) => ({
            settings: { ...state.settings, ...publicSettings },
            globalSettings: publicSettings
          }));
          
          return publicSettings;
        } catch (error) {
          // Silently fail - use cached/default settings
          console.warn('Failed to load public settings, using defaults:', error.message);
          // Don't show error toast for settings - it's not critical
          return null;
        }
      },
      
      // Update settings (for admin)
      updateSettings: async (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
        
        // Reload public settings after update
        await get().loadPublicSettings();
      },
      
      isRegistrationEnabled: () => get().settings.registration_enabled !== false,
      isMaintenanceMode: () => get().settings.maintenance_mode === true,
    }),
    {
      name: 'settings-storage',
    }
  )
);

export default useSettingsStore;