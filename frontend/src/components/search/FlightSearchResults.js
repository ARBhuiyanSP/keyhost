import React, { useState, useEffect, useMemo } from 'react';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { FiChevronDown, FiSun, FiMoon, FiLoader, FiX, FiEdit2, FiSearch } from 'react-icons/fi'; // Added FiEdit2 for Modify Search
import { useSearchParams, useNavigate } from 'react-router-dom';
import FlightDetailsTabs from '../flight/FlightDetailsTabs';
import FlightCard from './FlightCard';
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
    const [loadingIndex, setLoadingIndex] = useState(null);

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
    const [selectedFareOption, setSelectedFareOption] = useState(null);
    const [selectedTab, setSelectedTab] = useState('details');
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
                if (!existing) {
                    // Clone flight so we don't mutate original, ensure fares array exists
                    flightsBySignature.set(signature, { ...flight, fares: flight.fares || [] });
                } else {
                    // Merge fares from this duplicate into the existing entry
                    const mergedFares = [...(existing.fares || []), ...(flight.fares || [])];
                    // Deduplicate fares by itineraryId
                    const seenIds = new Set();
                    const dedupedFares = mergedFares.filter(f => {
                        const id = f.itineraryId;
                        if (seenIds.has(id)) return false;
                        seenIds.add(id);
                        return true;
                    });
                    existing.fares = dedupedFares;
                    // Keep the cheapest as the main price
                    if (flight.fare.totalPrice < existing.fare.totalPrice) {
                        existing.fare = flight.fare;
                        existing.passengerFareSummary = flight.passengerFareSummary;
                        existing.refundStatus = flight.refundStatus;
                    }
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
                            <div className="flex-1 min-w-0 overflow-x-hidden">
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
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center relative border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsSearchExpanded(true)}>
                                            <div className="text-center w-full">
                                                <div className="font-bold text-[#1e2049] text-base">{searchSummary}</div>
                                                <div className="text-xs text-gray-500">Click to modify search</div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMobileFilterOpen(true);
                                                }}
                                                className="lg:hidden absolute right-2 flex items-center gap-2 bg-[#E41D57] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[#c01b4b] transition-colors whitespace-nowrap"
                                            >
                                                Filter <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                            </button>
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

                                    {!loading && hasSearched && filteredResults.length > 0 && filteredResults.map((flight, idx) => (
                                        <FlightCard
                                            key={idx}
                                            flight={flight}
                                            index={idx}
                                            loadingIndex={loadingIndex}
                                            setLoadingIndex={setLoadingIndex}
                                            onShowDetails={(fareOpt) => {
                                                setSelectedFlight(flight);
                                                setSelectedFareOption(fareOpt || null);
                                                setSelectedTab(fareOpt ? 'baggage' : 'details');
                                            }}
                                        />
                                    ))}

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
                        onClick={() => { setSelectedFlight(null); setSelectedFareOption(null); setSelectedTab('details'); }}
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
                                onClick={() => { setSelectedFlight(null); setSelectedFareOption(null); setSelectedTab('details'); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <FlightDetailsTabs
                                flight={selectedFlight}
                                fare={selectedFareOption}
                                tab={selectedTab}
                                setTab={setSelectedTab}
                            />
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default FlightSearchResults;
