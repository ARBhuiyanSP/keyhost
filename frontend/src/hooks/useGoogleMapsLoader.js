import { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';

/**
 * Shared Google Maps + Places API loader hook.
 *
 * WHY we do NOT use @react-google-maps/api's useJsApiLoader here:
 *   useJsApiLoader calls the script immediately on first render. If settings
 *   haven't loaded yet the key is '' — Places API silently fails forever.
 *   This hook waits for a valid key and reuses any script already injected
 *   by @react-google-maps/api (PropertyMap uses useJsApiLoader with the same key).
 *
 * Usage:
 *   const { isLoaded } = useGoogleMapsLoader();
 */
const MANUAL_SCRIPT_ID = 'google-maps-places-manual';

const useGoogleMapsLoader = () => {
  const { settings } = useSettingsStore();

  const [isLoaded, setIsLoaded] = useState(
    !!(window.google && window.google.maps && window.google.maps.places)
  );
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Already loaded — nothing to do
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    const apiKey = settings?.google_maps_api_key;
    if (!apiKey) return; // Wait until settings are fetched

    // Reuse script already injected by @react-google-maps/api's useJsApiLoader (PropertyMap)
    const reactMapsScript = document.getElementById('google-map-script');
    if (reactMapsScript) {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return;
      }
      const onLoad = () => setIsLoaded(true);
      const onError = (err) => setLoadError(err);
      reactMapsScript.addEventListener('load', onLoad);
      reactMapsScript.addEventListener('error', onError);
      return () => {
        reactMapsScript.removeEventListener('load', onLoad);
        reactMapsScript.removeEventListener('error', onError);
      };
    }

    // Script tag already injected by another instance of this hook — check key match
    const existing = document.getElementById(MANUAL_SCRIPT_ID);
    if (existing) {
      if (!existing.src.includes(`key=${apiKey}`)) {
        console.log('Google Maps API Key changed, reloading script...');
        existing.remove();
        try {
          delete window.google;
        } catch (e) {
          window.google = undefined;
        }
        setIsLoaded(false);
      } else {
        const onLoad = () => setIsLoaded(true);
        const onError = (err) => setLoadError(err);
        existing.addEventListener('load', onLoad);
        existing.addEventListener('error', onError);
        return () => {
          existing.removeEventListener('load', onLoad);
          existing.removeEventListener('error', onError);
        };
      }
    }

    // First time (or after removal) — inject the script with the real key
    const script = document.createElement('script');
    script.id = MANUAL_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = (err) => {
      console.error('Google Maps Places script failed to load:', err);
      setLoadError(err);
    };
    document.head.appendChild(script);
  }, [settings?.google_maps_api_key]); // Re-run only when key becomes available

  return { isLoaded, loadError };
};

export default useGoogleMapsLoader;
