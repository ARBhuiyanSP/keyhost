import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiChevronDown, FiClock, FiMinus, FiPlus, FiSun, FiMoon, FiX, FiLoader, FiSearch, FiRepeat, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { initiateSearch, fetchAmadeusResults, fetchSabreResults } from '../../utils/flightApi';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FlightSearchResults = ({ searchParams: initialSearchParams }) => {
    // Helper to extract IATA code from "City (CODE)" format
    const extractCode = (val) => {
        if (!val) return '';
        const match = val.match(/\((.*?)\)/);
        return match ? match[1] : val;
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [searchId, setSearchId] = useState(null);
    const [error, setError] = useState(null);
    const [providersStatus, setProvidersStatus] = useState({ amadeus: 'pending', sabre: 'pending' });

    const [fromInput, setFromInput] = useState(initialSearchParams.from || '');
    const [toInput, setToInput] = useState(initialSearchParams.to || '');
    const [departDate, setDepartDate] = useState(initialSearchParams.depart ? new Date(initialSearchParams.depart) : new Date());
    const [returnDate, setReturnDate] = useState(initialSearchParams.return ? new Date(initialSearchParams.return) : null);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState('itinerary');

    // Sync inputs with URL params if they change externally (e.g. from header)
    useEffect(() => {
        if (initialSearchParams.from) setFromInput(initialSearchParams.from);
        if (initialSearchParams.to) setToInput(initialSearchParams.to);
        if (initialSearchParams.depart) setDepartDate(new Date(initialSearchParams.depart));
        if (initialSearchParams.return) setReturnDate(new Date(initialSearchParams.return));
    }, [initialSearchParams.from, initialSearchParams.to, initialSearchParams.depart, initialSearchParams.return]);

    const [airportList, setAirportList] = useState([]);

    // Fetch airport list from public directory
    useEffect(() => {
        fetch('/data/airportlist.json')
            .then(res => res.json())
            .then(data => {
                setAirportList(Object.values(data));
            })
            .catch(err => console.error('Failed to load airports:', err));
    }, []);

    const getSuggestions = (input) => {
        if (!input || typeof input !== 'string' || input.length < 2) return [];
        const lower = input.toLowerCase();
        return airportList.filter(a => {
            if (!a) return false;
            return (
                (a.code && a.code.toLowerCase().includes(lower)) ||
                (a.name && a.name.toLowerCase().includes(lower)) ||
                (a.shortName && a.shortName.toLowerCase().includes(lower))
            );
        }).slice(0, 10);
    };

    // Close suggestions on click outside
    const fromRef = useRef(null);
    const toRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fromRef.current && !fromRef.current.contains(event.target)) {
                setShowFromSuggestions(false);
            }
            if (toRef.current && !toRef.current.contains(event.target)) {
                setShowToSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleModifySearch = () => {
        const newParams = new URLSearchParams(searchParams);

        newParams.set('from', extractCode(fromInput));
        newParams.set('to', extractCode(toInput));
        if (departDate) newParams.set('depart', departDate.toISOString());
        if (returnDate) newParams.set('return', returnDate.toISOString());
        setSearchParams(newParams);
    };

    useEffect(() => {
        const startSearch = async () => {
            setLoading(true);
            setError(null);
            setResults([]);
            setProvidersStatus({ amadeus: 'pending', sabre: 'pending' });

            try {
                const cabinMap = {
                    'Economy': 'ECONOMY',
                    'Premium Economy': 'PREMIUM_ECONOMY',
                    'Business': 'BUSINESS',
                    'First Class': 'FIRST'
                };

                const apiParams = {
                    tripType: initialSearchParams.trip_type === 'roundTrip' ? 'round_trip' :
                        initialSearchParams.trip_type === 'multiCity' ? 'multi_city' : 'one_way',
                    departure_one_round: extractCode(initialSearchParams.from),
                    destination_one_round: extractCode(initialSearchParams.to),
                    depart_date: initialSearchParams.depart ? format(new Date(initialSearchParams.depart), 'dd MMM yy') : format(new Date(), 'dd MMM yy'),
                    return_date: initialSearchParams.return ? format(new Date(initialSearchParams.return), 'dd MMM yy') : null,
                    depart_date: initialSearchParams.depart ? format(new Date(initialSearchParams.depart), 'dd MMM yy') : format(new Date(), 'dd MMM yy'),
                    return_date: initialSearchParams.return ? format(new Date(initialSearchParams.return), 'dd MMM yy') : null,
                    ADTs: parseInt(initialSearchParams.adults) || parseInt(initialSearchParams.travelers) || 1,
                    C07s: (parseInt(initialSearchParams.children) || 0) + (parseInt(initialSearchParams.kids) || 0), // Summing Children (5-11) and Kids (2-4) as generic Children for API
                    C03s: 0,
                    INFs: parseInt(initialSearchParams.infants) || 0,
                    classOfService: initialSearchParams.class || 'Economy',
                    cabin: cabinMap[initialSearchParams.class] || 'ECONOMY',
                    fare_type: 'regular'
                };

                // 2. Initiate Search
                const initData = await initiateSearch(apiParams);
                if (initData.randomNumber) {
                    setSearchId(initData.randomNumber);

                    // 3. Fetch from providers concurrently
                    const amadeusPromise = fetchAmadeusResults(initData.randomNumber)
                        .then(res => {
                            if (res.data) setResults(prev => [...prev, ...res.data]);
                            setProvidersStatus(prev => ({ ...prev, amadeus: 'success' }));
                        })
                        .catch(err => {
                            console.error('Amadeus error:', err);
                            setProvidersStatus(prev => ({ ...prev, amadeus: 'error' }));
                        });

                    const sabrePromise = fetchSabreResults(initData.randomNumber, apiParams.tripType)
                        .then(res => {
                            if (res.data) setResults(prev => [...prev, ...res.data]);
                            setProvidersStatus(prev => ({ ...prev, sabre: 'success' }));
                        })
                        .catch(err => {
                            console.error('Sabre error:', err);
                            setProvidersStatus(prev => ({ ...prev, sabre: 'error' }));
                        });

                    await Promise.allSettled([amadeusPromise, sabrePromise]);
                } else {
                    throw new Error('Failed to initiate search ID');
                }
            } catch (err) {
                console.error('Search initiation error:', err);
                setError(err.message || 'Failed to start flight search');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams) {
            startSearch();
        }
    }, [searchParams]);

    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const [selectedStops, setSelectedStops] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedFlight, setSelectedFlight] = useState(null);

    // Derived data for filters
    const availableAirlines = Array.from(new Set(results.map(r => r.airlineName))).sort();
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

                // Detailed signature: Airline + First Dep Time + Last Arr Time + Stop counts
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
                // Keep the cheapest one for this signature
                if (!existing || flight.fare.totalPrice < existing.fare.totalPrice) {
                    flightsBySignature.set(signature, flight);
                }
            } catch (e) {
                // Skip malformed results
            }
        });

        return Array.from(flightsBySignature.values()).sort((a, b) => a.fare.totalPrice - b.fare.totalPrice);
    }, [results]);

    const filteredResults = uniqueResults.filter(flight => {
        const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airlineName);

        const firstLegKey = Object.keys(flight.legs)[0];
        const stopCount = flight.legs[firstLegKey].stopovers?.length || 0;
        const stopLabel = stopCount === 0 ? 'Non-Stop' : stopCount === 1 ? '1 Stop' : '2 Stops or more';
        const matchesStops = selectedStops.length === 0 || selectedStops.includes(stopLabel);

        const matchesPrice = flight.fare.totalPrice >= priceRange[0] && flight.fare.totalPrice <= priceRange[1];

        return matchesAirline && matchesStops && matchesPrice;
    });

    const toggleFilter = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const FilterSection = ({ title, children, defaultOpen = true }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        return (
            <div className="border-b border-gray-100 py-4 last:border-0">
                <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                    <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && <div>{children}</div>}
            </div>
        );
    };

    return (
        <div className="bg-[#F4F6F9] min-h-screen pb-12 font-sans">
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
                        <FilterSection title="Airlines">
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {availableAirlines.length > 0 ? availableAirlines.map((airline, idx) => (
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
                                )) : <p className="text-xs text-gray-400 italic">No airlines found</p>}
                            </div>
                        </FilterSection>

                        {/* Stops */}
                        <FilterSection title="Stops">
                            <div className="space-y-2">
                                {['Non-Stop', '1 Stop', '2 Stops or more'].map((stop, idx) => (
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
                                ))}
                            </div>
                        </FilterSection>

                        {/* Price Range */}
                        <FilterSection title="Price Range">
                            <div className="px-2 mb-4">
                                <div className="h-1 bg-gray-200 rounded-full relative">
                                    <div className="absolute left-0 right-0 h-full bg-[#E41D57] rounded-full"></div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#E41D57] rounded-full shadow cursor-pointer"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#E41D57] rounded-full shadow cursor-pointer"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-900">
                                <span>BDT {priceRange[0].toLocaleString()}</span>
                                <span>BDT {priceRange[1].toLocaleString()}</span>
                            </div>
                        </FilterSection>

                        {/* Departure Time */}
                        <FilterSection title="Departure Time">
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

                        {/* Layover Time */}
                        <FilterSection title="Layover Time">
                            <div className="flex flex-wrap gap-2">
                                {['0h-5h', '5h-10h', '10h-15h', '15h+'].map((time, idx) => (
                                    <button key={idx} className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600">{time}</button>
                                ))}
                            </div>
                        </FilterSection>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search Bar - Responsive Design */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col items-center gap-4 relative z-50">
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                                {/* From Input */}
                                <div className="relative flex-1 w-full" ref={fromRef}>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiMapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={fromInput}
                                        onChange={(e) => { setFromInput(e.target.value); setShowFromSuggestions(true); }}
                                        onFocus={() => setShowFromSuggestions(true)}
                                        placeholder="From"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57] transition-all font-medium"
                                    />
                                    {showFromSuggestions && fromInput.length >= 2 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-[100]">
                                            {getSuggestions(fromInput).map((a) => (
                                                <div
                                                    key={a.code}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0"
                                                    onClick={() => {
                                                        setFromInput(`${a.shortName} (${a.code})`);
                                                        setShowFromSuggestions(false);
                                                    }}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{a.shortName}</span>
                                                        <span className="text-[10px] text-gray-500">{a.name}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#E41D57]">{a.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Swap Icon */}
                                <button
                                    onClick={() => { const temp = fromInput; setFromInput(toInput); setToInput(temp); }}
                                    className="p-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#E41D57] transition-colors rotate-90 md:rotate-0"
                                >
                                    <FiRepeat className="w-4 h-4" />
                                </button>

                                {/* To Input */}
                                <div className="relative flex-1 w-full" ref={toRef}>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiMapPin className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={toInput}
                                        onChange={(e) => { setToInput(e.target.value); setShowToSuggestions(true); }}
                                        onFocus={() => setShowToSuggestions(true)}
                                        placeholder="To"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57] transition-all font-medium"
                                    />
                                    {showToSuggestions && toInput.length >= 2 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-[100]">
                                            {getSuggestions(toInput).map((a) => (
                                                <div
                                                    key={a.code}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0"
                                                    onClick={() => {
                                                        setToInput(`${a.shortName} (${a.code})`);
                                                        setShowToSuggestions(false);
                                                    }}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{a.shortName}</span>
                                                        <span className="text-[10px] text-gray-500">{a.name}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#E41D57]">{a.code}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                                {/* Departure Date */}
                                <div className="relative flex-1 w-full">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                                        <FiCalendar className="w-4 h-4" />
                                    </div>
                                    <DatePicker
                                        selected={departDate}
                                        onChange={(date) => setDepartDate(date)}
                                        placeholderText="Depart Date"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57] transition-all font-medium cursor-pointer"
                                        dateFormat="dd MMM yyyy"
                                        minDate={new Date()}
                                    />
                                </div>

                                {/* Return Date (shown for round trips) */}
                                {(initialSearchParams.trip_type === 'roundTrip' || returnDate) && (
                                    <div className="relative flex-1 w-full">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                                            <FiCalendar className="w-4 h-4" />
                                        </div>
                                        <DatePicker
                                            selected={returnDate}
                                            onChange={(date) => setReturnDate(date)}
                                            placeholderText="Return Date"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57]/20 focus:border-[#E41D57] transition-all font-medium cursor-pointer"
                                            dateFormat="dd MMM yyyy"
                                            minDate={departDate || new Date()}
                                        />
                                    </div>
                                )}

                                {/* Search Button */}
                                <button
                                    onClick={handleModifySearch}
                                    className="bg-[#E41D57] hover:bg-[#c01b4b] text-white px-8 py-3 rounded-lg text-sm font-bold shadow-lg shadow-[#E41D57]/20 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                                >
                                    <FiSearch className="w-4 h-4" />
                                    Modify Search
                                </button>
                            </div>
                        </div>

                        {/* Sort Tabs */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border-2 border-[#1e2049] shadow-sm flex items-center gap-4 cursor-pointer relative overflow-hidden">
                                <div className="w-10 h-10 rounded-full bg-[#1e2049] flex items-center justify-center text-white text-xl font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-[#1e2049]">Cheapest</div>
                                    <div className="text-sm text-gray-500">From BDT 4,999</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors opacity-60 hover:opacity-100">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Fastest</div>
                                    <div className="text-sm text-gray-500">From BDT 4,999</div>
                                </div>
                            </div>
                        </div>

                        {/* Search Results List */}
                        <div className="space-y-4">
                            {loading && results.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <FiLoader className="w-10 h-10 text-[#E41D57] animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">Searching for best flights...</p>
                                    <div className="flex gap-4 mt-4">
                                        <div className={`text-xs px-3 py-1 rounded-full border ${providersStatus.amadeus === 'pending' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200 text-green-600'}`}>
                                            Amadeus: {providersStatus.amadeus}
                                        </div>
                                        <div className={`text-xs px-3 py-1 rounded-full border ${providersStatus.sabre === 'pending' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200 text-green-600'}`}>
                                            Sabre: {providersStatus.sabre}
                                        </div>
                                    </div>
                                </div>
                            ) : filteredResults.length > 0 ? (
                                filteredResults.map((flight, idx) => {
                                    const firstLegKey = Object.keys(flight.legs)[0];
                                    const leg = flight.legs[firstLegKey];
                                    const firstSchedule = leg.schedules[0];

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
                                })
                            ) : !loading && (
                                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="text-6xl mb-4">✈️</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Flights Found</h3>
                                    <p className="text-gray-500">Try adjusting your search criteria or dates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Flight Details Side Modal */}
            {selectedFlight && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <style>{`
                        @keyframes slideInRight {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSelectedFlight(null)}
                    />

                    {/* Drawer */}
                    <div
                        className="relative w-full max-w-2xl bg-[#F8F9FA] h-full shadow-2xl overflow-y-auto flex flex-col"
                        style={{ animation: 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    >
                        {/* Header */}
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

                        {/* Tabs */}
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
                            {/* Flight Details Tab (formerly Itinerary) */}
                            {activeTab === 'flight_details' && (
                                <div className="space-y-6">
                                    {Object.values(selectedFlight.legs).map((leg, legIdx) => {
                                        // State for toggling details specific to this leg is needed, 
                                        // but since we are mapping inside render, we'd normally need a separate component or a state object.
                                        // For simplicity in this functional component, we will use a key-based state if possible, 
                                        // OR just default to showing details or use a simple HTML details/summary if styling permits,
                                        // BUT user wants a specific toggle. Let's assume we want them expanded by default or use a local var approach?
                                        // React doesn't allow useState inside loops. 
                                        // A better approach: distinct component or just show all for now, 
                                        // OR use a state object keyed by legIdx in the parent (already have other states).
                                        // Let's add [expandedLegs, setExpandedLegs] = useState({}) at top level (I cannot add state here easily without refactoring the whole file).
                                        // CONSTRAINT: I am using 'multi_replace'. I can't easily add a new state hook at line 30 without a separate replace.
                                        // WORKAROUND: I will use <details open> as a native implementation which handles toggle state automatically.

                                        return (
                                            <div key={legIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                {/* Header */}
                                                <div className="flex justify-between items-center mb-4 cursor-pointer">
                                                    <h3 className="text-[#1e2049] font-bold text-lg flex items-center gap-2">
                                                        {leg.departure.airportShortName || leg.departure.airport} &rarr; {leg.arrival.airportShortName || leg.arrival.airport}
                                                        <span className="text-sm font-normal text-gray-500">({leg.departure.formattedDate})</span>
                                                    </h3>
                                                </div>

                                                {/* Basic Flight Info (Airline, Aircraft) */}
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

                                                {/* Details Section (Native 'details' for toggle) */}
                                                <details className="group" open>
                                                    <summary className="flex items-center justify-center p-2 text-blue-600 font-bold text-sm cursor-pointer hover:bg-blue-50 rounded-lg select-none list-none mb-4">
                                                        <span className="group-open:hidden flex items-center gap-1">Show More Details <FiChevronDown /></span>
                                                        <span className="hidden group-open:flex items-center gap-1">Hide More Details <FiChevronDown className="rotate-180" /></span>
                                                    </summary>

                                                    {/* Detailed Table for Passenger, Segment, Baggage */}
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
                                                                    // Debug logging
                                                                    console.log('Flight Details - passengerFareSummary:', selectedFlight.passengerFareSummary);
                                                                    console.log('Flight Details - Full selectedFlight:', selectedFlight);

                                                                    // Convert passengerFareSummary object to array (Aerotake format)
                                                                    const passengerFareSummary = selectedFlight.passengerFareSummary || {};
                                                                    const passengers = Object.keys(passengerFareSummary)
                                                                        .filter(key => key !== 'totalPassenger')
                                                                        .map(key => passengerFareSummary[key]);

                                                                    if (passengers.length > 0) {
                                                                        return passengers.map((pax, pIdx) => {
                                                                            // Extract Baggage Info from schedule.baggageInfo
                                                                            let baggageText = '30 KG';
                                                                            try {
                                                                                const schedule = leg.schedules[0];
                                                                                const baggage = schedule?.baggageInfo?.[pIdx]?.quantity || schedule?.baggageInfo?.[0]?.quantity;

                                                                                if (baggage) {
                                                                                    if (baggage.pieceCount) {
                                                                                        baggageText = `${baggage.pieceCount} PC`;
                                                                                    } else if (baggage.weight) {
                                                                                        baggageText = `${baggage.weight} ${(baggage.unit || 'KG').toUpperCase()}`;
                                                                                    }
                                                                                }
                                                                            } catch (e) {
                                                                                console.error('Baggage extraction error:', e);
                                                                            }

                                                                            // Extract Segment Info (Cabin, Booking Class, Seats)
                                                                            const schedule = leg.schedules[0];
                                                                            const cabin = schedule?.cabinBookings?.[pIdx] || schedule?.cabinBookings?.[0] || {};
                                                                            const cabinCode = cabin.cabinCode || 'Y';
                                                                            const bookingCode = cabin.bookingCode || cabin.rbd || 'K';
                                                                            const seats = cabin.seatsAvailable || cabin.availableSeats || '9';

                                                                            return (
                                                                                <tr key={pIdx}>
                                                                                    <td className="px-4 py-3 text-gray-900">{pax.passengerType || 'Adult'}</td>
                                                                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                                                                        <div className="flex flex-col gap-0.5">
                                                                                            <span>Cabin: {cabinCode}</span>
                                                                                            <span>Booking: {bookingCode}</span>
                                                                                            <span>Seats: {seats}</span>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-gray-900 font-medium">{baggageText}</td>
                                                                                </tr>
                                                                            );
                                                                        });
                                                                    } else {
                                                                        // Fallback: Show at least Adult row
                                                                        const schedule = leg.schedules[0];
                                                                        const baggage = schedule?.baggageInfo?.[0]?.quantity;
                                                                        let baggageText = '30 KG';
                                                                        if (baggage) {
                                                                            if (baggage.pieceCount) {
                                                                                baggageText = `${baggage.pieceCount} PC`;
                                                                            } else if (baggage.weight) {
                                                                                baggageText = `${baggage.weight} ${(baggage.unit || 'KG').toUpperCase()}`;
                                                                            }
                                                                        }

                                                                        return (
                                                                            <tr>
                                                                                <td className="px-4 py-3 text-gray-900">Adult</td>
                                                                                <td className="px-4 py-3 text-gray-600 text-xs">
                                                                                    <div className="flex flex-col gap-0.5">
                                                                                        <span>Cabin: {schedule?.cabinBookings?.[0]?.cabinCode || 'Y'}</span>
                                                                                        <span>Booking: {schedule?.cabinBookings?.[0]?.bookingCode || 'K'}</span>
                                                                                        <span>Seats: {schedule?.cabinBookings?.[0]?.seatsAvailable || '9'}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-gray-900 font-medium">{baggageText}</td>
                                                                            </tr>
                                                                        );
                                                                    }
                                                                })()}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </details>
                                            </div>
                                        )
                                    })
                                    }
                                </div>
                            )}

                            {/* Fare Summary Tab (formerly Fares) */}
                            {activeTab === 'fare_summary' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3">Passenger Type</th>
                                                <th className="px-4 py-3 text-right">Base Fare</th>
                                                <th className="px-4 py-3 text-right">Tax</th>
                                                <th className="px-4 py-3 text-right">Total Fare</th>
                                                <th className="px-4 py-3 text-center">Qty</th>
                                                <th className="px-4 py-3 text-right">Subtotal</th>
                                                <th className="px-4 py-3">Penalty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(() => {
                                                // Convert passengerFareSummary object to array (Aerotake format)
                                                const passengerFareSummary = selectedFlight.passengerFareSummary || {};
                                                const passengers = Object.keys(passengerFareSummary)
                                                    .filter(key => key !== 'totalPassenger')
                                                    .map(key => passengerFareSummary[key]);

                                                if (passengers.length > 0) {
                                                    return passengers.map((p, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50/50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {p.passengerType} <span className="text-xs text-gray-400 font-normal">({p.code})</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">{(p.passengerBaseFare || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right">{(p.passengerTax || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-medium text-[#E41D57]">{(p.passengerTotalFare || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-center">{p.passengerNumberByType}</td>
                                                            <td className="px-4 py-3 text-right font-bold">{(p.passengerTotalFare * p.passengerNumberByType).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-xs text-gray-500 min-w-[200px]">
                                                                {/* Display penalty rules if available */}
                                                                {selectedFlight.penaltyInfos?.[0]?.penalties ? (
                                                                    selectedFlight.penaltyInfos[0].penalties.map((rule, rIdx) => (
                                                                        <div key={rIdx} className="mb-1 last:mb-0">
                                                                            {rule.type}: {rule.amount > 0 ? `BDT ${rule.amount.toLocaleString()}` : (rule.refundable ? 'Free' : 'Non-Refundable')}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <span className="italic">Rules apply</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ));
                                                } else {
                                                    return (
                                                        <tr>
                                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Fare breakdown not available</td>
                                                        </tr>
                                                    );
                                                }
                                            })()}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
                                            <tr>
                                                <td colSpan="5" className="px-4 py-3 text-right">Grand Total</td>
                                                <td className="px-4 py-3 text-right text-lg text-[#E41D57]">BDT {selectedFlight.fare.totalPrice.toLocaleString()}</td>
                                                <td className="px-4 py-3"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
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
