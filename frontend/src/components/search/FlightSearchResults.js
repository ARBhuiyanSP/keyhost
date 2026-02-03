import React, { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSun, FiMoon, FiLoader, FiX, FiEdit2, FiSearch } from 'react-icons/fi'; // Added FiEdit2 for Modify Search
import { useSearchParams } from 'react-router-dom';
import { searchSabre, searchAmadeus } from '../../utils/flightApi';
import { format } from 'date-fns';
import FlightSearchForm from './FlightSearchForm';
import { DUMMY_FLIGHTS } from '../../utils/dummyFlights';

const FlightSearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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

    // Side Filter States
    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const [selectedStops, setSelectedStops] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);

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
                        apiParams['C07'] = (parseInt(currentParams.children) || 0) + (parseInt(currentParams.kids) || 0);
                        apiParams['C03'] = 0;
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
                    apiParams['C07s'] = (parseInt(currentParams.children) || 0) + (parseInt(currentParams.kids) || 0);
                    apiParams['C03s'] = 0;
                    apiParams['INFs'] = parseInt(currentParams.infants) || 0;
                }

                apiParams['fare_type'] = 'Public';
                apiParams['classOfService'] = currentParams.class || 'Economy';

                console.log('Initiating Search with Aerotake Params:', apiParams);

                const amadeusPromise = searchAmadeus(apiParams)
                    .then(res => {
                        setRawResponses(prev => ({ ...prev, amadeus: res }));
                        if (res.data) setResults(prev => [...prev, ...res.data]);
                        setProvidersStatus(prev => ({ ...prev, amadeus: 'success' }));
                    })
                    .catch(err => {
                        console.error('Amadeus error:', err);
                        setRawResponses(prev => ({ ...prev, amadeus: err.response?.data || err.message }));
                        setProvidersStatus(prev => ({ ...prev, amadeus: 'error' }));
                    });

                const sabrePromise = searchSabre(apiParams)
                    .then(res => {
                        setRawResponses(prev => ({ ...prev, sabre: res }));
                        if (res.data) setResults(prev => [...prev, ...res.data]);
                        setProvidersStatus(prev => ({ ...prev, sabre: 'success' }));
                    })
                    .catch(err => {
                        console.error('Sabre error:', err);
                        setRawResponses(prev => ({ ...prev, sabre: err.response?.data || err.message }));
                        setProvidersStatus(prev => ({ ...prev, sabre: 'error' }));
                    });

                const [amadeusRes, sabreRes] = await Promise.allSettled([amadeusPromise, sabrePromise]);

                console.log('Search Settled:', { amadeusRes, sabreRes });
                setSearchStatus('Completed');
            } catch (err) {
                console.error('Search error:', err);
                setSearchStatus(`Error: ${err.message}`);
                setError(err.message || 'Failed to start flight search');
            } finally {
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
        const matchesPrice = flight.fare.totalPrice >= priceRange[0] && flight.fare.totalPrice <= priceRange[1];
        return matchesAirline && matchesStops && matchesPrice;
    }), [uniqueResults, selectedAirlines, selectedStops, priceRange]);

    const toggleFilter = (list, setList, item) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const FilterSection = ({ title, children, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        return (
            <div className="border-b border-gray-100 py-4 last:border-0">
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
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
        return `${from} to ${to}, ${date} • ${parseInt(p.adults || 1) + parseInt(p.children || 0)} Travelers`;
    }, [searchParams]);

    return (
        <div className="bg-white min-h-screen pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit flex-shrink-0 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                            <button
                                onClick={() => { setSelectedAirlines([]); setSelectedStops([]); setPriceRange([minPrice, maxPrice]); }}
                                className="text-xs text-[#E41D57] font-medium"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Airlines */}
                        <FilterSection title="Airlines" defaultOpen={false}>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {results.length > 0 ? (
                                    availableAirlines.map((airline, idx) => (
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
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">{airline}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No airlines found</p>
                                )}
                            </div>
                        </FilterSection>

                        {/* Stops (Blank if no results) */}
                        <FilterSection title="Stops" defaultOpen={false}>
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
                                            <div className={`w-4 h-4 rounded border border-gray-300 bg-white flex items-center justify-center transition-colors ${selectedStops.includes(stop) ? 'bg-[#E41D57] border-[#E41D57] text-white' : ''}`}>
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

                        {/* Price Range */}
                        <FilterSection title="Price Range" defaultOpen={false}>
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

                        {/* Departure Time (Keep) */}
                        <FilterSection title="Departure Time" defaultOpen={false}>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiSun className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] text-gray-600">00-06</span>
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiSun className="w-4 h-4 text-orange-400" />
                                    <span className="text-[10px] text-gray-600">06-12</span>
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiSun className="w-4 h-4 text-yellow-500" />
                                    <span className="text-[10px] text-gray-600">12-18</span>
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiMoon className="w-4 h-4 text-purple-600" />
                                    <span className="text-[10px] text-gray-600">18-00</span>
                                </button>
                            </div>
                        </FilterSection>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Collapsible Search Header */}
                        <div className="mb-8">
                            {isSearchExpanded ? (
                                <div className="relative bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
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
                                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsSearchExpanded(true)}>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#E41D57]/10 p-2 rounded-full text-[#E41D57]">
                                            <FiSearch className="w-5 h-5 stroke-[2.5px]" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#1e2049] text-base">{searchSummary}</div>
                                            <div className="text-xs text-gray-500">Click to modify search</div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-full shadow-sm">
                                        <FiEdit2 className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* NO TABS - REMOVED AS REQUESTED */}

                        {/* Search Results List */}
                        <div className="space-y-4">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <FiLoader className="w-10 h-10 text-[#E41D57] animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">Searching for best flights...</p>
                                    <div className="flex gap-4 mt-4">
                                        <div className={`text-xs px-3 py-1 rounded-full border ${providersStatus.amadeus === 'pending' ? 'bg-gray-50 border-gray-200' : providersStatus.amadeus === 'success' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                            Amadeus: {providersStatus.amadeus}
                                        </div>
                                        <div className={`text-xs px-3 py-1 rounded-full border ${providersStatus.sabre === 'pending' ? 'bg-gray-50 border-gray-200' : providersStatus.sabre === 'success' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                            Sabre: {providersStatus.sabre}
                                        </div>
                                    </div>
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
                                                    <div key={legIdx} className="flex items-center justify-center gap-6">
                                                        <div className="text-right w-20">
                                                            <div className="text-lg font-bold text-gray-900">
                                                                {leg.departure.time.split(':').slice(0, 2).join(':')}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">{leg.departure.airport}</div>
                                                        </div>
                                                        <div className="flex flex-col items-center w-32">
                                                            <div className="text-[9px] text-gray-400 mb-1">{leg.formattedElapsedTime}</div>
                                                            <div className="w-full h-px bg-gray-300 relative flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 rounded-full border border-gray-300 bg-white absolute left-0"></div>
                                                                <div className="bg-white px-1 z-10 text-[8px] text-gray-400 uppercase">
                                                                    {leg.stopovers?.length === 0 ? 'Non Stop' : `${leg.stopovers?.length} Stop`}
                                                                </div>
                                                                <div className="w-1.5 h-1.5 rounded-full border border-blue-500 bg-white absolute right-0"></div>
                                                            </div>
                                                            <div className="text-[8px] text-gray-400 mt-1">{leg.departure.formattedDate}</div>
                                                        </div>
                                                        <div className="text-left w-20">
                                                            <div className="text-lg font-bold text-gray-900">
                                                                {leg.arrival.time.split(':').slice(0, 2).join(':')}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">{leg.arrival.airport}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Price & Action */}
                                            <div className="flex flex-col items-end md:w-1/4 gap-2 w-full">
                                                <div className="text-xs text-gray-500">Starting from</div>
                                                <div className="text-xl font-bold text-[#1e2049]">BDT {flight.fare.totalPrice.toLocaleString()}</div>
                                                <button className="bg-[#E41D57] hover:bg-[#c01b4b] text-white font-bold py-2 px-6 rounded-full text-sm transition-colors w-full md:w-auto">
                                                    View Fares
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

                            {!loading && !hasSearched && (
                                <div className="text-center py-20">
                                    {/* Empty State / Prompt - or just blank as requested */}
                                    {/* <div className="text-gray-400">Search for flights to see results</div> */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Flight Details Side Modal (Reused) */}
            {selectedFlight && (
                <div className="fixed inset-0 z-[100] flex justify-end">
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
                        <div className="bg-[#E41D57] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
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

                        <div className="flex bg-white border-b border-gray-200 sticky top-[72px] z-10">
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
                                        <div key={legIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <div className="flex justify-between items-center mb-4 cursor-pointer">
                                                <h3 className="text-[#1e2049] font-bold text-lg flex items-center gap-2">
                                                    {leg.departure.airportShortName || leg.departure.airport} &rarr; {leg.arrival.airportShortName || leg.arrival.airport}
                                                    <span className="text-sm font-normal text-gray-500">({leg.departure.formattedDate})</span>
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-4 mb-6">
                                                <img
                                                    src={selectedFlight.airlineLogo}
                                                    alt={selectedFlight.airlineName}
                                                    className="w-8 h-8 object-contain"
                                                />
                                                <div>
                                                    <div className="font-bold text-[#1e2049]">{selectedFlight.airlineName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Operated by: {leg.schedules[0]?.carrier?.operating || selectedFlight.airlineName} <br />
                                                        Aircraft: {leg.schedules[0]?.aircraft?.code || '738'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <div className="text-lg font-bold text-[#1e2049]">{leg.departure.time.split(':').slice(0, 2).join(':')}</div>
                                                    <div className="text-xs text-gray-500">{leg.departure.formattedDate}</div>
                                                    <div className="text-sm font-medium">{leg.departure.airportShortName || leg.departure.airport}</div>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="text-xs text-orange-500 font-medium mb-1">{leg.formattedElapsedTime}</div>
                                                    <div className="w-24 h-px bg-gray-300 relative">
                                                        <div className="absolute right-0 -top-1 w-2 h-2 border-r-2 border-t-2 border-gray-300 rotate-45"></div>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        {leg.stopovers?.length === 0 ? 'Non Stop' : `${leg.stopovers?.length} Stop`}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-[#1e2049]">{leg.arrival.time.split(':').slice(0, 2).join(':')}</div>
                                                    <div className="text-xs text-gray-500">{leg.arrival.formattedDate}</div>
                                                    <div className="text-sm font-medium">{leg.arrival.airportShortName || leg.arrival.airport}</div>
                                                </div>
                                            </div>

                                            <details className="group" open>
                                                <summary className="flex items-center justify-center p-2 text-blue-600 font-bold text-sm cursor-pointer hover:bg-blue-50 rounded-lg select-none list-none mb-4">
                                                    <span className="group-open:hidden flex items-center gap-1">Show More Details <FiChevronDown /></span>
                                                    <span className="hidden group-open:flex items-center gap-1">Hide More Details <FiChevronDown className="rotate-180" /></span>
                                                </summary>

                                                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-100 text-xs font-bold text-gray-500 uppercase">
                                                            <tr>
                                                                <th className="px-4 py-2">Passenger</th>
                                                                <th className="px-4 py-2">Segment</th>
                                                                <th className="px-4 py-2">Baggage Allowance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {(() => {
                                                                const passengerFareSummary = selectedFlight.passengerFareSummary || {};
                                                                const passengers = Object.keys(passengerFareSummary)
                                                                    .filter(key => key !== 'totalPassenger')
                                                                    .map(key => passengerFareSummary[key]);

                                                                const renderRow = (pax, pIdx) => {
                                                                    const schedule = leg.schedules[0];
                                                                    // Baggage
                                                                    let baggageText = '30 KG';
                                                                    try {
                                                                        const baggage = schedule?.baggageInfo?.[pIdx]?.quantity || schedule?.baggageInfo?.[0]?.quantity;
                                                                        if (baggage) {
                                                                            if (baggage.pieceCount) baggageText = `${baggage.pieceCount} PC`;
                                                                            else if (baggage.weight) baggageText = `${baggage.weight} ${(baggage.unit || 'KG').toUpperCase()}`;
                                                                        }
                                                                    } catch (e) { }

                                                                    const cabin = schedule?.cabinBookings?.[pIdx] || schedule?.cabinBookings?.[0] || {};
                                                                    const cabinCode = cabin.cabinCode || 'Y';
                                                                    const bookingCode = cabin.bookingCode || cabin.rbd || 'K';
                                                                    const seats = cabin.seatsAvailable || cabin.availableSeats || '9';

                                                                    return (
                                                                        <tr key={pIdx}>
                                                                            <td className="px-4 py-3 text-gray-900">{pax ? (pax.passengerType || 'Adult') : 'Adult'}</td>
                                                                            <td className="px-4 py-3 text-gray-600 text-xs">
                                                                                <div className="flex flex-col gap-0.5">
                                                                                    <span>Cabin: {cabinCode}</span>
                                                                                    <span>Booking: {bookingCode}</span>
                                                                                    <span>Seats: {seats}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-gray-600 font-medium">{baggageText}</td>
                                                                        </tr>
                                                                    );
                                                                };

                                                                if (passengers.length > 0) return passengers.map(renderRow);
                                                                return renderRow(null, 0);
                                                            })()}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'fare_summary' && (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Fare Breakdown</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Base Fare</span>
                                                <span className="font-medium">BDT {(selectedFlight.fare.baseFare || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Taxes & Fees</span>
                                                <span className="font-medium">BDT {(selectedFlight.fare.tax || 0).toLocaleString()}</span>
                                            </div>
                                            {selectedFlight.fare.otherCharges > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Other Charges</span>
                                                    <span className="font-medium">BDT {selectedFlight.fare.otherCharges.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-100 my-2 pt-2 flex justify-between font-bold text-lg text-[#1e2049]">
                                                <span>Total</span>
                                                <span>BDT {selectedFlight.fare.totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RAW DATA DEBUG SECTION */}
            <div className="mt-12 p-6 bg-gray-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${searchStatus === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        Raw API Responses (Debug)
                    </h3>
                    <div className="text-xs text-gray-400 font-mono">Status: <span className="text-white">{searchStatus}</span></div>
                </div>

                <div className="mb-4 p-3 bg-black/30 rounded border border-gray-800 font-mono text-[10px] text-gray-300">
                    URL Params: {JSON.stringify(Object.fromEntries([...searchParams]), null, 2)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-bold text-gray-400 uppercase">Amadeus Response</div>
                        <pre className="bg-black/50 p-4 rounded-lg text-green-400 text-[10px] overflow-auto max-h-[400px] border border-gray-800">
                            {rawResponses.amadeus ? JSON.stringify(rawResponses.amadeus, null, 2) : '// Waiting for search...'}
                        </pre>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-bold text-gray-400 uppercase">Sabre Response</div>
                        <pre className="bg-black/50 p-4 rounded-lg text-blue-400 text-[10px] overflow-auto max-h-[400px] border border-gray-800">
                            {rawResponses.sabre ? JSON.stringify(rawResponses.sabre, null, 2) : '// Waiting for search...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightSearchResults;
