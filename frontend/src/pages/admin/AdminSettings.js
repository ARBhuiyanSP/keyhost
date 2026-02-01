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
          setFaviconPreview(formattedSettings.site_favicon);
        }
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
        'seo_meta_title', 'seo_meta_description', 'seo_keywords', 'seo_og_image'
      ];
      
      Object.keys(updatedSettings).forEach(key => {
        const value = updatedSettings[key];
        backendFormat[key] = {
          value: value,
          type: typeof value === 'number' ? 'number' : 
                typeof value === 'boolean' ? 'boolean' : 'string',
          is_public: publicSettings.includes(key),
          description: `Setting for ${key}`
        };
      });
      
      console.log('Saving settings:', backendFormat); // Debug log
      
      return api.put('/admin/settings', { settings: backendFormat });
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

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    { id: 'general', name: 'General', icon: FiGlobe },
    { id: 'branding', name: 'Branding', icon: FiImage },
    { id: 'seo', name: 'SEO', icon: FiSearch },
    { id: 'analytics', name: 'Analytics & Ads', icon: FiCode },
    { id: 'social', name: 'Social Media', icon: FiShare2 },
    { id: 'email', name: 'Email Settings', icon: FiMail },
    { id: 'payment', name: 'Payment & Currency', icon: FiDollarSign },
    { id: 'sms', name: 'SMS Settings', icon: FiMessageSquare },
    { id: 'advanced', name: 'Advanced', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="mt-2 text-gray-600">Manage all site-related settings and configurations</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    value={settings.site_name || ''}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Keyhost Homes"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">This will be displayed in the header and browser title</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.site_tagline || ''}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your perfect stay awaits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.site_description || ''}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="A brief description of your booking platform..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="contact@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.contact_phone || ''}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+880 1700-000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.support_email || ''}
                      onChange={(e) => handleInputChange('support_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="support@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.support_phone || ''}
                      onChange={(e) => handleInputChange('support_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+880 1700-000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={settings.site_address || ''}
                    onChange={(e) => handleInputChange('site_address', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={settings.seo_meta_title || ''}
                    onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Best Property Booking Platform | Keyhost Homes"
                    maxLength="60"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {(settings.seo_meta_title || '').length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.seo_meta_description || ''}
                    onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Discover and book amazing properties worldwide. Best prices, verified hosts, instant booking."
                    maxLength="160"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {(settings.seo_meta_description || '').length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={settings.seo_keywords || ''}
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="hotel booking, vacation rental, property management"
                  />
                  <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image (Social Share)
                  </label>
                  <input
                    type="text"
                    value={settings.seo_og_image || ''}
                    onChange={(e) => handleInputChange('seo_og_image', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/og-image.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>
              </div>
            )}

            {/* Analytics & Ads Settings */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.google_analytics_id || ''}
                    onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get your tracking ID from Google Analytics
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    value={settings.google_tag_manager_id || ''}
                    onChange={(e) => handleInputChange('google_tag_manager_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="GTM-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google AdSense Publisher ID
                  </label>
                  <input
                    type="text"
                    value={settings.google_adsense_id || ''}
                    onChange={(e) => handleInputChange('google_adsense_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={settings.facebook_pixel_id || ''}
                    onChange={(e) => handleInputChange('facebook_pixel_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Header Scripts
                  </label>
                  <textarea
                    value={settings.custom_header_scripts || ''}
                    onChange={(e) => handleInputChange('custom_header_scripts', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="<script>/* Your custom scripts here */</script>"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Add custom scripts to the &lt;head&gt; section
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Footer Scripts
                  </label>
                  <textarea
                    value={settings.custom_footer_scripts || ''}
                    onChange={(e) => handleInputChange('custom_footer_scripts', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="<script>/* Your custom scripts here */</script>"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Add custom scripts before closing &lt;/body&gt; tag
                  </p>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.facebook_url || ''}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter/X URL
                  </label>
                  <input
                    type="url"
                    value={settings.twitter_url || ''}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.instagram_url || ''}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={settings.linkedin_url || ''}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settings.youtube_url || ''}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    value={settings.tiktok_url || ''}
                    onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://tiktok.com/@yourusername"
                  />
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_host || ''}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.smtp_port || ''}
                      onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Encryption
                    </label>
                    <select
                      value={settings.smtp_encryption || 'tls'}
                      onChange={(e) => handleInputChange('smtp_encryption', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_username || ''}
                    onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.mail_from_address || ''}
                    onChange={(e) => handleInputChange('mail_from_address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="noreply@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.mail_from_name || ''}
                    onChange={(e) => handleInputChange('mail_from_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Enable SMS Notifications
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS API URL
                    </label>
                    <input
                      type="text"
                      value={settings.sms_api_url || 'http://217.172.190.215/sendtext'}
                      onChange={(e) => handleInputChange('sms_api_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="http://217.172.190.215/sendtext"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Base API endpoint for sending SMS messages.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={settings.sms_api_key || ''}
                        onChange={(e) => handleInputChange('sms_api_key', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter SMS API key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key
                      </label>
                      <input
                        type="text"
                        value={settings.sms_secret_key || ''}
                        onChange={(e) => handleInputChange('sms_secret_key', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter SMS secret key"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender ID / Caller ID
                    </label>
                    <input
                      type="text"
                      value={settings.sms_sender_id || ''}
                      onChange={(e) => handleInputChange('sms_sender_id', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+8801844015754"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The number or alphanumeric ID that recipients will see as the sender.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency || 'BDT'}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="BDT">BDT - Bangladeshi Taka</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone || 'Asia/Dhaka'}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.commission_rate || 10}
                    onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Default commission rate for property owners
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax/VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.tax_rate || 0}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.payment_time_limit_minutes || 15}
                    onChange={(e) => handleInputChange('payment_time_limit_minutes', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="5"
                    max="1440"
                    step="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Time limit (in minutes) for guests to complete payment after owner accepts booking request. Default: 15 minutes.
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Gateway Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enable_bkash || false}
                        onChange={(e) => handleInputChange('enable_bkash', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Enable bKash Payment
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enable_nagad || false}
                        onChange={(e) => handleInputChange('enable_nagad', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Enable Nagad Payment
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enable_stripe || false}
                        onChange={(e) => handleInputChange('enable_stripe', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Enable Stripe Payment
                      </label>
                    </div>
                  </div>
                </div>
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Enable Maintenance Mode
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.registration_enabled !== false}
                      onChange={(e) => handleInputChange('registration_enabled', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Allow New User Registration
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.email_verification_required || false}
                      onChange={(e) => handleInputChange('email_verification_required', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Require Email Verification
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.phone_verification_required || false}
                      onChange={(e) => handleInputChange('phone_verification_required', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Require Phone Verification
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.auto_approve_properties || false}
                      onChange={(e) => handleInputChange('auto_approve_properties', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Auto-approve New Properties
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.auto_approve_reviews || false}
                      onChange={(e) => handleInputChange('auto_approve_reviews', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Auto-approve Reviews
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Properties Per Owner
                    </label>
                    <input
                      type="number"
                      value={settings.max_properties_per_owner || 50}
                      onChange={(e) => handleInputChange('max_properties_per_owner', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Guests Per Booking
                    </label>
                    <input
                      type="number"
                      value={settings.max_guests_per_booking || 20}
                      onChange={(e) => handleInputChange('max_guests_per_booking', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Advance Days
                    </label>
                    <input
                      type="number"
                      value={settings.booking_advance_days || 365}
                      onChange={(e) => handleInputChange('booking_advance_days', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum days in advance for booking
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Hours
                    </label>
                    <input
                      type="number"
                      value={settings.cancellation_hours || 24}
                      onChange={(e) => handleInputChange('cancellation_hours', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Hours before check-in for free cancellation
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms of Service
                  </label>
                  <textarea
                    value={settings.terms_of_service || ''}
                    onChange={(e) => handleInputChange('terms_of_service', e.target.value)}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your terms of service..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Policy
                  </label>
                  <textarea
                    value={settings.privacy_policy || ''}
                    onChange={(e) => handleInputChange('privacy_policy', e.target.value)}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your privacy policy..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy
                  </label>
                  <textarea
                    value={settings.refund_policy || ''}
                    onChange={(e) => handleInputChange('refund_policy', e.target.value)}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your refund policy..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              <span>{updateMutation.isLoading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
