import React, { useState, useEffect } from 'react';
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

const LocationPicker = ({ initialLat, initialLng, onLocationSelect }) => {
    // Default to Dhaka, Bangladesh coordinates
    const defaultCenter = [23.8103, 90.4125];

    const [position, setPosition] = useState(
        initialLat && initialLng
            ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
            : null
    );

    // Update internal state if props change significantly (optional, but good for edits)
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition({ lat: parseFloat(initialLat), lng: parseFloat(initialLng) });
        }
    }, [initialLat, initialLng]);

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
