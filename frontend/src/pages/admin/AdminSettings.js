import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  FiGlobe, FiImage, FiSearch, FiDollarSign, FiMail, FiShare2,
  FiCode, FiSettings, FiSave, FiAlertCircle, FiMessageSquare
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import useSettingsStore from '../../store/settingsStore';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery(
    'admin-settings',
    () => api.get('/admin/settings'),
    {
      select: (response) => response.data?.data || {},
      onSuccess: (data) => {
        // Convert backend format to frontend format
        const formattedSettings = {};
        Object.keys(data).forEach(key => {
          formattedSettings[key] = data[key].value;
        });
        setSettings(formattedSettings);

        // Set image previews if available
        if (formattedSettings.site_logo) {
          setLogoPreview(formattedSettings.site_logo);
        }
        if (formattedSettings.site_favicon) {
        }
      }
    }
  );

  // Fetch SSL settings
  const { data: sslSettingsData, isLoading: isSslLoading } = useQuery(
    'sslcommerz-settings',
    () => api.get('/sslcommerz/settings'),
    {
      onSuccess: (data) => {
        const d = data.data?.data || {};
        setSettings(prev => ({
          ...prev,
          sslcommerz_store_id: d.store_id || '',
          sslcommerz_store_password: d.store_password || '',
          sslcommerz_is_live: d.is_live || false
        }));
      }
    }
  );

  // Update settings mutation
  const updateMutation = useMutation(
    (updatedSettings) => {
      // Convert to backend format
      const backendFormat = {};

      // List of public settings
      const publicSettings = [
        'site_name', 'site_tagline', 'site_description', 'site_logo',
        'site_favicon', 'contact_email', 'contact_phone', 'support_email',
        'support_phone', 'site_address', 'currency', 'timezone',
        'registration_enabled', 'facebook_url', 'twitter_url', 'instagram_url',
        'linkedin_url', 'youtube_url', 'tiktok_url', 'google_analytics_id',
        'seo_meta_title', 'seo_meta_description', 'seo_keywords', 'seo_og_image',
        'google_client_id', 'google_maps_api_key',
        'google_places_enabled', 'google_api_associated_email',
        'enable_bkash', 'bkash_is_live', 'bkash_merchant_id', 'bkash_merchant_key', 'bkash_merchant_secret',
        'bkash_username', 'bkash_password', 'bkash_api_url', 'bkash_api_associated_email',
        'enable_nagad', 'nagad_is_live', 'nagad_merchant_id', 'nagad_merchant_private_key',
        'nagad_public_key', 'nagad_api_url',
        'terms_of_service', 'privacy_policy', 'refund_policy',
        'censor_phone_numbers', 'censor_emails', 'censor_links', 'censor_banned_words'
      ];

      Object.keys(updatedSettings).forEach(key => {
        let value = updatedSettings[key];
        let type = typeof value === 'number' ? 'number' :
          typeof value === 'boolean' ? 'boolean' : 'string';

        if (key === 'censor_banned_words') {
          type = 'json';
          if (typeof value === 'string') {
            try {
              JSON.parse(value);
            } catch (e) {
              value = '[]';
            }
          } else {
            value = JSON.stringify(value || []);
          }
        }

        backendFormat[key] = {
          value: value,
          type: type,
          is_public: publicSettings.includes(key),
          description: `Setting for ${key}`
        };
      });

      console.log('Saving settings:', backendFormat); // Debug log

      const sslPromise = api.post('/sslcommerz/settings', {
        store_id: updatedSettings.sslcommerz_store_id || '',
        store_password: updatedSettings.sslcommerz_store_password || '',
        is_live: updatedSettings.sslcommerz_is_live || false
      }).catch(err => console.error('Failed to save SSL settings:', err));

      return Promise.all([
        sslPromise,
        api.put('/admin/settings', { settings: backendFormat })
      ]);
    },
    {
      onSuccess: async () => {
        showSuccess('Settings saved successfully! Page will reload in 2 seconds...');

        // Reload settings from API
        await queryClient.invalidateQueries('admin-settings');

        // Force reload public settings
        const { loadPublicSettings } = useSettingsStore.getState();
        await loadPublicSettings();

        // Reload page after short delay to show changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      onError: (error) => {
        console.error('Settings save error:', error);
        showError(error.response?.data?.message || 'Failed to save settings');
      }
    }
  );

  const [whatsappStatus, setWhatsappStatus] = useState({ status: 'DISCONNECTED', qr: null, phone: null });
  const [connectingWhatsapp, setConnectingWhatsapp] = useState(false);

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await api.get('/admin/whatsapp/status');
      if (response.data.success) {
        setWhatsappStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status:', error);
    }
  };

  const handleConnectWhatsApp = async () => {
    try {
      setConnectingWhatsapp(true);
      const response = await api.post('/admin/whatsapp/connect');
      if (response.data.success) {
        fetchWhatsAppStatus();
      }
    } catch (error) {
      showError('Failed to initiate WhatsApp connection');
    } finally {
      setConnectingWhatsapp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    try {
      const response = await api.post('/admin/whatsapp/disconnect');
      if (response.data.success) {
        showSuccess('WhatsApp disconnected successfully');
        fetchWhatsAppStatus();
      }
    } catch (error) {
      showError('Failed to disconnect WhatsApp');
    }
  };

  useEffect(() => {
    let interval;
    if (activeTab === 'sms' && settings.sms_gateway_type === 'whatsapp') {
      fetchWhatsAppStatus();
      interval = setInterval(fetchWhatsAppStatus, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, settings.sms_gateway_type]);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleImageUpload = (key, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        handleInputChange(key, base64String);

        if (key === 'site_logo') {
          setLogoPreview(base64String);
        } else if (key === 'site_favicon') {
          setFaviconPreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading || isSslLoading) return <LoadingSpinner />;

  const tabs = [
    { id: 'general', name: 'General', icon: FiGlobe },
    { id: 'branding', name: 'Branding', icon: FiImage },
    { id: 'seo', name: 'SEO', icon: FiSearch },
    { id: 'analytics', name: 'Analytics & Ads', icon: FiCode },
    { id: 'social', name: 'Social Media', icon: FiShare2 },
    { id: 'email', name: 'Email Settings', icon: FiMail },
    { id: 'payment', name: 'Payment & Currency', icon: FiDollarSign },
    { id: 'sms', name: 'SMS Settings', icon: FiMessageSquare },
    { id: 'censorship', name: 'Chat Security', icon: FiAlertCircle },
    { id: 'advanced', name: 'Advanced', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Global Save */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
            <p className="mt-2 text-sm text-gray-500">Configure your platform's core mechanics and integrations.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm text-sm"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSubmit}
              disabled={updateMutation.isLoading}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all flex items-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-70 text-sm"
            >
              <FiSave className="w-4 h-4" />
              <span>{updateMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vertical Menu Sidebar */}
          <div className="lg:w-64 flex-shrink-0 mb-6 lg:mb-0">
            <nav className="space-y-1 sticky top-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                    className={`
                      w-full text-left flex items-center px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-white shadow-sm ring-1 ring-gray-200 text-gray-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 font-medium'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-sm">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Canvas Options Context */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                {/* Dynamic Headers based on active tab */}
                <div className="mb-8 pb-6 border-b border-gray-100 flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4">
                    {React.createElement(tabs.find(t => t.id === activeTab)?.icon || FiSettings, { className: "w-6 h-6 text-blue-600" })}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{tabs.find(t => t.id === activeTab)?.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your {tabs.find(t => t.id === activeTab)?.name.toLowerCase()} preferences.</p>
                  </div>
                </div>

                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Site Name *
                      </label>
                      <input
                        type="text"
                        value={settings.site_name || ''}
                        onChange={(e) => handleInputChange('site_name', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Keyhost Homes"
                        required
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">This will be displayed in the header and browser title</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Site Tagline
                      </label>
                      <input
                        type="text"
                        value={settings.site_tagline || ''}
                        onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Your perfect stay awaits"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.site_description || ''}
                        onChange={(e) => handleInputChange('site_description', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="A brief description of your booking platform..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          value={settings.contact_email || ''}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          placeholder="contact@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={settings.contact_phone || ''}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          placeholder="+880 1700-000000"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={settings.support_email || ''}
                          onChange={(e) => handleInputChange('support_email', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          placeholder="support@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Support Phone
                        </label>
                        <input
                          type="tel"
                          value={settings.support_phone || ''}
                          onChange={(e) => handleInputChange('support_phone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          placeholder="+880 1700-000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Address
                      </label>
                      <textarea
                        value={settings.site_address || ''}
                        onChange={(e) => handleInputChange('site_address', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="123 Main Street, City, Country"
                      />
                    </div>
                  </div>
                )}

                {/* Branding Settings */}
                {activeTab === 'branding' && (
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Logo</h3>
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          {logoPreview ? (
                            <div className="relative">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-20 w-auto max-w-[200px] object-contain border border-gray-300 rounded p-2 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoPreview('');
                                  handleInputChange('site_logo', '');
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                              <FiImage className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('site_logo', e.target.files[0])}
                            className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100 cursor-pointer"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            📌 Recommended: PNG or SVG, max 200x60px, under 500KB
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Will be displayed in Navbar and Footer
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Favicon Upload */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Favicon</h3>
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          {faviconPreview ? (
                            <div className="relative">
                              <img
                                src={faviconPreview}
                                alt="Favicon preview"
                                className="h-10 w-10 object-contain border border-gray-300 rounded p-1 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFaviconPreview('');
                                  handleInputChange('site_favicon', '');
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                              <FiImage className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('site_favicon', e.target.files[0])}
                            className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100 cursor-pointer"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            📌 Recommended: ICO or PNG, 32x32px or 64x64px, under 100KB
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Will be displayed in browser tab
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Primary Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.primary_color || '#3B82F6'}
                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                            className="h-10 w-20 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={settings.primary_color || '#3B82F6'}
                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Secondary Color
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.secondary_color || '#10B981'}
                            onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                            className="h-10 w-20 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={settings.secondary_color || '#10B981'}
                            onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                            placeholder="#10B981"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Settings */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900">SEO Tips</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          These settings help improve your site's visibility in search engines.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={settings.seo_meta_title || ''}
                        onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Best Property Booking Platform | Keyhost Homes"
                        maxLength="60"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        {(settings.seo_meta_title || '').length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={settings.seo_meta_description || ''}
                        onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Discover and book amazing properties worldwide. Best prices, verified hosts, instant booking."
                        maxLength="160"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        {(settings.seo_meta_description || '').length}/160 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={settings.seo_keywords || ''}
                        onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="hotel booking, vacation rental, property management"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">Separate keywords with commas</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Open Graph Image (Social Share)
                      </label>
                      <input
                        type="text"
                        value={settings.seo_og_image || ''}
                        onChange={(e) => handleInputChange('seo_og_image', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://example.com/og-image.jpg"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Recommended size: 1200x630 pixels
                      </p>
                    </div>
                  </div>
                )}

                {/* Analytics & Ads Settings */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        value={settings.google_analytics_id || ''}
                        onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Get your tracking ID from Google Analytics
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Google Tag Manager ID
                      </label>
                      <input
                        type="text"
                        value={settings.google_tag_manager_id || ''}
                        onChange={(e) => handleInputChange('google_tag_manager_id', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Google AdSense Publisher ID
                      </label>
                      <input
                        type="text"
                        value={settings.google_adsense_id || ''}
                        onChange={(e) => handleInputChange('google_adsense_id', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Facebook Pixel ID
                      </label>
                      <input
                        type="text"
                        value={settings.facebook_pixel_id || ''}
                        onChange={(e) => handleInputChange('facebook_pixel_id', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="XXXXXXXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Custom Header Scripts
                      </label>
                      <textarea
                        value={settings.custom_header_scripts || ''}
                        onChange={(e) => handleInputChange('custom_header_scripts', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        placeholder="<script>/* Your custom scripts here */</script>"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Add custom scripts to the &lt;head&gt; section
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Custom Footer Scripts
                      </label>
                      <textarea
                        value={settings.custom_footer_scripts || ''}
                        onChange={(e) => handleInputChange('custom_footer_scripts', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        placeholder="<script>/* Your custom scripts here */</script>"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Add custom scripts before closing &lt;/body&gt; tag
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Media Settings */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={settings.facebook_url || ''}
                        onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Twitter/X URL
                      </label>
                      <input
                        type="url"
                        value={settings.twitter_url || ''}
                        onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={settings.instagram_url || ''}
                        onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://instagram.com/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={settings.linkedin_url || ''}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={settings.youtube_url || ''}
                        onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        TikTok URL
                      </label>
                      <input
                        type="url"
                        value={settings.tiktok_url || ''}
                        onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="https://tiktok.com/@yourusername"
                      />
                    </div>
                  </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_host || ''}
                        onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.smtp_port || ''}
                          onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          placeholder="587"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          SMTP Encryption
                        </label>
                        <select
                          value={settings.smtp_encryption || 'tls'}
                          onChange={(e) => handleInputChange('smtp_encryption', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        >
                          <option value="tls">TLS</option>
                          <option value="ssl">SSL</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_username || ''}
                        onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="your-email@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={settings.smtp_password || ''}
                        onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        From Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.mail_from_address || ''}
                        onChange={(e) => handleInputChange('mail_from_address', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="noreply@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.mail_from_name || ''}
                        onChange={(e) => handleInputChange('mail_from_name', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Keyhost Homes"
                      />
                    </div>
                  </div>
                )}

                {/* SMS Settings */}
                {activeTab === 'sms' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900">SMS Gateway Configuration</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Configure the SMS gateway credentials used to notify guests and property owners. Messages are sent whenever owners accept bookings and when new bookings are created.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.sms_enabled !== false}
                          onChange={(e) => handleInputChange('sms_enabled', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Enable SMS Notifications
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Notification Channel
                        </label>
                        <select
                          value={settings.sms_gateway_type || 'bulk_sms'}
                          onChange={(e) => handleInputChange('sms_gateway_type', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        >
                          <option value="bulk_sms">Traditional Bulk SMS (via API URL)</option>
                          <option value="whatsapp">WhatsApp (Built-in Free Integration)</option>
                        </select>
                      </div>

                      {settings.sms_gateway_type === 'whatsapp' ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">WhatsApp Session Status</h4>
                            <div className="flex items-center space-x-3 mt-3">
                              {whatsappStatus.status === 'CONNECTED' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ● Connected
                                </span>
                              ) : whatsappStatus.status === 'CONNECTING' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                  ● Connecting...
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  ● Disconnected
                                </span>
                              )}
                              {whatsappStatus.phone && (
                                <span className="text-sm font-semibold text-gray-600">
                                  Linked Number: +{whatsappStatus.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons & QR Code Display */}
                          {whatsappStatus.status === 'CONNECTED' ? (
                            <div>
                              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                The system is connected to your WhatsApp number. All notifications will be delivered instantly for free.
                              </p>
                              <button
                                type="button"
                                onClick={handleDisconnectWhatsApp}
                                className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl border border-red-200 transition-all active:scale-[0.98]"
                              >
                                Disconnect WhatsApp
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {whatsappStatus.qr ? (
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-5 rounded-xl border border-gray-100 shadow-[2px_2px_0px_rgba(0,0,0,0.02)]">
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0">
                                    <img 
                                      src={whatsappStatus.qr} 
                                      alt="WhatsApp Scan QR" 
                                      className="w-48 h-48 select-none"
                                    />
                                  </div>
                                  <div className="space-y-3 mt-2">
                                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Instructions to link:</h5>
                                    <ol className="list-decimal list-inside text-xs text-gray-500 space-y-2 leading-relaxed">
                                      <li>Open <span className="font-semibold text-gray-700">WhatsApp</span> on your phone.</li>
                                      <li>Tap <span className="font-semibold text-gray-700">Menu</span> (Android) or <span className="font-semibold text-gray-700">Settings</span> (iPhone).</li>
                                      <li>Select <span className="font-semibold text-gray-700">Linked Devices</span> and then <span className="font-semibold text-gray-700">Link a Device</span>.</li>
                                      <li>Point your phone's camera at this screen to scan the QR code.</li>
                                    </ol>
                                    <p className="text-[10px] text-gray-400 font-medium pt-2">
                                      * The QR code updates automatically. Scanning is one-time only.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                    Link your WhatsApp account to start sending automated notification messages directly to users for free.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleConnectWhatsApp}
                                    disabled={connectingWhatsapp}
                                    className="px-5 py-2.5 bg-[#004e59] hover:bg-[#003d46] text-white hover:shadow-md font-bold text-xs rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {connectingWhatsapp ? 'Generating...' : 'Link WhatsApp (Scan QR)'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              SMS API URL
                            </label>
                            <input
                              type="text"
                              value={settings.sms_api_url || 'http://217.172.190.215/sendtext'}
                              onChange={(e) => handleInputChange('sms_api_url', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="http://217.172.190.215/sendtext"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Base API endpoint for sending SMS messages.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                                API Key
                              </label>
                              <input
                                type="text"
                                value={settings.sms_api_key || ''}
                                onChange={(e) => handleInputChange('sms_api_key', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                                placeholder="Enter SMS API key"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                                Secret Key
                              </label>
                              <input
                                type="text"
                                value={settings.sms_secret_key || ''}
                                onChange={(e) => handleInputChange('sms_secret_key', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                                placeholder="Enter SMS secret key"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Sender ID / Caller ID
                            </label>
                            <input
                              type="text"
                              value={settings.sms_sender_id || ''}
                              onChange={(e) => handleInputChange('sms_sender_id', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="+8801844015754"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              The number or alphanumeric ID that recipients will see as the sender.
                            </p>
                          </div>
                        </>
                      )}

                      <div className="border-t pt-6 mt-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">SMS Notification Templates</h4>
                        <p className="text-xs text-gray-500 mb-6 font-medium">
                          Customize the messages sent for different events. Use dynamic placeholders like <code>{"{booking_ref}"}</code>, <code>{"{guest_name}"}</code>, etc. which will be replaced with real booking data when the message is sent.
                        </p>

                        <div className="space-y-6">
                          {/* Booking Request To Host */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Booking Request (To Host)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{host_name}'}, {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}, {'{check_in_date}'}, {'{booking_url}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_booking_request_host || ''}
                              onChange={(e) => handleInputChange('sms_template_booking_request_host', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}"
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the property owner when a guest submits a new booking request.</p>
                          </div>

                          {/* Booking Accepted To Guest */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Booking Request Accepted (To Guest)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}, {'{amount}'}, {'{payment_limit}'}, {'{deadline}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_booking_accepted_guest || ''}
                              onChange={(e) => handleInputChange('sms_template_booking_accepted_guest', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay."
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the guest when the property owner accepts their booking request.</p>
                          </div>

                          {/* Booking Paid To Host */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Booking Paid & Confirmed (To Host)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{host_name}'}, {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}, {'{check_in_date}'}, {'{amount}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_booking_paid_host || ''}
                              onChange={(e) => handleInputChange('sms_template_booking_paid_host', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}."
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the property owner when a guest successfully pays for the booking.</p>
                          </div>

                          {/* Booking Paid To Guest */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Booking Paid & Confirmed (To Guest)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}, {'{check_in_date}'}, {'{amount}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_booking_paid_guest || ''}
                              onChange={(e) => handleInputChange('sms_template_booking_paid_guest', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}."
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the guest when their payment is completed successfully.</p>
                          </div>

                          {/* Checkout To Guest */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Checkout Completed (To Guest)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_checkout_guest || ''}
                              onChange={(e) => handleInputChange('sms_template_checkout_guest', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!"
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the guest when checkout is processed (either manually or via HMS folio settlement).</p>
                          </div>

                          {/* Refund To Guest */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Refund Issued (To Guest)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}, {'{amount}'}, {'{reason}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_refund_guest || ''}
                              onChange={(e) => handleInputChange('sms_template_refund_guest', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}."
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the guest when a refund request is approved/completed by Admin or Host.</p>
                          </div>

                          {/* Refund To Host */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Refund Issued (To Host)
                              </label>
                              <span className="text-[10px] text-gray-400 font-mono">Placeholders: {'{host_name}'}, {'{guest_name}'}, {'{property_name}'}, {'{booking_ref}'}, {'{amount}'}, {'{reason}'}</span>
                            </div>
                            <textarea
                              value={settings.sms_template_refund_host || ''}
                              onChange={(e) => handleInputChange('sms_template_refund_host', e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="[Keyhost] Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}."
                            />
                            <p className="mt-1 text-xs text-gray-400">Trigger: Sent to the host when a refund is completed for their booking.</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600 mt-6">
                        <p className="font-semibold text-gray-800 mb-2">SMS Endpoint Examples</p>
                        <p><span className="font-semibold">Send:</span> http://217.172.190.215/sendtext?apikey=API_KEY&amp;secretkey=SECRET_KEY&amp;callerID=SENDER_ID&amp;toUser=MOBILE_NUMBER&amp;messageContent=MESSAGE</p>
                        <p className="mt-2"><span className="font-semibold">Status:</span> http://217.172.190.215/getstatus?apikey=API_KEY&amp;secretkey=SECRET_KEY&amp;messageid=MESSAGE_ID</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment & Currency Settings */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.currency || 'BDT'}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        >
                          <option value="BDT">BDT - Bangladeshi Taka</option>
                          <option value="USD">USD ($) - US Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="GBP">GBP (£) - British Pound</option>
                          <option value="INR">INR (₹) - Indian Rupee</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.timezone || 'Asia/Dhaka'}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        >
                          <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                          <option value="Europe/London">Europe/London (GMT+0)</option>
                          <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        value={settings.commission_rate || 10}
                        onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Default commission rate for property owners
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Tax/VAT Rate (%)
                      </label>
                      <input
                        type="number"
                        value={settings.tax_rate || 0}
                        onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Payment Time Limit (Minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.payment_time_limit_minutes || 15}
                        onChange={(e) => handleInputChange('payment_time_limit_minutes', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        min="1"
                        max="1440"
                        step="1"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Time limit (in minutes) for guests to complete payment after owner accepts booking request. Default: 15 minutes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Pending Booking Auto-Cancel Timeout (Minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.pending_booking_timeout_minutes || 1440}
                        onChange={(e) => handleInputChange('pending_booking_timeout_minutes', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        min="1"
                        max="10080"
                        step="1"
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        If a host does not accept a booking request within this many minutes, the booking is automatically cancelled and the guest is notified via SMS. Default: 1440 minutes (24 hours). Max: 10080 minutes (7 days).
                      </p>
                    </div>


                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Gateway Settings</h3>

                      <div className="space-y-4">


                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.enable_sslcommerz || false}
                            onChange={(e) => handleInputChange('enable_sslcommerz', e.target.checked)}
                            className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                          />
                          <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                            Enable SSLCommerz Payment
                          </label>
                        </div>
                      </div>
                    </div>

                    {settings.enable_sslcommerz && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">SSLCommerz Credentials</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.sslcommerz_is_live || false}
                              onChange={(e) => handleInputChange('sslcommerz_is_live', e.target.checked)}
                              className="h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-colors cursor-pointer"
                            />
                            <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                              Live Mode (Uncheck for Sandbox)
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Store ID *
                            </label>
                            <input
                              type="text"
                              value={settings.sslcommerz_store_id || ''}
                              onChange={(e) => handleInputChange('sslcommerz_store_id', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="e.g. testbox"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Store Password *
                            </label>
                            <input
                              type="password"
                              value={settings.sslcommerz_store_password || ''}
                              onChange={(e) => handleInputChange('sslcommerz_store_password', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="e.g. qwerty"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================= BKASH SETTINGS ================= */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.enable_bkash || false}
                          onChange={(e) => handleInputChange('enable_bkash', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Enable bKash Payment
                        </label>
                      </div>
                    </div>

                    {settings.enable_bkash && (
                      <div className="border-t pt-6 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">bKash Credentials</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.bkash_is_live || false}
                              onChange={(e) => handleInputChange('bkash_is_live', e.target.checked)}
                              className="h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-colors cursor-pointer"
                            />
                            <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                              Live Mode (Uncheck for Sandbox)
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              API URL Base
                            </label>
                            <input
                              type="text"
                              value={settings.bkash_api_url || ''}
                              onChange={(e) => handleInputChange('bkash_api_url', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="Sandbox: https://tokenized.sandbox.bka.sh/v1.2.0-beta"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Merchant ID
                            </label>
                            <input
                              type="text"
                              value={settings.bkash_merchant_id || ''}
                              onChange={(e) => handleInputChange('bkash_merchant_id', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="bKash Merchant ID"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Username
                            </label>
                            <input
                              type="text"
                              value={settings.bkash_username || ''}
                              onChange={(e) => handleInputChange('bkash_username', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="bKash API Username"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Password
                            </label>
                            <input
                              type="password"
                              value={settings.bkash_password || ''}
                              onChange={(e) => handleInputChange('bkash_password', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="bKash API Password"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              App Key (Merchant Key)
                            </label>
                            <input
                              type="text"
                              value={settings.bkash_merchant_key || ''}
                              onChange={(e) => handleInputChange('bkash_merchant_key', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="bKash App Key"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              App Secret (Merchant Secret)
                            </label>
                            <input
                              type="password"
                              value={settings.bkash_merchant_secret || ''}
                              onChange={(e) => handleInputChange('bkash_merchant_secret', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="bKash App Secret"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================= NAGAD SETTINGS ================= */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.enable_nagad || false}
                          onChange={(e) => handleInputChange('enable_nagad', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Enable Nagad Payment
                        </label>
                      </div>
                    </div>

                    {settings.enable_nagad && (
                      <div className="border-t pt-6 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Nagad Credentials</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.nagad_is_live || false}
                              onChange={(e) => handleInputChange('nagad_is_live', e.target.checked)}
                              className="h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-colors cursor-pointer"
                            />
                            <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                              Live Mode (Uncheck for Sandbox)
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              API URL Base
                            </label>
                            <input
                              type="text"
                              value={settings.nagad_api_url || ''}
                              onChange={(e) => handleInputChange('nagad_api_url', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="Sandbox: http://sandbox.mymoid.com:9090"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Merchant ID
                            </label>
                            <input
                              type="text"
                              value={settings.nagad_merchant_id || ''}
                              onChange={(e) => handleInputChange('nagad_merchant_id', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="Nagad Merchant ID"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Merchant Private Key (base64, no headers)
                            </label>
                            <textarea
                              rows="4"
                              value={settings.nagad_merchant_private_key || settings.nagad_private_key || ''}
                              onChange={(e) => handleInputChange('nagad_merchant_private_key', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="Base64-encoded RSA private key (without PEM headers)"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                              Nagad Public Key (PEM format)
                            </label>
                            <textarea
                              rows="4"
                              value={settings.nagad_public_key || ''}
                              onChange={(e) => handleInputChange('nagad_public_key', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Settings */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_mode || false}
                          onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Enable Maintenance Mode
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.registration_enabled !== false}
                          onChange={(e) => handleInputChange('registration_enabled', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Allow New User Registration
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.email_verification_required || false}
                          onChange={(e) => handleInputChange('email_verification_required', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Require Email Verification
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.phone_verification_required || false}
                          onChange={(e) => handleInputChange('phone_verification_required', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Require Phone Verification
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.auto_approve_properties || false}
                          onChange={(e) => handleInputChange('auto_approve_properties', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Auto-approve New Properties
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.auto_approve_reviews || false}
                          onChange={(e) => handleInputChange('auto_approve_reviews', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Auto-approve Reviews
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Max Properties Per Owner
                        </label>
                        <input
                          type="number"
                          value={settings.max_properties_per_owner || 50}
                          onChange={(e) => handleInputChange('max_properties_per_owner', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Max Guests Per Booking
                        </label>
                        <input
                          type="number"
                          value={settings.max_guests_per_booking || 20}
                          onChange={(e) => handleInputChange('max_guests_per_booking', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Booking Advance Days
                        </label>
                        <input
                          type="number"
                          value={settings.booking_advance_days || 365}
                          onChange={(e) => handleInputChange('booking_advance_days', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          min="1"
                        />
                        <p className="mt-1.5 text-xs text-gray-500 font-medium">
                          Maximum days in advance for booking
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                          Cancellation Hours
                        </label>
                        <input
                          type="number"
                          value={settings.cancellation_hours || 24}
                          onChange={(e) => handleInputChange('cancellation_hours', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          min="1"
                        />
                        <p className="mt-1.5 text-xs text-gray-500 font-medium">
                          Hours before check-in for free cancellation
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Terms of Service
                      </label>
                      <textarea
                        value={settings.terms_of_service || ''}
                        onChange={(e) => handleInputChange('terms_of_service', e.target.value)}
                        rows="6"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Enter your terms of service..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Privacy Policy
                      </label>
                      <textarea
                        value={settings.privacy_policy || ''}
                        onChange={(e) => handleInputChange('privacy_policy', e.target.value)}
                        rows="6"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Enter your privacy policy..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Refund Policy
                      </label>
                      <textarea
                        value={settings.refund_policy || ''}
                        onChange={(e) => handleInputChange('refund_policy', e.target.value)}
                        rows="6"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder="Enter your refund policy..."
                      />
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication & APIs</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                            Google Login Client ID
                          </label>
                          <input
                            type="text"
                            value={settings.google_client_id || ''}
                            onChange={(e) => handleInputChange('google_client_id', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                            placeholder="Your Google Client ID from Google Cloud Console"
                          />
                          <p className="mt-1.5 text-xs text-gray-500 font-medium">
                            Enables "Login with Google" if provided.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                            Google Maps API Key
                          </label>
                          <input
                            type="text"
                            value={settings.google_maps_api_key || ''}
                            onChange={(e) => handleInputChange('google_maps_api_key', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                            placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
                          />
                          <p className="mt-1.5 text-xs text-gray-500 font-medium">
                            Required for map rendering and location search. Enable <strong>Maps JavaScript API</strong>, <strong>Places API</strong> and <strong>Geocoding API</strong> in Google Cloud Console.
                          </p>
                        </div>

                        {/* Google Cloud Account Email */}
                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                            Google Cloud Account (Reference)
                          </label>
                          <input
                            type="email"
                            value={settings.google_api_associated_email || ''}
                            onChange={(e) => handleInputChange('google_api_associated_email', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                            placeholder="yourname@gmail.com"
                          />
                          <p className="mt-1.5 text-xs text-gray-500 font-medium">
                            Reference only — which Gmail account owns the Google Cloud project above. Helps track who to contact if the API key needs to be changed.
                          </p>
                        </div>

                        {/* Google Places Search Toggle */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Enable Google Places Search
                              </label>
                              <p className="mt-1 text-xs text-gray-500 font-medium">
                                When ON — location search suggestions come from Google Places API (shows neighborhoods like Dhanmondi, Mirpur-10, etc.).<br />
                                When OFF — suggestions come from the property database only (cities where listings exist).
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInputChange('google_places_enabled', !settings.google_places_enabled)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.google_places_enabled ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  settings.google_places_enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                          {settings.google_places_enabled && (
                            <div className="mt-3 flex items-start gap-2 text-xs text-blue-700 bg-blue-100/60 rounded-xl px-3 py-2">
                              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span>Google Places API is <strong>active</strong>. Each search query consumes API quota (~$2.83 per 1,000 requests after the free $200/month credit).</span>
                            </div>
                          )}
                          {!settings.google_places_enabled && (
                            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-gray-100/60 rounded-xl px-3 py-2">
                              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                              <span>Google Places API is <strong>disabled</strong>. Search suggestions will only show cities from your property database.</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                            Google Login Client Secret
                          </label>
                          <input
                            type="password"
                            value={settings.google_client_secret || ''}
                            onChange={(e) => handleInputChange('google_client_secret', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                            placeholder="Your Google Client Secret from Google Cloud Console"
                          />
                          <p className="mt-1.5 text-xs text-gray-500 font-medium">
                            Required on the server to authenticate sessions securely.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Security / Censorship Settings */}
                {activeTab === 'censorship' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.censor_phone_numbers !== false}
                          onChange={(e) => handleInputChange('censor_phone_numbers', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Censor Phone Numbers
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 ml-8 -mt-2">
                        Automatically redacts mobile phone numbers in host-guest chat messages.
                      </p>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.censor_emails !== false}
                          onChange={(e) => handleInputChange('censor_emails', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Censor Email Addresses
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 ml-8 -mt-2">
                        Automatically redacts email addresses in host-guest chat messages.
                      </p>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.censor_links !== false}
                          onChange={(e) => handleInputChange('censor_links', e.target.checked)}
                          className="h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                          Censor Website Links & URLs
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 ml-8 -mt-2">
                        Automatically redacts URLs and domain names in host-guest chat messages.
                      </p>
                    </div>

                    <div className="pt-6 border-t">
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        Banned Words & Phrases (JSON Array)
                      </label>
                      <textarea
                        value={
                          typeof settings.censor_banned_words === 'string'
                            ? settings.censor_banned_words
                            : JSON.stringify(settings.censor_banned_words || [])
                        }
                        onChange={(e) => {
                          let val = e.target.value;
                          try {
                            val = JSON.parse(e.target.value);
                          } catch (err) {
                            // Allow string value while typing
                          }
                          handleInputChange('censor_banned_words', val);
                        }}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        placeholder='e.g. ["basha number", "যোগাযোগ করুন", "facebook"]'
                      />
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Enter a JSON list of banned words or phrases. For example: <code>{`["call me", "যোগাযোগ", "bkash"]`}</code>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
