import { useCallback } from 'react';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

export const useFbPixel = () => {
  const { settings } = useSettingsStore();
  const { user } = useAuthStore();
  const pixelId = settings?.facebook_pixel_id;

  // Helper to generate unique event ID
  const generateEventId = useCallback((prefix = 'evt') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper to get matching user data
  const getUserData = useCallback(() => {
    if (!user) return {};
    return {
      email: user.email,
      phone: user.phone,
      firstName: user.first_name || user.firstName,
      lastName: user.last_name || user.lastName,
    };
  }, [user]);

  // General track function
  const track = useCallback(async (eventName, customData = {}, eventId = null) => {
    if (!pixelId) return;

    // 1. Generate or use event ID for deduplication
    const finalEventId = eventId || generateEventId(eventName.toLowerCase());

    // 2. Track on browser (standard pixel)
    if (window.fbq) {
      window.fbq('track', eventName, customData, { eventID: finalEventId });
      console.log(`[Pixel] Tracked browser event: ${eventName}`, customData, finalEventId);
    } else {
      console.warn(`[Pixel] window.fbq not loaded. Browser track skipped for: ${eventName}`);
    }

    // 3. Track on Server via Conversions API (CAPI)
    try {
      await api.post('/meta-pixel/event', {
        eventName,
        eventId: finalEventId,
        eventSourceUrl: window.location.href,
        userData: getUserData(),
        customData
      });
    } catch (err) {
      console.error(`[Pixel] CAPI error for event ${eventName}:`, err.message || err);
    }
  }, [pixelId, generateEventId, getUserData]);

  // Standard Events
  const trackPageView = useCallback(() => {
    track('PageView');
  }, [track]);

  const trackSearch = useCallback((searchString, checkinDate, checkoutDate, guests) => {
    track('Search', {
      search_string: searchString,
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      guests: guests
    });
  }, [track]);

  const trackViewContent = useCallback((contentName, contentCategory, contentIds, value, currency = 'BDT') => {
    track('ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      content_ids: Array.isArray(contentIds) ? contentIds : [contentIds],
      value: parseFloat(value) || 0,
      currency
    });
  }, [track]);

  const trackInitiateCheckout = useCallback((value, currency = 'BDT', contentIds = [], numItems = 1) => {
    track('InitiateCheckout', {
      value: parseFloat(value) || 0,
      currency,
      content_ids: Array.isArray(contentIds) ? contentIds : [contentIds],
      num_items: numItems
    });
  }, [track]);

  const trackPurchase = useCallback((value, currency = 'BDT', contentType = 'product', contents = [], bookingId = null) => {
    track('Purchase', {
      value: parseFloat(value) || 0,
      currency,
      content_type: contentType,
      contents,
      booking_id: bookingId
    });
  }, [track]);

  const trackLead = useCallback((contentType = 'contact') => {
    track('Lead', { content_type: contentType });
  }, [track]);

  const trackCompleteRegistration = useCallback(() => {
    track('CompleteRegistration');
  }, [track]);

  const trackAddToWishlist = useCallback((contentName, value, currency = 'BDT') => {
    track('AddToWishlist', {
      content_name: contentName,
      value: parseFloat(value) || 0,
      currency
    });
  }, [track]);

  return {
    track,
    trackPageView,
    trackSearch,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase,
    trackLead,
    trackCompleteRegistration,
    trackAddToWishlist
  };
};
