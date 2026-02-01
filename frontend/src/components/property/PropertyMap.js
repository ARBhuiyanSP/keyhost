import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const FitBounds = ({ properties, detailView }) => {
    const map = useMap();
    useEffect(() => {
        if (properties.length > 0) {
            // If detail view (single property), use specific zoom level (zoomed out)
            if (detailView && properties.length === 1) {
                const p = properties[0];
                map.setView([parseFloat(p.latitude), parseFloat(p.longitude)], 14); // Zoom level 14 for neighborhood view
                return;
            }

            const bounds = L.latLngBounds(properties.map(p => [
                parseFloat(p.latitude),
                parseFloat(p.longitude)
            ]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [properties, map, detailView]);
    return null;
}

const PropertyMap = ({ properties, hoveredPropertyId, onMarkerClick, onMarkerHover, detailView = false }) => {
    const navigate = useNavigate();
    const defaultCenter = [23.8103, 90.4125];

    // Filter properties with valid lat/lng
    const validProperties = properties.filter(p => p.latitude && p.longitude);

    const createCustomIcon = (price, isHovered) => {
        if (detailView) {
            return L.divIcon({
                className: 'custom-map-marker-detail',
                html: `<div style="
                    background-color: #222222;
                    color: white;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                    transform: translate(-50%, -50%); /* Center centered on coordinate */
                    position: absolute;
                    top: 0;
                    left: 0;
                ">
                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>`,
                iconSize: null,
                iconAnchor: [0, 0]
            });
        }

        return L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="
                background-color: ${isHovered ? '#222222' : 'white'};
                color: ${isHovered ? 'white' : '#222222'};
                padding: 6px 12px;
                border-radius: 9999px; /* Pill shape */
                font-weight: 800;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                font-size: 14px;
                text-align: center;
                white-space: nowrap;
                transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
                transform: translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : 'scale(1)'};
                position: absolute;
                top: 0;
                left: 0;
                z-index: ${isHovered ? 1000 : 1};
                width: max-content;
            ">৳${price}</div>`,
            iconSize: null, // Allow auto-sizing via CSS/HTML content
            iconAnchor: [0, 0] // Anchor at the coordinate, content is centered via transform
        });
    };

    return (
        <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validProperties.length > 0 && <FitBounds properties={validProperties} detailView={detailView} />}

            {validProperties.map(property => {
                const isHovered = hoveredPropertyId === property.id;

                return (
                    <Marker
                        key={property.id}
                        position={[parseFloat(property.latitude), parseFloat(property.longitude)]}
                        icon={createCustomIcon(property.base_price, isHovered)}
                        interactive={!detailView}
                        eventHandlers={!detailView ? {
                            click: () => onMarkerClick && onMarkerClick(property.id),
                            mouseover: () => onMarkerHover && onMarkerHover(property.id),
                            mouseout: () => onMarkerHover && onMarkerHover(null)
                        } : {}}
                    >
                        {!detailView && (
                            <Popup closeButton={true} offset={[0, -10]} maxWidth={240} minWidth={240} className="rounded-xl overflow-hidden shadow-xl border-none">
                                <div className="cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                                    <div className="aspect-[4/3] w-full bg-gray-200 relative mb-2 rounded-t-xl overflow-hidden">
                                        {property.main_image ? (
                                            <img src={property.main_image.image_url} alt={property.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                            Guest Favorite
                                        </div>
                                    </div>
                                    <div className="px-1 pb-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className="font-semibold text-sm text-gray-900 truncate pr-2">{property.title}</h3>
                                            <div className="flex items-center text-xs font-medium">
                                                <FiStar className="text-black w-3 h-3 mr-0.5 fill-current" />
                                                {property.average_rating || 'New'}
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-bold text-black">৳{property.base_price}</span>
                                            <span className="text-gray-500 text-xs font-normal">night</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                )
            })}
        </MapContainer>
    );
};

export default PropertyMap;
