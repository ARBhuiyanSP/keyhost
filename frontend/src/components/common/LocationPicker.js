import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

import useSettingsStore from '../../store/settingsStore';

const LocationPicker = ({ initialLat, initialLng, onLocationSelect, searchAddress }) => {
    const { settings } = useSettingsStore();

    // Default to Dhaka, Bangladesh coordinates
    const defaultCenter = useMemo(() => ({ lat: 23.8103, lng: 90.4125 }), []);

    const [position, setPosition] = useState(
        initialLat && initialLng && !isNaN(parseFloat(initialLat)) && !isNaN(parseFloat(initialLng))
            ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
            : null
    );
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: settings?.google_maps_api_key || '',
        libraries: ['places'] // Needed for advanced geocoding tasks possibly in future
    });

    // Update internal state if props change significantly
    useEffect(() => {
        if (initialLat && initialLng && !isNaN(parseFloat(initialLat)) && !isNaN(parseFloat(initialLng))) {
            const newPos = { lat: parseFloat(initialLat), lng: parseFloat(initialLng) };
            setPosition(newPos);
            if (map) {
                map.panTo(newPos);
            }
        }
    }, [initialLat, initialLng, map]);

    // No more internal auto-geocoding needed. AddProperty and EditProperty handles precise Geocoding via the dropdown
    // Selection and passes down exact initialLat and initialLng coordinates immediately.

    const onMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    const onMarkerDragEnd = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
        if (position) {
            mapInstance.panTo(position);
        }
    }, [position]);

    const onUnmount = useCallback(function callback(mapInstance) {
        setMap(null);
    }, []);

    if (!isLoaded) return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center animate-pulse rounded-lg border border-gray-300">Loading Map...</div>;

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={position || defaultCenter}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
                options={{
                    disableDefaultUI: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true
                }}
            >
                {position && (
                    <MarkerF
                        position={position}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        animation={window.google?.maps?.Animation?.DROP}
                    />
                )}
            </GoogleMap>
        </div>
    );
};

export default LocationPicker;
