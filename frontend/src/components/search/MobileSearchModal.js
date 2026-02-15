import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    FiSearch, FiMapPin, FiCalendar, FiUsers, FiX, FiCheck, FiMinus, FiPlus,
    FiChevronLeft, FiWifi, FiHome, FiBriefcase, FiGrid, FiSun, FiTv, FiCoffee, FiDroplet, FiShield, FiEye
} from 'react-icons/fi';
import api from '../../utils/api';

const MobileSearchModal = ({ isOpen, onClose, filters, onSearch }) => {
    const navigate = useNavigate();
    const [mobileSearchStep, setMobileSearchStep] = useState('location'); // 'location', 'dates', 'guests'
    const [activePropertyType, setActivePropertyType] = useState(filters.property_type || 'room');
    const [airportList, setAirportList] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const locationInputRef = useRef(null);

    // Initialize search data from filters
    const [searchData, setSearchData] = useState({
        location: filters.city || '',
        checkIn: filters.check_in_date ? new Date(filters.check_in_date) : null,
        checkOut: filters.check_out_date ? new Date(filters.check_out_date) : null,
        guests: filters.min_guests ? parseInt(filters.min_guests) : 1,
        // Flight specific placeholders if needed
        from: '',
        to: '',
        tripType: 'oneWay'
    });

    useEffect(() => {
        if (isOpen) {
            setSearchData({
                location: filters.city || '',
                checkIn: filters.check_in_date ? new Date(filters.check_in_date) : null,
                checkOut: filters.check_out_date ? new Date(filters.check_out_date) : null,
                guests: filters.min_guests ? parseInt(filters.min_guests) : 1,
                from: '',
                to: '',
                tripType: 'oneWay'
            });
            setActivePropertyType(filters.property_type || 'room');
            setMobileSearchStep('location');
        }
    }, [isOpen, filters]);

    // Fetch airport list for mobile flight search
    useEffect(() => {
        fetch('/data/airportlist.json')
            .then(res => res.json())
            .then(data => {
                setAirportList(Object.values(data));
            })
            .catch(err => console.error('Failed to load airports:', err));
    }, []);

    // Fetch property types
    const { data: propertyTypes } = useQuery(
        'property-types-modal',
        () => api.get('/properties/property-types/list'),
        {
            select: (response) => (response.data?.data?.propertyTypes || []).filter(pt => pt.is_active !== false),
        }
    );

    // Fetch distinct property locations for suggestions
    const { data: locationSuggestionsData } = useQuery(
        'property-locations-modal',
        () => api.get('/properties/locations/list'),
        {
            select: (response) => response.data?.data?.locations || [],
        }
    );

    const getAirportSuggestions = (input) => {
        if (!input || typeof input !== 'string' || input.length < 2) return [];
        const lower = input.toLowerCase();
        return airportList.filter(a => {
            if (!a) return false;
            const combined = `${a.shortName} (${a.code})`.toLowerCase();
            return (
                (a.code && a.code.toLowerCase().includes(lower)) ||
                (a.name && a.name.toLowerCase().includes(lower)) ||
                (a.shortName && a.shortName.toLowerCase().includes(lower)) ||
                combined.includes(lower)
            );
        }).slice(0, 10);
    };

    const formatDateLocal = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDateRangeDisplay = () => {
        if (searchData.checkIn && searchData.checkOut) {
            const start = searchData.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = searchData.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${start} - ${end}`;
        } else if (searchData.checkIn) {
            return searchData.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return null;
    };

    const getTypeIcon = (typeName, isActive) => {
        const normalized = (typeName || '').toLowerCase();
        let Icon = FiHome;
        if (normalized.includes('apartment')) Icon = FiGrid;
        else if (normalized.includes('hotel')) Icon = FiBriefcase;
        else if (normalized.includes('villa')) Icon = FiHome;

        // Use img for consistency if available, otherwise Icon
        // Replicating Home.js logic which uses images primarily
        let imgSrc = '/images/nav-icon-room.png';
        if (normalized.includes('apartment')) imgSrc = '/images/nav-icon-apartment.png';
        else if (normalized.includes('hotel')) imgSrc = '/images/nav-icon-hotel.png';
        else if (normalized.includes('flight')) imgSrc = '/images/flight.png';

        return (
            <img
                src={imgSrc}
                alt={typeName}
                className={`w-5 h-5 object-contain transition-all duration-300 ${isActive
                    ? 'opacity-100 grayscale-0'
                    : 'opacity-70 grayscale'
                    }`}
            />
        );
    };

    const handleSearchClick = () => {
        // If Flight tab is selected (though usually Flight has its own page and search), handle navigation
        if (activePropertyType === 'flight') {
            navigate('/search?property_type=flight');
            onClose();
            return;
        }

        const params = {
            city: searchData.location,
            check_in_date: formatDateLocal(searchData.checkIn),
            check_out_date: formatDateLocal(searchData.checkOut),
            min_guests: searchData.guests,
            property_type: activePropertyType
        };
        onSearch(params);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="md:hidden fixed inset-0 bg-[#F7F7F7] z-[5000] flex flex-col">
            {/* Header */}
            <div className="bg-white relative px-4 py-2 border-b border-gray-200 sticky top-0 z-20">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 -mr-2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors z-10"
                >
                    <FiX className="w-4 h-4 text-black" />
                </button>

                {/* Property Type Tabs */}
                <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide px-10 w-full">
                    {propertyTypes && propertyTypes.map((type) => {
                        const isActive = activePropertyType === (type.name || '').toLowerCase();
                        return (
                            <button
                                key={type.id}
                                onClick={() => setActivePropertyType((type.name || '').toLowerCase())}
                                className="flex flex-col items-center gap-2 min-w-[64px] flex-shrink-0 group cursor-pointer"
                            >
                                <div className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>
                                    {getTypeIcon(type.name, isActive)}
                                </div>
                                <span className={`text-xs font-semibold whitespace-nowrap pb-2 border-b-2 transition-all duration-200 ${isActive ? 'text-black border-black' : 'text-gray-500 border-transparent group-hover:text-gray-800'
                                    }`}>
                                    {type.name}
                                </span>
                            </button>
                        );
                    })}

                    {/* Manual Flight Tab - Moved to End */}
                    <button
                        onClick={() => setActivePropertyType('flight')}
                        className="flex flex-col items-center gap-2 min-w-[64px] flex-shrink-0 group cursor-pointer"
                    >
                        <div className={`transition-opacity duration-200 ${activePropertyType === 'flight' ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                            <img src="/images/flight.png" alt="Flight" className={`w-5 h-5 object-contain transition-all duration-300 ${activePropertyType === 'flight' ? 'grayscale-0' : 'grayscale'}`} />
                        </div>
                        <span className={`text-xs font-semibold whitespace-nowrap pb-2 border-b-2 transition-all duration-200 ${activePropertyType === 'flight' ? 'text-black border-black' : 'text-gray-500 border-transparent group-hover:text-gray-900 group-hover:border-gray-300'}`}>
                            Flight
                        </span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-4">
                {/* Where / From-To Card */}
                <div
                    className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'location' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                    onClick={() => setMobileSearchStep('location')}
                >
                    {activePropertyType === 'flight' ? (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-gray-600 mb-4">Switching to Flight Search...</p>
                            <button onClick={() => navigate('/search?property_type=flight')} className="btn-primary">
                                Go to Flight Search
                            </button>
                        </div>
                    ) : (
                        // Standard Stay Search
                        mobileSearchStep === 'location' ? (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-bold text-black mb-4">Where to?</h3>
                                <div className="bg-white border rounded-xl p-3 flex items-center gap-3 shadow-sm mb-4">
                                    <FiSearch className="text-black w-5 h-5 font-bold" />
                                    <input
                                        autoFocus
                                        ref={locationInputRef}
                                        className="flex-1 outline-none text-base placeholder-gray-500 font-semibold bg-transparent text-black"
                                        placeholder="Search destinations"
                                        value={searchData.location || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSearchData(prev => ({ ...prev, location: val }));
                                            setShowLocationSuggestions(val.length > 0);
                                        }}
                                    />
                                    {(searchData.location) && (
                                        <button onClick={(e) => { e.stopPropagation(); setSearchData(prev => ({ ...prev, location: '' })); }} className="p-1 bg-gray-200 rounded-full"><FiX className="w-3 h-3 block" /></button>
                                    )}
                                </div>

                                {/* Suggestions */}
                                {locationSuggestionsData && locationSuggestionsData.length > 0 && (
                                    <div className="mt-2 pl-2">
                                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Suggested destinations</div>
                                        <div className="space-y-4">
                                            <button className="flex items-center gap-4 w-full text-left" onClick={(e) => { e.stopPropagation(); setSearchData(prev => ({ ...prev, location: 'Nearby' })); setMobileSearchStep('dates'); }}>
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><FiMapPin className="w-5 h-5" /></div>
                                                <div className="font-semibold text-gray-700">Nearby</div>
                                            </button>
                                            {locationSuggestionsData.slice(0, 5).map((loc, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSearchData(prev => ({ ...prev, location: loc.city }));
                                                        setMobileSearchStep('dates');
                                                    }}
                                                    className="flex items-center gap-4 w-full text-left"
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FiMapPin className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{loc.city}</div>
                                                        <div className="text-sm text-gray-500">{loc.country}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-semibold">Where</span>
                                <span className="text-black font-bold">{searchData.location || 'I\'m flexible'}</span>
                            </div>
                        )
                    )}
                </div>

                {/* When Card */}
                {activePropertyType !== 'flight' && (
                    <div
                        className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'dates' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                        onClick={() => setMobileSearchStep('dates')}
                    >
                        {mobileSearchStep === 'dates' ? (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-bold text-black mb-4">When's your trip?</h3>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <DatePicker
                                        selected={searchData.checkIn}
                                        onChange={(dates) => {
                                            const [start, end] = dates;
                                            setSearchData(prev => ({ ...prev, checkIn: start, checkOut: end }));
                                            if (end) {
                                                setTimeout(() => setMobileSearchStep('guests'), 300);
                                            }
                                        }}
                                        startDate={searchData.checkIn}
                                        endDate={searchData.checkOut}
                                        selectsRange
                                        minDate={new Date()}
                                        inline
                                        monthsShown={1}
                                        calendarClassName="mobile-date-picker-calendar w-full"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold text-sm">When</span>
                                <span className="text-black font-bold text-sm">{getDateRangeDisplay() || 'Add dates'}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Who Card */}
                {activePropertyType !== 'flight' && (
                    <div
                        className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'guests' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                        onClick={() => setMobileSearchStep('guests')}
                    >
                        {mobileSearchStep === 'guests' ? (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-bold text-black mb-6">Who's coming?</h3>
                                <div className="space-y-6">
                                    {[
                                        { key: 'adults', label: 'Adults', subtitle: 'Ages 13 or above', min: 1 },
                                        { key: 'children', label: 'Children', subtitle: 'Ages 2 – 12', min: 0 },
                                        { key: 'infants', label: 'Infants', subtitle: 'Under 2', min: 0 },
                                        { key: 'pets', label: 'Pets', subtitle: 'Bringing a service animal?', min: 0 },
                                    ].map((item) => {
                                        const currentValue = item.key === 'adults' ? Math.max(1, searchData.guests || 1) : 0;
                                        // Note: We only simulate 'guests' count here since backend might aggregate
                                        // For now, simpler implementation mapping purely to 'guests' count
                                        return (
                                            <div key={item.key} className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-base font-semibold text-gray-900">{item.label}</div>
                                                    <div className="text-sm text-gray-500">{item.subtitle}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.key === 'adults') {
                                                                setSearchData(prev => ({ ...prev, guests: Math.max(1, (prev.guests || 1) - 1) }));
                                                            }
                                                        }}
                                                        className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center ${currentValue <= item.min ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}
                                                        disabled={currentValue <= item.min}
                                                    >
                                                        <FiMinus className="w-3 h-3" />
                                                    </button>
                                                    <span className="font-semibold text-base w-4 text-center">{currentValue}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (item.key === 'adults') {
                                                                setSearchData(prev => ({ ...prev, guests: (prev.guests || 1) + 1 }));
                                                            }
                                                        }}
                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black"
                                                    >
                                                        <FiPlus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold text-sm">Who</span>
                                <span className="text-black font-bold text-sm">{searchData.guests || 1} guests</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 flex justify-between items-center">
                <button
                    onClick={() => {
                        setSearchData({
                            location: '',
                            checkIn: null,
                            checkOut: null,
                            guests: 1,
                            from: '',
                            to: '',
                            tripType: 'oneWay'
                        });
                    }}
                    className="text-base font-semibold text-gray-900 underline"
                >
                    Clear all
                </button>
                <button
                    onClick={handleSearchClick}
                    className="bg-[#E41D57] text-white px-8 py-3 rounded-lg text-base font-bold flex items-center gap-2 hover:bg-[#D11A4F] transition-colors"
                >
                    <FiSearch className="w-5 h-5" />
                    Search
                </button>
            </div>
        </div>
    );
};

export default MobileSearchModal;
