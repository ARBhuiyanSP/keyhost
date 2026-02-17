import React, { useState, useEffect, useMemo } from 'react';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { FiChevronDown, FiSun, FiMoon, FiLoader, FiX, FiEdit2, FiSearch } from 'react-icons/fi'; // Added FiEdit2 for Modify Search
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchSabre, searchAmadeus, initiateSearch } from '../../utils/flightApi';
import { format } from 'date-fns';
import FlightSearchForm from './FlightSearchForm';
import { DUMMY_FLIGHTS } from '../../utils/dummyFlights';

const FlightSearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Initially false to hide "No Flights" message
    const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed
    const [results, setResults] = useState([]);
    const [searchId, setSearchId] = useState(null);
    const [error, setError] = useState(null);
    const [providersStatus, setProvidersStatus] = useState({ amadeus: 'pending', sabre: 'pending' });
    const [rawResponses, setRawResponses] = useState({ amadeus: null, sabre: null });
    const [searchStatus, setSearchStatus] = useState('Idle');

    // Collapsible Search State
    const [isSearchExpanded, setIsSearchExpanded] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Side Filter States
    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const [selectedStops, setSelectedStops] = useState([]);
    const [selectedDepartureTimes, setSelectedDepartureTimes] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);

    // Collapsible Filter Sections State
    const [expandedSections, setExpandedSections] = useState({
        airlines: false,
        stops: false,
        price: false,
        departure: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Auto-expand filters when results are loaded
    useEffect(() => {
        if (results.length > 0) {
            setExpandedSections({
                airlines: true,
                stops: true,
                price: true,
                departure: true
            });
        }
    }, [results]);

    // Flight Details Modal State
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [activeTab, setActiveTab] = useState('flight_details');

    const handleSearch = (newParams) => {
        // Ensure we stay on a flight results related path
        const path = window.location.pathname.includes('/flight/results') ? '/flight/results' : '/search';
        setSearchParams({ ...newParams, property_type: 'flight' });
        setIsSearchExpanded(false);
    };

    useEffect(() => {
        const currentParams = Object.fromEntries([...searchParams]);

        // Helper to extract IATA code
        const extractCode = (val) => {
            if (!val) return '';
            const match = val.match(/\((.*?)\)/);
            return match ? match[1] : val;
        };

        const safeFormat = (dateStr, fmt) => {
            if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return null;
                return format(date, fmt);
            } catch (e) {
                return null;
            }
        };

        const startSearch = async () => {
            console.log('startSearch triggered with params:', currentParams);
            setSearchStatus('Starting...');

            // Relax parameter check to allow hitting API for debugging/error visibility
            if (!currentParams.trip_type && !currentParams.from && !currentParams.to) {
                console.log('Search skipped: no params provided at all');
                setSearchStatus('Skipped: No Params');
                setLoading(false);
                return;
            }

            setLoading(true);
            setHasSearched(true);
            setError(null);
            setResults([]);
            setProvidersStatus({ amadeus: 'pending', sabre: 'pending' });

            if (Object.keys(currentParams).length > 0) setIsSearchExpanded(false);

            try {
                const tripType = currentParams.trip_type === 'roundTrip' ? 'round_trip' :
                    currentParams.trip_type === 'multiCity' ? 'multi_city' : 'one_way';

                let apiParams = { tripType };

                if (tripType === 'multi_city') {
                    try {
                        const segments = JSON.parse(currentParams.segments || '[]');
                        apiParams['departure'] = segments.map(s => extractCode(s.from));
                        apiParams['destination'] = segments.map(s => extractCode(s.to));
                        apiParams['departure_date'] = segments.map(s => safeFormat(s.depart, 'dd MMM yy') || '');
                        apiParams['ADT'] = parseInt(currentParams.adults) || 1;
                        apiParams['C07'] = parseInt(currentParams.children) || 0;
                        apiParams['C03'] = parseInt(currentParams.kids) || 0;
                        apiParams['INF'] = parseInt(currentParams.infants) || 0;
                    } catch (e) {
                        console.error('Error parsing multi-city segments:', e);
                    }
                } else {
                    apiParams['departure_one_round'] = extractCode(currentParams.from);
                    apiParams['destination_one_round'] = extractCode(currentParams.to);
                    apiParams['depart_date'] = safeFormat(currentParams.depart, 'dd MMM yy') || format(new Date(), 'dd MMM yy');
                    apiParams['return_date'] = safeFormat(currentParams.return, 'dd MMM yy');
                    apiParams['ADTs'] = parseInt(currentParams.adults) || 1;
                    apiParams['C07s'] = parseInt(currentParams.children) || 0;
                    apiParams['C03s'] = parseInt(currentParams.kids) || 0;
                    apiParams['INFs'] = parseInt(currentParams.infants) || 0;
                }

                apiParams['fare_type'] = 'Public';
                apiParams['classOfService'] = currentParams.class || '';

                console.log('Initiating Search with Aerotake Params:', apiParams);

                // 1. Initiate Search to get a single folder ID
                const initResponse = await initiateSearch(apiParams);
                const searchId = initResponse.folder || initResponse.search_id;
                console.log('Search Initiated. ID:', searchId);
                setSearchId(searchId); // Store for potential polling/reference

                // Add search_id to params for providers
                const providerParams = { ...apiParams, search_id: searchId };

                const amadeusPromise = searchAmadeus(providerParams)
                    .then(res => {
                        console.log('Amadeus Success:', res);
                        setRawResponses(prev => ({ ...prev, amadeus: res }));
                        if (res.data) setResults(prev => [...prev, ...res.data]);
                        setProvidersStatus(prev => ({ ...prev, amadeus: 'success' }));
                        setLoading(false); // Hide loader as soon as we get some results
                    })
                    .catch(err => {
                        console.error('Amadeus error:', err);
                        setRawResponses(prev => ({ ...prev, amadeus: err.response?.data || err.message }));
                        setProvidersStatus(prev => ({ ...prev, amadeus: 'error' }));
                    });

                const sabrePromise = searchSabre(providerParams)
                    .then(res => {
                        console.log('Sabre Success:', res);
                        setRawResponses(prev => ({ ...prev, sabre: res }));
                        if (res.data) setResults(prev => [...prev, ...res.data]);
                        setProvidersStatus(prev => ({ ...prev, sabre: 'success' }));
                        setLoading(false); // Hide loader as soon as we get some results
                    })
                    .catch(err => {
                        console.error('Sabre error:', err);
                        setRawResponses(prev => ({ ...prev, sabre: err.response?.data || err.message }));
                        setProvidersStatus(prev => ({ ...prev, sabre: 'error' }));
                    });

                // Inform the status tracker that we are waiting for both
                Promise.allSettled([amadeusPromise, sabrePromise]).then((results) => {
                    console.log('All search providers settled:', results);
                    setSearchStatus('Completed');
                    setLoading(false); // Ensure loader is off even if both fail
                });

            } catch (err) {
                console.error('Search initiation error:', err);
                setSearchStatus(`Error: ${err.message}`);
                setError(err.message || 'Failed to start flight search');
                setLoading(false);
            }
        };

        if (Object.keys(currentParams).length > 0) {
            startSearch();
        }
    }, [searchParams]);

    // Derived data for filters
    const availableAirlines = useMemo(() => Array.from(new Set(results.map(r => r.airlineName))).sort(), [results]);
    const minPrice = results.length > 0 ? Math.min(...results.map(r => r.fare.totalPrice)) : 0;
    const maxPrice = results.length > 0 ? Math.max(...results.map(r => r.fare.totalPrice)) : 100000;

    useEffect(() => {
        if (results.length > 0) {
            setPriceRange([minPrice, maxPrice]);
        }
    }, [results, minPrice, maxPrice]);

    const uniqueResults = useMemo(() => {
        const flightsBySignature = new Map();
        results.forEach(flight => {
            try {
                const legs = Object.values(flight.legs);
                if (legs.length === 0) return;
                const firstLeg = legs[0];
                const lastLeg = legs[legs.length - 1];
                const stops = legs.map(l => l.stopovers?.length || 0).join('-');
                const signature = [
                    flight.airlineName,
                    firstLeg.departure.airport,
                    firstLeg.departure.time,
                    lastLeg.arrival.airport,
                    lastLeg.arrival.time,
                    stops
                ].join('|');
                const existing = flightsBySignature.get(signature);
                if (!existing || flight.fare.totalPrice < existing.fare.totalPrice) {
                    flightsBySignature.set(signature, flight);
                }
            } catch (e) { }
        });
        return Array.from(flightsBySignature.values()).sort((a, b) => a.fare.totalPrice - b.fare.totalPrice);
    }, [results]);

    const filteredResults = useMemo(() => uniqueResults.filter(flight => {
        const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airlineName);
        const firstLegKey = Object.keys(flight.legs)[0];
        const stopCount = flight.legs[firstLegKey].stopovers?.length || 0;
        const stopLabel = stopCount === 0 ? 'Non-Stop' : stopCount === 1 ? '1 Stop' : '2 Stops or more';
        const matchesStops = selectedStops.length === 0 || selectedStops.includes(stopLabel);

        // Departure Time Filter Logic
        let matchesDepartureTime = true;
        if (selectedDepartureTimes.length > 0) {
            const depHour = parseInt(flight.legs[firstLegKey].departure.time.split(':')[0]);
            matchesDepartureTime = selectedDepartureTimes.some(range => {
                if (range === '00-06') return depHour >= 0 && depHour < 6;
                if (range === '06-12') return depHour >= 6 && depHour < 12;
                if (range === '12-18') return depHour >= 12 && depHour < 18;
                if (range === '18-00') return depHour >= 18 && depHour <= 23; // Adjusted for 24h
                return false;
            });
        }

        const matchesPrice = flight.fare.totalPrice >= priceRange[0] && flight.fare.totalPrice <= priceRange[1];
        return matchesAirline && matchesStops && matchesDepartureTime && matchesPrice;
    }), [uniqueResults, selectedAirlines, selectedStops, selectedDepartureTimes, priceRange]);

    const toggleFilter = (list, setList, item) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const FilterSection = ({ title, children, isOpen, onToggle }) => {
        return (
            <div className="border-b border-gray-100 py-4 last:border-0">
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={onToggle}>
                    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                    <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && <div>{children}</div>}
            </div>
        );
    };

    // Calculate Summary Text for Collapsed State
    const searchSummary = useMemo(() => {
        const p = Object.fromEntries([...searchParams]);
        if (!p.from && !p.to) return "Search Flights";
        const from = p.from ? p.from.split('(')[0] : 'Origin';
        const to = p.to ? p.to.split('(')[0] : 'Dest';
        const date = p.depart ? format(new Date(p.depart), 'dd MMM') : '';
        return `${from} to ${to}, ${date} • ${parseInt(p.adults || 1) + parseInt(p.children || 0) + parseInt(p.kids || 0) + parseInt(p.infants || 0)} Travelers`;
    }, [searchParams]);

    const SkeletonLoader = () => (
        <div className="animate-pulse space-y-4 w-full">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Skeleton */}
                <div className="hidden lg:block w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="mb-6">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 space-y-4">
                    <div className="text-center py-10">
                        <h3 className="text-[#1e2049] font-bold text-xl mb-2">Hang tight! We're finding the best flight options for you.</h3>
                    </div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-6">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="w-24 h-10 bg-gray-200 rounded-lg hidden md:block"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-12 font-sans relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                <div className="flex flex-col lg:flex-row gap-6">
                    {loading ? (
                        <SkeletonLoader />
                    ) : (
                        <>
                            {/* Mobile Filter Button */}
                            <div className="lg:hidden flex justify-end mb-4">
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="flex items-center gap-2 bg-[#E41D57] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-[#c01b4b] transition-colors"
                                >
                                    <span className="text-sm">Filter</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                </button>
                            </div>

                            {/* Mobile Filter Overlay Background */}
                            {isMobileFilterOpen && (
                                <div
                                    className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                ></div>
                            )}

                            {/* Sidebar Filters */}
                            <div className={`
                                w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit flex-shrink-0 
                                fixed lg:sticky inset-0 lg:top-24 z-[100] lg:z-auto overflow-y-auto lg:overflow-visible transition-transform duration-300
                                ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                                lg:block
                            `}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                setSelectedAirlines([]);
                                                setSelectedStops([]);
                                                setSelectedDepartureTimes([]); // Clear this too
                                                setPriceRange([minPrice, maxPrice]);
                                            }}
                                            className="text-xs text-[#E41D57] font-medium"
                                        >
                                            Reset
                                        </button>

                                        {/* Mobile Close Button */}
                                        <button
                                            onClick={() => setIsMobileFilterOpen(false)}
                                            className="lg:hidden p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <FiX className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Airlines */}
                                <FilterSection
                                    title="Airlines"
                                    isOpen={expandedSections.airlines}
                                    onToggle={() => toggleSection('airlines')}
                                >
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {results.length > 0 ? (
                                            availableAirlines.map((airline, idx) => {
                                                // Find flight data that matches this airline name
                                                const matchingFlight = results.find(r => r.airlineName === airline);
                                                const airlineLogoUrl = matchingFlight?.airlineLogo || '';

                                                return (
                                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={selectedAirlines.includes(airline)}
                                                            onChange={() => toggleFilter(selectedAirlines, setSelectedAirlines, airline)}
                                                        />
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAirlines.includes(airline) ? 'bg-[#E41D57] border-[#E41D57] text-white' : 'border-gray-300 bg-white'}`}>
                                                            {selectedAirlines.includes(airline) && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <img
                                                                src={airlineLogoUrl}
                                                                alt={airline}
                                                                className="w-6 h-6 object-contain"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">{airline}</span>
                                                        </div>
                                                    </label>
                                                )
                                            })
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No airlines found</p>
                                        )}
                                    </div>
                                </FilterSection>

                                {/* Stops (Blank if no results) */}
                                <FilterSection
                                    title="Stops"
                                    isOpen={expandedSections.stops}
                                    onToggle={() => toggleSection('stops')}
                                >
                                    <div className="space-y-2">
                                        {results.length > 0 ? (
                                            ['Non-Stop', '1 Stop', '2 Stops or more'].map((stop, idx) => (
                                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedStops.includes(stop)}
                                                        onChange={() => toggleFilter(selectedStops, setSelectedStops, stop)}
                                                    />
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStops.includes(stop) ? 'bg-[#E41D57] border-[#E41D57] text-white' : 'border-gray-300 bg-white'}`}>
                                                        {selectedStops.includes(stop) && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{stop}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <div className="py-2 text-xs text-transparent select-none">-</div> // Blank placeholder
                                        )}
                                    </div>
                                </FilterSection>

                                {/* Price Range (Blank if no results) */}
                                <FilterSection
                                    title="Price Range"
                                    isOpen={expandedSections.price}
                                    onToggle={() => toggleSection('price')}
                                >
                                    {results.length > 0 ? (
                                        <>
                                            <div className="px-2 mb-4">
                                                <input
                                                    type="range"
                                                    min={minPrice}
                                                    max={maxPrice}
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                    className="w-full accent-[#E41D57]"
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs font-bold text-gray-900">
                                                <span>BDT {priceRange[0].toLocaleString()}</span>
                                                <span>BDT {priceRange[1].toLocaleString()}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-2 text-xs text-gray-400 italic">no price yet</div>
                                    )}
                                </FilterSection>

                                {/* Departure Time (Always shown for visual structure) */}
                                <FilterSection
                                    title="Departure Time"
                                    isOpen={expandedSections.departure}
                                    onToggle={() => toggleSection('departure')}
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        {['00-06', '06-12', '12-18', '18-00'].map((range, idx) => {
                                            const isActive = selectedDepartureTimes.includes(range);
                                            const icons = [<FiSun className="w-4 h-4 text-gray-400" />, <FiSun className="w-4 h-4 text-orange-400" />, <FiSun className="w-4 h-4 text-yellow-500" />, <FiMoon className="w-4 h-4 text-purple-600" />];
                                            return (
                                                <button
                                                    key={range}
                                                    onClick={() => toggleFilter(selectedDepartureTimes, setSelectedDepartureTimes, range)}
                                                    className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'border-[#E41D57] bg-[#E41D57]/5' : 'border-gray-200 hover:border-[#1e2049] hover:bg-blue-50'}`}
                                                >
                                                    {icons[idx]}
                                                    <span className={`text-[10px] ${isActive ? 'text-[#E41D57] font-bold' : 'text-gray-600'}`}>{range}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </FilterSection>

                                <div className="mt-6 lg:hidden">
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-full bg-[#E41D57] text-white font-bold py-3 rounded-xl shadow-lg"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1">
                                {/* Collapsible Search Header */}
                                <div className="mb-8">
                                    {isSearchExpanded ? (
                                        <div className="relative bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                                            <h1 className="text-lg font-normal text-[#1e2049] mb-6 text-center">Find your perfect flight</h1>
                                            <FlightSearchForm
                                                searchParams={Object.fromEntries([...searchParams])}
                                                onSearch={handleSearch}
                                            />
                                            {hasSearched && (
                                                <button
                                                    onClick={() => setIsSearchExpanded(false)}
                                                    className="absolute top-4 right-4 text-xs text-gray-500 hover:text-[#E41D57] underline"
                                                >
                                                    Hide Search
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsSearchExpanded(true)}>
                                            <div className="text-center w-full">
                                                <div className="font-bold text-[#1e2049] text-base">{searchSummary}</div>
                                                <div className="text-xs text-gray-500">Click to modify search</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* NO TABS - REMOVED AS REQUESTED */}

                                {/* Search Results List */}
                                <div className="space-y-4">
                                    {loading && (
                                        <div className="space-y-4">
                                            <LoadingSkeleton type="card" count={3} />
                                        </div>
                                    )}

                                    {!loading && hasSearched && filteredResults.length > 0 && filteredResults.map((flight, idx) => {
                                        const allLegs = Object.values(flight.legs || {});
                                        if (allLegs.length === 0) return null;
                                        const leg = allLegs[0];
                                        const firstSchedule = (leg.schedules || [])[0];

                                        return (
                                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                                                    {/* Airline Info */}
                                                    <div className="flex items-center gap-4 md:w-1/4">
                                                        <div className="w-12 h-12 flex items-center justify-center">
                                                            <img
                                                                src={flight.airlineLogo || "https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Novoair_logo.svg/1200px-Novoair_logo.svg.png"}
                                                                alt={flight.airlineName}
                                                                className="w-full object-contain"
                                                                onError={(e) => { e.target.src = "https://img.icons8.com/fluency/48/airplane-mode-on.png"; }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm">{flight.airlineName}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {firstSchedule?.carrier?.marketing}-{firstSchedule?.carrier?.marketingFlightNumber}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Legs Info */}
                                                    <div className="flex-1 flex flex-col gap-4 w-full md:w-auto">
                                                        {Object.values(flight.legs).map((leg, legIdx) => (
                                                            <div key={legIdx} className="flex items-center justify-center gap-2 md:gap-6 w-full">
                                                                <div className="text-right w-16 md:w-20">
                                                                    <div className="text-lg font-bold text-gray-900">
                                                                        {leg.departure.time.split(':').slice(0, 2).join(':')}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500 truncate">{leg.departure.airport}</div>
                                                                    <div className="text-[9px] text-gray-500 truncate">Flight: {leg.carrier?.departFlight}</div>
                                                                </div>
                                                                <div className="flex flex-col items-center w-24 md:w-32">
                                                                    <div className="text-[9px] text-gray-400 mb-1">{leg.formattedElapsedTime}</div>
                                                                    <div className="w-full h-px bg-gray-300 relative flex items-center justify-center">
                                                                        <div className="w-1.5 h-1.5 rounded-full border border-gray-300 bg-white absolute left-0"></div>
                                                                        <div className="bg-white px-1 z-10 text-[8px] text-gray-400 uppercase truncate max-w-full">
                                                                            {leg.stopovers?.length ? `${leg.stopovers.length} Stop` : "Non Stop"}
                                                                        </div>
                                                                        <div className="w-1.5 h-1.5 rounded-full border border-blue-500 bg-white absolute right-0"></div>
                                                                    </div>
                                                                    <div className="text-[8px] text-gray-400 mt-1">{leg.departure.formattedDate}</div>
                                                                </div>
                                                                <div className="text-left w-16 md:w-20">
                                                                    <div className="text-lg font-bold text-gray-900">
                                                                        {leg.arrival.time.split(':').slice(0, 2).join(':')}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500 truncate">{leg.arrival.airport}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Price & Action */}
                                                    <div className="flex flex-col items-end md:w-1/4 gap-2 w-full">
                                                        <div className="text-xs text-gray-500">Starting from</div>
                                                        <div className="text-xl font-bold text-[#1e2049]">BDT {flight.fare.totalPrice.toLocaleString()}</div>
                                                        <button
                                                            onClick={() => {
                                                                localStorage.setItem('bookingFlight', JSON.stringify(flight));
                                                                navigate('/booking');
                                                            }}
                                                            className="bg-[#E41D57] hover:bg-[#c01b4b] text-white font-bold py-2 px-6 rounded-full text-sm transition-colors w-full md:w-auto"
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Footer / Badges */}
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px]">{flight.gds?.[0].toUpperCase()}</div>
                                                            <span className="text-xs text-gray-600 uppercase">{flight.gds} Provider</span>
                                                        </div>
                                                        <div className="text-xs text-green-600 font-medium">{flight.refundStatus}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedFlight(flight)}
                                                        className="text-xs font-bold text-blue-600 hover:underline"
                                                    >
                                                        Flight Details
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {!loading && hasSearched && filteredResults.length === 0 && (
                                        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                                            <div className="text-6xl mb-4">✈️</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Flights Found</h3>
                                            <p className="text-gray-500">Try adjusting your search criteria or dates.</p>
                                        </div>
                                    )}

                                    {!hasSearched && (
                                        <div className="text-center py-20">
                                            {/* Empty State / Prompt - or just blank as requested */}
                                            {/* <div className="text-gray-400">Search for flights to see results</div> */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Flight Details Side Modal (Reused) */}
            {selectedFlight && (
                <div className="fixed inset-0 z-[1000] flex justify-end">
                    <style>{`
                        @keyframes slideInRight {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSelectedFlight(null)}
                    />
                    <div
                        className="relative w-full max-w-2xl bg-[#F8F9FA] h-full shadow-2xl overflow-y-auto flex flex-col"
                        style={{ animation: 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    >
                        <div className="bg-[#E41D57] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                            <div>
                                <h2 className="text-lg font-bold">Flight Details</h2>
                                <div className="text-xs opacity-90">{selectedFlight.airlineName} | {selectedFlight.flightType === 'one_way' ? 'One Way' : selectedFlight.flightType === 'round_trip' ? 'Round Trip' : 'Multi City'}</div>
                            </div>
                            <button
                                onClick={() => setSelectedFlight(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex bg-white border-b border-gray-200 sticky top-[72px] z-40">
                            {['flight_details', 'fare_summary'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors relative ${activeTab === tab
                                        ? 'text-[#E41D57]'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.replace('_', ' ')}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E41D57]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'flight_details' && (
                                <div className="space-y-6">
                                    {Object.values(selectedFlight.legs).map((leg, legIdx) => (
                                        <div key={legIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            {/* Leg Header */}
                                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                                <h3 className="text-[#1E2049] font-bold text-base flex items-center gap-2">
                                                    {leg.departure.airportShortName || leg.departure.airport} &rarr; {leg.arrival.airportShortName || leg.arrival.airport}
                                                    <span className="text-sm font-normal text-gray-500">({leg.departure.formattedDate})</span>
                                                </h3>
                                            </div>

                                            <div className="p-6 space-y-8">
                                                {leg.schedules.map((schedule, sIdx) => {
                                                    // Calculate layover if not the first segment
                                                    let layoverText = null;
                                                    if (sIdx > 0) {
                                                        const prevSchedule = leg.schedules[sIdx - 1];
                                                        try {
                                                            // Robust date parsing with fallbacks
                                                            const parseDate = (dObj) => {
                                                                if (dObj.dateTime) return new Date(dObj.dateTime.replace(' ', 'T'));
                                                                if (dObj.date && dObj.time) return new Date(`${dObj.date}T${dObj.time}`);
                                                                return null;
                                                            };

                                                            const arrival = parseDate(prevSchedule.arrival);
                                                            const departure = parseDate(schedule.departure);

                                                            if (arrival && departure && !isNaN(arrival.getTime()) && !isNaN(departure.getTime())) {
                                                                const diffMs = departure - arrival;
                                                                const diffHrs = Math.floor(diffMs / 3600000);
                                                                const diffMins = Math.round((diffMs % 3600000) / 60000);

                                                                if (diffMs > 0) {
                                                                    layoverText = `Transit at ${prevSchedule.arrival.airportShortName || prevSchedule.arrival.airport} — Duration: ${diffHrs}h ${diffMins}m`;
                                                                }
                                                            } else {
                                                                // Fallback for visual debugging if dates fail
                                                                console.warn("Date parsing failed for transit:", prevSchedule.arrival, schedule.departure);
                                                            }
                                                        } catch (e) {
                                                            console.error("Layover calculation error:", e);
                                                        }
                                                    }

                                                    return (
                                                        <React.Fragment key={sIdx}>
                                                            {layoverText && (
                                                                <div className="flex items-center justify-center py-1 relative z-10">
                                                                    <div className="bg-orange-50 text-orange-600 px-6 py-1 rounded-full text-[11px] font-bold border border-orange-100 shadow-sm flex items-center gap-2.5">
                                                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                                                        {layoverText}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="relative pl-8 border-l-2 border-dashed border-gray-200 py-3">
                                                                {/* Segment Header */}
                                                                <div className="mb-6 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-gray-300 -ml-[33px] relative z-10"></div>
                                                                    <h4 className="font-bold text-[#1E2049] text-sm">
                                                                        {schedule.departure.airportShortName || schedule.departure.airport} &rarr; {schedule.arrival.airportShortName || schedule.arrival.airport}
                                                                        <span className="ml-2 font-normal text-gray-500 text-xs">({schedule.departure.formattedDate})</span>
                                                                    </h4>
                                                                </div>

                                                                {/* Segment Content */}
                                                                <div className="flex flex-col gap-4 mb-4">
                                                                    {/* Airline & Aircraft Info */}
                                                                    <div className="flex items-center gap-4">
                                                                        <img
                                                                            src={`http://127.0.0.1:8000/images/airline-logo/${schedule.carrier.marketing}.png`}
                                                                            alt={schedule.carrier.marketingName}
                                                                            className="w-10 h-10 object-contain"
                                                                            onError={(e) => { e.target.src = selectedFlight.airlineLogo }}
                                                                        />
                                                                        <div>
                                                                            <div className="text-[11px] text-gray-500 mb-0.5">
                                                                                {schedule.carrier.marketingName} &bull; {schedule.carrier.marketing}-{schedule.carrier.marketingFlightNumber}
                                                                            </div>
                                                                            <div className="text-[10px] text-gray-400">
                                                                                Operated by: {schedule.carrier.operatingName || schedule.carrier.marketingName} &bull;
                                                                                Aircraft: {schedule.carrier?.equipment?.code ?? "N/A"}-{schedule.carrier?.equipment?.typeForFirstLeg ?? "N/A"}/{schedule.carrier?.equipment?.typeForLastLeg ?? "N/A"}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Timing & Route Info - Full Width */}
                                                                    <div className="bg-gray-50/50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                                                                        <div className="text-left">
                                                                            <div className="text-xl font-bold text-[#1e2049]">{schedule.departure.time.split(':').slice(0, 2).join(':')}</div>
                                                                            <div className="text-[10px] text-gray-500 mt-1">{schedule.departure.formattedDate}</div>
                                                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">{schedule.departure.airportShortName || schedule.departure.airport}</div>
                                                                        </div>

                                                                        <div className="flex flex-col items-center flex-1 max-w-[200px] px-8">
                                                                            <div className="text-[10px] text-gray-400 mb-2">{schedule.formattedElapsedTime}</div>
                                                                            <div className="w-full h-px bg-gray-300 relative flex items-center justify-center">
                                                                                <div className="absolute right-0 -top-1 w-2 h-2 border-r-2 border-t-2 border-gray-300 rotate-45"></div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className="text-xl font-bold text-[#1e2049]">{schedule.arrival.time.split(':').slice(0, 2).join(':')}</div>
                                                                            <div className="text-[10px] text-gray-500 mt-1">{schedule.arrival.formattedDate}</div>
                                                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">{schedule.arrival.airportShortName || schedule.arrival.airport}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <details className="group">
                                                                    <summary className="flex items-center justify-center p-2 text-blue-600 font-bold text-xs cursor-pointer hover:bg-blue-50 rounded-lg select-none list-none border border-blue-100 border-dashed">
                                                                        <span className="group-open:hidden flex items-center gap-1">Show Baggage and Cabin <FiChevronDown /></span>
                                                                        <span className="hidden group-open:flex items-center gap-1">Hide Baggage and Cabin <FiChevronDown className="rotate-180" /></span>
                                                                    </summary>

                                                                    <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                                                        <table className="w-full text-xs text-left">
                                                                            <thead className="bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                                                                                <tr>
                                                                                    <th className="px-4 py-2">Passenger</th>
                                                                                    <th className="px-4 py-2">Segment</th>
                                                                                    <th className="px-4 py-2">Baggage Allowance</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                                                {(() => {
                                                                                    const summary = selectedFlight.passengerFareSummary || {};
                                                                                    const passengers = Object.keys(summary).filter(k => k !== 'totalPassenger');

                                                                                    return passengers.map((key, pIdx) => {
                                                                                        const pax = summary[key];
                                                                                        // Baggage for this specific segment
                                                                                        let baggageText = '30 KG';
                                                                                        try {
                                                                                            const baggage = schedule.baggageInfo?.[pIdx]?.quantity || schedule.baggageInfo?.[0]?.quantity;
                                                                                            if (baggage) {
                                                                                                if (baggage.pieceCount) baggageText = `${baggage.pieceCount} PC`;
                                                                                                else if (baggage.weight) baggageText = `${baggage.weight} ${(baggage.unit || 'KG')}`;
                                                                                            }
                                                                                        } catch (e) { }

                                                                                        const cabin = schedule.cabinBookings?.[pIdx] || schedule.cabinBookings?.[0] || {};
                                                                                        return (
                                                                                            <tr key={pIdx}>
                                                                                                <td className="px-4 py-2 font-medium">{pax.passengerType || 'Adult'}</td>
                                                                                                <td className="px-4 py-2 text-gray-500">
                                                                                                    Cabin: {cabin.cabinCode || 'Y'} • Class: {cabin.bookingCode || 'K'}
                                                                                                </td>
                                                                                                <td className="px-4 py-2 font-bold text-[#E41D57]">{baggageText}</td>
                                                                                            </tr>
                                                                                        );
                                                                                    });
                                                                                })()}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </details>
                                                            </div>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'fare_summary' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900">Fare Summary</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#F8F9FA] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-4 py-3">Passenger Type</th>
                                                        <th className="px-4 py-3">Base Fare</th>
                                                        <th className="px-4 py-3">Tax</th>
                                                        <th className="px-4 py-3">Total Fare</th>
                                                        <th className="px-4 py-3">Quantity</th>
                                                        <th className="px-4 py-3">Penalty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                                    {(() => {
                                                        const summary = selectedFlight.passengerFareSummary || {};
                                                        const rawPenalties = selectedFlight.penaltyInfos || [];

                                                        return Object.keys(summary)
                                                            .filter(key => key !== 'totalPassenger')
                                                            .map((key, idx) => {
                                                                const pax = summary[key];
                                                                const penalties = (rawPenalties[idx]?.penalties || []).map(pen => {
                                                                    const amountStr = pen.amount ? ` BDT ${pen.amount.toLocaleString()}` : ' Free';
                                                                    return `${pen.type} ${pen.applicability}: ${amountStr}`;
                                                                });

                                                                return (
                                                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                        <td className="px-4 py-4 font-medium text-gray-900">{pax.passengerType || 'Adult'}</td>
                                                                        <td className="px-4 py-4">{(pax.passengerBaseFare || 0).toLocaleString()}</td>
                                                                        <td className="px-4 py-4">{(pax.passengerTax || 0).toLocaleString()}</td>
                                                                        <td className="px-4 py-4 font-bold">{(pax.passengerTotalFare || 0).toLocaleString()}</td>
                                                                        <td className="px-4 py-4">{pax.passengerNumberByType || 1}</td>
                                                                        <td className="px-4 py-4 text-[10px] leading-relaxed text-gray-500">
                                                                            {penalties.length > 0 ? (
                                                                                <div className="flex flex-col gap-1">
                                                                                    {penalties.map((p, i) => <span key={i}>{p}</span>)}
                                                                                </div>
                                                                            ) : 'N/A'}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                    })()}
                                                </tbody>
                                                <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-100">
                                                    <tr>
                                                        <td className="px-4 py-3 text-gray-900">Total</td>
                                                        <td className="px-4 py-3"></td>
                                                        <td className="px-4 py-3"></td>
                                                        <td className="px-4 py-3 text-[#1e2049] font-black text-base">
                                                            {selectedFlight.fare.totalPrice.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-900">{selectedFlight.passengerFareSummary?.totalPassenger}</td>
                                                        <td className="px-4 py-3"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default FlightSearchResults;
