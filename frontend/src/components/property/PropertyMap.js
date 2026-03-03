import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Marker } from '@react-google-maps/api';
import { FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../../store/settingsStore';

const PropertyMap = ({ properties, hoveredPropertyId, onMarkerClick, onMarkerHover, detailView = false }) => {
    const navigate = useNavigate();
    const { settings } = useSettingsStore();
    const defaultCenter = useMemo(() => ({ lat: 23.8103, lng: 90.4125 }), []);

    // For popup
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: settings?.google_maps_api_key || '', // Gets the dynamic key from admin settings
    });

    // Filter properties with valid lat/lng and map to numbers
    const validProperties = useMemo(() => properties
        .filter(p => !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude)))
        .map(p => ({
            ...p,
            lat: parseFloat(p.latitude),
            lng: parseFloat(p.longitude)
        })), [properties]);

    const onLoad = useCallback(function callback(mapInstance) {
        if (validProperties.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            validProperties.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));

            if (detailView && validProperties.length === 1) {
                mapInstance.setCenter({ lat: validProperties[0].lat, lng: validProperties[0].lng });
                mapInstance.setZoom(14);
            } else {
                mapInstance.fitBounds(bounds);
                // Add small padding effect by adjusting after bounds
                window.google.maps.event.addListenerOnce(mapInstance, "bounds_changed", () => {
                    // Ensure we don't zoom in too much for few properties
                    if (mapInstance.getZoom() > 16) mapInstance.setZoom(16);
                });
            }
        } else {
            mapInstance.setCenter(defaultCenter);
            mapInstance.setZoom(13);
        }
        setMap(mapInstance);
    }, [validProperties, detailView, defaultCenter]);

    const onUnmount = useCallback(function callback(mapInstance) {
        setMap(null);
    }, []);
    // Custom overlay content for the marker, replicating what we had
    const renderMarkerContent = (property, isHovered) => {
        if (detailView) {
            return (
                <div style={{
                    backgroundColor: '#222222', color: 'white', width: '48px', height: '48px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)', position: 'absolute', transform: 'translate(-50%, -50%)',
                    cursor: 'default'
                }}>
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
            );
        }

        return (
            <div
                style={{
                    backgroundColor: isHovered ? '#222222' : 'white',
                    color: isHovered ? 'white' : '#222222',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontWeight: '800',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                    fontSize: '14px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                    transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                    position: 'absolute',
                    zIndex: isHovered ? 1000 : 1,
                    cursor: 'pointer'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!detailView) {
                        setSelectedProperty(property);
                        if (onMarkerClick) onMarkerClick(property.id);
                    }
                }}
                onMouseEnter={() => !detailView && onMarkerHover && onMarkerHover(property.id)}
                onMouseLeave={() => !detailView && onMarkerHover && onMarkerHover(null)}
            >
                ৳{Math.floor(Number(property.base_price))}
            </div>
        );
    };

    if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>;

    const mapOptions = {
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy", // Allow 1-finger scroll on mobile like simple maps
    };

    return (
        <div className="w-full h-full relative">
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                onClick={() => setSelectedProperty(null)}
            >
                {validProperties.map(property => {
                    const isHovered = hoveredPropertyId === property.id;
                    const position = { lat: property.lat, lng: property.lng };

                    return (
                        <OverlayView
                            key={property.id}
                            position={position}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            {renderMarkerContent(property, isHovered)}
                        </OverlayView>
                    )
                })}

                {/* Info Window Replacement / Custom Popup */}
                {selectedProperty && !detailView && (
                    <OverlayView
                        position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                        mapPaneName={OverlayView.FLOAT_PANE}
                        getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height + 30) })}
                    >
                        <div
                            className="bg-white rounded-xl overflow-hidden shadow-xl"
                            style={{ width: '240px', position: 'absolute' }}
                        >
                            <div className="cursor-pointer relative" onClick={() => navigate(`/property/${selectedProperty.id}`)}>
                                {/* Close button */}
                                <button
                                    className="absolute top-2 right-2 z-10 bg-white/50 hover:bg-white rounded-full p-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProperty(null);
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>

                                <div className="aspect-[4/3] w-full bg-gray-200 relative mb-2 rounded-t-xl overflow-hidden">
                                    {selectedProperty.main_image ? (
                                        <img src={selectedProperty.main_image.image_url} alt={selectedProperty.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                        Guest Favorite
                                    </div>
                                </div>
                                <div className="px-3 pb-3">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-semibold text-sm text-gray-900 truncate pr-2">{selectedProperty.title}</h3>
                                        <div className="flex items-center text-xs font-medium">
                                            <FiStar className="text-black w-3 h-3 mr-0.5 fill-current" />
                                            {selectedProperty.average_rating || 'New'}
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold text-black">৳{Math.floor(Number(selectedProperty.base_price))}</span>
                                        <span className="text-gray-500 text-xs font-normal">night</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </OverlayView>
                )}

            </GoogleMap>
        </div>
    );
};

export default PropertyMap;
