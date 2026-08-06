import { useState, useEffect } from 'react';
import useGoogleMapsLoader from './useGoogleMapsLoader';
import useSettingsStore from '../store/settingsStore';

/**
 * Custom hook to handle Google Places Autocomplete predictions.
 *
 * @param {string} locationQuery - The raw string value from the input field
 * @param {string} activeType - The active search tab (e.g. 'flight', 'room', etc.)
 * @param {function} onSelect - Callback when a place prediction is selected. Receives ({ location, latitude, longitude })
 */
const useLocationAutocomplete = (locationQuery, activeType, onSelect) => {
  const { isLoaded: isMapsLoaded } = useGoogleMapsLoader();
  const { settings } = useSettingsStore();
  const placesEnabled = settings?.google_places_enabled !== false; // default true if not set
  const [placePredictions, setPlacePredictions] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce input to reduce Google API billing/requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(locationQuery || '');
    }, 150);
    return () => clearTimeout(handler);
  }, [locationQuery]);

  // Fetch predictions from Google Places (only if admin has enabled it)
  useEffect(() => {
    if (!placesEnabled) {
      setPlacePredictions([]);
      return;
    }
    if (!isMapsLoaded || !window.google || !window.google.maps || !window.google.maps.places) return;
    const query = debouncedQuery.trim();
    if (query.length < 2) {
      setPlacePredictions([]);
      return;
    }
    if (activeType === 'flight') return; // Flight search doesn't use Places

    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'bd' }, // Bangladesh only
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPlacePredictions(predictions);
        } else {
          setPlacePredictions([]);
        }
      }
    );
  }, [debouncedQuery, isMapsLoaded, activeType, placesEnabled]);

  // Handle place selection by geocoding details to lat/lng
  const handlePlaceSelect = (prediction) => {
    if (!window.google || !window.google.maps) return;

    // Call onSelect immediately with text representation and null coordinates first
    onSelect({
      location: prediction.description,
      latitude: null,
      longitude: null
    });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        onSelect({
          location: prediction.description,
          latitude: lat,
          longitude: lng
        });
      }
    });
  };

  return {
    placePredictions,
    isMapsLoaded,
    handlePlaceSelect
  };
};

export default useLocationAutocomplete;
