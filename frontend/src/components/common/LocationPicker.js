import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
// Use a more robust way to set the default icon that doesn't rely on import path issues
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
}

function LocationMarker({ position, setPosition, onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            onLocationSelect(lat, lng);
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

const LocationPicker = ({ initialLat, initialLng, onLocationSelect, searchAddress }) => {
    // Default to Dhaka, Bangladesh coordinates
    const defaultCenter = [23.8103, 90.4125];

    const [position, setPosition] = useState(
        initialLat && initialLng
            ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
            : null
    );

    // Save previous address to prevent loop on initial load
    const prevSearchAddressRef = useRef(searchAddress);

    // Update internal state if props change significantly (optional, but good for edits)
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition({ lat: parseFloat(initialLat), lng: parseFloat(initialLng) });
        }
    }, [initialLat, initialLng]);

    // Auto-geocoding effect
    useEffect(() => {
        if (!searchAddress || searchAddress.length < 5) return;
        if (searchAddress === prevSearchAddressRef.current) return;

        prevSearchAddressRef.current = searchAddress;

        const timeoutId = setTimeout(async () => {
            try {
                // Optimize search string for OpenStreetMap by removing hyphens and generic keywords
                const cleanQuery = searchAddress
                    .replace(/-/g, ' ')
                    .replace(/\b(Division|District)\b/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleanQuery)}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const newLat = parseFloat(data[0].lat);
                    const newLng = parseFloat(data[0].lon);

                    setPosition({ lat: newLat, lng: newLng });
                    onLocationSelect(newLat, newLng);
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            }
        }, 1500); // 1.5s debounce to respect Nominatim limits

        return () => clearTimeout(timeoutId);
    }, [searchAddress, onLocationSelect]);

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
            <MapContainer
                center={position ? [position.lat, position.lng] : defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
                {position && <RecenterAutomatically lat={position.lat} lng={position.lng} />}
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
