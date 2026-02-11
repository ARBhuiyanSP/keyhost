import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiMinus, FiPlus, FiSearch, FiRepeat, FiX } from 'react-icons/fi';
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';

// Robust anchor for Popper.js positioning
const HiddenAnchor = React.forwardRef(({ value, onClick }, ref) => (
    <div
        ref={ref}
        onClick={onClick}
        className="absolute inset-0 w-full h-full z-0"
        aria-hidden="true"
    />
));

const FlightSearchForm = ({ searchParams, onSearch }) => {
    // Refs for manual calendar positioning
    const departContainerRef = useRef(null);
    const returnContainerRef = useRef(null);
    const multiCityContainerRefs = useRef({});

    // Helper to extract IATA code
    const extractCode = (val) => {
        if (!val) return '';
        const match = val.match(/\((.*?)\)/);
        return match ? match[1] : val;
    };

    // Robust Date parsing helper
    const safeDate = (d, fallback = null) => {
        if (!d) return fallback;
        const date = new Date(d);
        return isNaN(date.getTime()) ? fallback : date;
    };

    const [tripType, setTripType] = useState(searchParams.trip_type || 'oneWay');

    // Standard State (OneWay/RoundTrip)
    const [fromInput, setFromInput] = useState(searchParams.from || 'Dhaka (DAC)');
    const [toInput, setToInput] = useState(searchParams.to || 'Dubai (DXB)');
    const [departDate, setDepartDate] = useState(safeDate(searchParams.depart, new Date(2026, 1, 15)));
    const [returnDate, setReturnDate] = useState(safeDate(searchParams.return));

    // Multi City State

    const [segments, setSegments] = useState(() => {
        if (searchParams.segments) {
            try {
                const parsed = JSON.parse(searchParams.segments);
                return parsed.map(s => ({
                    from: s.from,
                    to: s.to,
                    depart: safeDate(s.depart)
                }));
            } catch (e) {
                console.error("Failed to parse segments", e);
            }
        }
        return [
            { from: searchParams.from || 'Dhaka (DAC)', to: searchParams.to || 'Dubai (DXB)', depart: safeDate(searchParams.depart, new Date(2026, 1, 15)) },
            { from: '', to: '', depart: null }
        ];
    });

    // Traveler & Class State
    const [adults, setAdults] = useState(parseInt(searchParams.adults) || 1);
    const [children, setChildren] = useState(parseInt(searchParams.children) || 0);
    const [kids, setKids] = useState(parseInt(searchParams.kids) || 0);
    const [infants, setInfants] = useState(parseInt(searchParams.infants) || 0);
    const [cabinClass, setCabinClass] = useState(searchParams.class || '');
    const [showTravelerModal, setShowTravelerModal] = useState(false);
    const [departOpen, setDepartOpen] = useState(false);
    const [returnOpen, setReturnOpen] = useState(false);
    const [multiCityDatesOpen, setMultiCityDatesOpen] = useState({}); // idx -> boolean

    // Suggestions State
    const [activeSuggestion, setActiveSuggestion] = useState(null); // 'from' | 'to' | 'segment_idx_from' | 'segment_idx_to'
    const [airportList, setAirportList] = useState([]);

    useEffect(() => {
        fetch('/data/airportlist.json')
            .then(res => res.json())
            .then(data => {
                setAirportList(Object.values(data));
            })
            .catch(err => console.error('Failed to load airports:', err));
    }, []);

    // Sync inputs with URL params
    useEffect(() => {
        if (searchParams.trip_type) setTripType(searchParams.trip_type);
        if (searchParams.from) setFromInput(searchParams.from);
        if (searchParams.to) setToInput(searchParams.to);
        if (searchParams.depart) setDepartDate(safeDate(searchParams.depart));
        if (searchParams.return) setReturnDate(safeDate(searchParams.return));
        if (searchParams.adults) setAdults(parseInt(searchParams.adults));

        if (searchParams.segments) {
            try {
                const parsed = JSON.parse(searchParams.segments);
                const mapped = parsed.map(s => ({
                    from: s.from,
                    to: s.to,
                    depart: safeDate(s.depart)
                }));
                setSegments(mapped);
            } catch (e) { console.error(e); }
        }
    }, [searchParams]);

    const getSuggestions = (input) => {
        // Show all defaults if input is empty, otherwise filter
        const list = airportList || [];
        if (!input || typeof input !== 'string' || input.length < 1) return list.slice(0, 10);

        const lower = input.toLowerCase();
        return list.filter(a => {
            if (!a) return false;
            return (
                (a.code && a.code.toLowerCase().includes(lower)) ||
                (a.name && a.name.toLowerCase().includes(lower)) ||
                (a.shortName && a.shortName.toLowerCase().includes(lower))
            );
        }).slice(0, 10);
    };

    // Click Outside Handling
    const formRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setActiveSuggestion(null);
                setShowTravelerModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = () => {
        const params = {
            trip_type: tripType,
            adults, children, kids, infants,
            class: cabinClass
        };

        if (tripType === 'multiCity') {
            params.segments = JSON.stringify(segments.map(s => ({
                from: extractCode(s.from),
                to: extractCode(s.to),
                depart: s.depart ? s.depart.toISOString() : null
            })));
            // Fallback for first segment
            params.from = extractCode(segments[0].from);
            params.to = extractCode(segments[0].to);
            params.depart = segments[0].depart ? segments[0].depart.toISOString() : null;
        } else {
            params.from = extractCode(fromInput);
            params.to = extractCode(toInput);
            params.depart = departDate ? departDate.toISOString() : null;
            params.return = (tripType === 'roundTrip' && returnDate) ? returnDate.toISOString() : null;
        }
        params.property_type = 'flight';
        onSearch(params);
    };

    // STYLING CONSTANTS
    // STYLING CONSTANTS
    const pillContainerClass = "w-full bg-white rounded-3xl md:rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.08)] border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center pr-2 p-2 md:p-1 gap-1 md:gap-0.5 min-h-auto md:min-h-[66px] relative z-[500] overflow-visible";
    const pillSectionBase = "group relative flex flex-col justify-center px-4 md:px-6 cursor-pointer transition-colors";
    const labelClass = "text-[10px] font-bold text-[#E41D57] uppercase tracking-wider mb-0.5";
    const dividerClass = "hidden md:block w-px h-8 bg-gray-200 flex-shrink-0";

    return (
        <div ref={formRef} className="w-full max-w-5xl mx-auto flex flex-col items-center">
            {/* Trip Type Toggle */}
            <div className="bg-[#EBEBEB]/50 inline-flex items-center rounded-full p-1 mb-4 backdrop-blur-sm">
                {['oneWay', 'roundTrip', 'multiCity'].map((type) => (
                    <button
                        key={type}
                        onClick={() => {
                            const prevType = tripType;
                            setTripType(type);

                            // Sync Logic
                            if (type === 'multiCity') {
                                // Syncing FROM OneWay/RoundTrip TO MultiCity
                                setSegments(prev => {
                                    const newSegments = [...prev];
                                    if (newSegments.length > 0) {
                                        newSegments[0] = {
                                            ...newSegments[0],
                                            from: fromInput, // Sync Location
                                            to: toInput,     // Sync Location
                                            depart: departDate // Sync Date
                                        };
                                    }
                                    return newSegments;
                                });
                            } else if (prevType === 'multiCity') {
                                // Syncing FROM MultiCity TO OneWay/RoundTrip
                                if (segments.length > 0) {
                                    setFromInput(segments[0].from);
                                    setToInput(segments[0].to);
                                    setDepartDate(segments[0].depart);
                                }
                            }

                            if (type === 'oneWay') setReturnDate(null);
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tripType === type
                            ? 'bg-[rgb(30,32,73)] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        {type === 'oneWay' ? 'One Way' : type === 'roundTrip' ? 'Round Trip' : 'Multi City'}
                    </button>
                ))}
            </div>

            {/* --- ONE WAY / ROUND TRIP LAYOUT --- */}
            {tripType !== 'multiCity' && (
                <div className="w-full flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* FROM & TO WRAPPER */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            {/* FROM */}
                            <div className={`${pillSectionBase} z-[55] h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} onClick={() => setActiveSuggestion('from')}>
                                {/* Display Component */}
                                <div className="w-full">
                                    <div className={labelClass}>From</div>
                                    <div className={`text-[15px] font-bold leading-tight truncate ${fromInput ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                        {fromInput ? fromInput.split('(')[0].trim() : "Where from?"}
                                    </div>
                                    {fromInput && <div className="text-[10px] text-gray-400 truncate">{fromInput.match(/\((.*?)\)/)?.[1] || ''}, {fromInput.split(',')[1]?.trim() || 'Airport'}</div>}
                                </div>
                                {activeSuggestion === 'from' && (
                                    <SuggestionsDropdown
                                        initialSearch={''}
                                        list={airportList}
                                        onSelect={(val) => { setFromInput(val); setActiveSuggestion(null); }}
                                    />
                                )}
                            </div>

                            {/* SWAP BUTTON */}
                            <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const temp = fromInput;
                                        setFromInput(toInput);
                                        setToInput(temp);
                                    }}
                                    className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors text-[#1e2049]"
                                >
                                    <FiRepeat className="w-4 h-4" />
                                </button>
                            </div>

                            {/* TO */}
                            <div className={`${pillSectionBase} z-[54] h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} onClick={() => setActiveSuggestion('to')}>
                                {/* Display Component */}
                                <div className="w-full pl-4 md:pl-6"> {/* Added padding for swap button clearance if needed, though centered button usually clears */}
                                    <div className={labelClass}>To</div>
                                    <div className={`text-[15px] font-bold leading-tight truncate ${toInput ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                        {toInput ? toInput.split('(')[0].trim() : "Where to?"}
                                    </div>
                                    {toInput && <div className="text-[10px] text-gray-400 truncate">{toInput.match(/\((.*?)\)/)?.[1] || ''}, {toInput.split(',')[1]?.trim() || 'Airport'}</div>}
                                </div>
                                {activeSuggestion === 'to' && (
                                    <SuggestionsDropdown
                                        initialSearch={''}
                                        list={airportList}
                                        onSelect={(val) => { setToInput(val); setActiveSuggestion(null); }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* DEPART */}
                        <div className={`${pillSectionBase} z-[53] h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} ref={departContainerRef}>
                            <div
                                className="w-full h-full flex flex-col justify-center items-start text-left cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSuggestion(null);
                                    setDepartOpen(true);
                                    setReturnOpen(false);
                                }}
                            >
                                <div className="text-[10px] font-bold text-[#E41D57] uppercase tracking-wider mb-0.5">Depart</div>
                                <div className={`text-[15px] font-bold leading-tight ${departDate && !isNaN(departDate.getTime()) ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                    {departDate && !isNaN(departDate.getTime()) ? format(departDate, "dd MMM") : 'Select Date'}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">Date from choice</div>
                            </div>
                            <DatePicker
                                selected={departDate}
                                onChange={(update, event) => {
                                    if (event) event.stopPropagation();
                                    if (tripType === 'roundTrip') {
                                        const [start, end] = update;
                                        setDepartDate(start);
                                        setReturnDate(end);
                                        if (end) setDepartOpen(false);
                                    } else {
                                        setDepartDate(update);
                                        setDepartOpen(false);
                                    }
                                }}
                                startDate={departDate}
                                endDate={returnDate}
                                selectsRange={tripType === 'roundTrip'}
                                open={departOpen}
                                onClickOutside={() => setDepartOpen(false)}
                                popperContainer={({ children }) => {
                                    if (window.innerWidth < 768) {
                                        return createPortal(children, document.body);
                                    }
                                    return departContainerRef.current ? createPortal(children, departContainerRef.current) : null;
                                }}
                                dateFormat="dd MMM"
                                className="hidden"
                                popperClassName="fresh-datepicker-popper"
                                monthsShown={tripType === 'roundTrip' && window.innerWidth >= 768 ? 2 : 1}
                                minDate={new Date()}
                                popperPlacement="bottom-start"
                                popperModifiers={[
                                    { name: "flip", enabled: false },
                                    { name: "preventOverflow", enabled: true }
                                ]}
                                renderDayContents={(day) => <span>{day}</span>}
                            />
                        </div>

                        {/* RETURN */}
                        <div className={`${pillSectionBase} z-[52] h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} ref={returnContainerRef}>
                            <div
                                className="w-full h-full flex flex-col justify-center items-start text-left cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSuggestion(null);
                                    if (tripType === 'oneWay') {
                                        setTripType('roundTrip');
                                        setTimeout(() => setReturnOpen(true), 50);
                                    } else {
                                        setDepartOpen(false);
                                        setReturnOpen(true);
                                    }
                                }}
                            >
                                <div className="text-[10px] font-bold text-[#E41D57] uppercase tracking-wider mb-0.5">Return</div>
                                {tripType === 'oneWay' ? (
                                    <div className="text-[15px] text-gray-400 font-normal leading-tight hover:text-[#E41D57]">Add return</div>
                                ) : (
                                    <div className={`text-[15px] font-bold leading-tight ${returnDate && !isNaN(returnDate.getTime()) ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                        {returnDate && !isNaN(returnDate.getTime()) ? format(returnDate, "dd MMM") : 'Select Date'}
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-400 truncate">Save more on return</div>
                            </div>
                            {tripType === 'roundTrip' && (
                                <DatePicker
                                    selected={returnDate}
                                    onChange={(date, event) => {
                                        if (event) event.stopPropagation();
                                        setReturnDate(date);
                                        setReturnOpen(false);
                                    }}
                                    startDate={departDate}
                                    endDate={returnDate}
                                    selectsEnd
                                    open={returnOpen}
                                    onClickOutside={() => setReturnOpen(false)}
                                    popperContainer={({ children }) => {
                                        if (window.innerWidth < 768) {
                                            return createPortal(children, document.body);
                                        }
                                        return returnContainerRef.current ? createPortal(children, returnContainerRef.current) : null;
                                    }}
                                    dateFormat="dd MMM"
                                    className="hidden"
                                    popperClassName="fresh-datepicker-popper"
                                    monthsShown={window.innerWidth >= 768 ? 2 : 1}
                                    minDate={departDate || new Date()}
                                    popperPlacement="bottom-start"
                                    popperModifiers={[
                                        { name: "flip", enabled: false },
                                        { name: "preventOverflow", enabled: true }
                                    ]}
                                    renderDayContents={(day) => <span>{day}</span>}
                                />
                            )}
                        </div>

                        {/* TRAVELERS */}
                        <div className={`${pillSectionBase} z-[51] h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} onClick={() => setShowTravelerModal(!showTravelerModal)}>
                            <div className={labelClass}>Travelers</div>
                            <div className="text-[15px] font-bold text-[#1e2049] truncate leading-tight">
                                {adults + children + kids + infants} Guests{cabinClass && `, ${cabinClass === 'Economy' ? 'Eco' : cabinClass === 'Business' ? 'Bus' : '1st'}`}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">{cabinClass || 'Economy'}</div>
                            {showTravelerModal && (
                                <div className="absolute top-full right-0 mt-4 w-[85vw] md:w-[340px] z-[70]" onClick={e => e.stopPropagation()}>
                                    <TravelerModalContent
                                        adults={adults} setAdults={setAdults}
                                        children={children} setChildren={setChildren}
                                        kids={kids} setKids={setKids}
                                        infants={infants} setInfants={setInfants}
                                        cabinClass={cabinClass} setCabinClass={setCabinClass}
                                        onClose={() => setShowTravelerModal(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEARCH BUTTON */}
                    <div className="flex justify-center mt-2">
                        <button onClick={handleSubmit} className="bg-[#E41D57] hover:bg-[#D41B50] text-white font-bold py-3 px-16 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 text-lg">
                            Search
                        </button>
                    </div>
                </div>
            )
            }

            {/* --- MULTI CITY LAYOUT --- */}
            {
                tripType === 'multiCity' && (
                    <div className="w-full flex flex-col gap-4 pb-8 relative">
                        {segments.map((segment, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 relative" style={{ zIndex: (segments.length - idx) * 10 }}>

                                {/* FROM & TO WRAPPER (Col 1 & 2) */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                                    {/* FROM */}
                                    <div className={`${pillSectionBase} h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} onClick={() => setActiveSuggestion(`segment_${idx}_from`)}>
                                        <div className="w-full">
                                            <div className={labelClass}>From</div>
                                            <div className={`text-[15px] font-bold leading-tight truncate ${segment.from ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                                {segment.from ? segment.from.split('(')[0].trim() : "Origin"}
                                            </div>
                                            {segment.from && <div className="text-[10px] text-gray-400 truncate">{segment.from.match(/\((.*?)\)/)?.[1] || ''}, {segment.from.split(',')[1]?.trim() || 'Airport'}</div>}
                                        </div>
                                        {activeSuggestion === `segment_${idx}_from` && (
                                            <SuggestionsDropdown
                                                initialSearch={''}
                                                list={airportList}
                                                onSelect={(val) => {
                                                    const newSegments = [...segments];
                                                    newSegments[idx].from = val;
                                                    setSegments(newSegments);
                                                    setActiveSuggestion(null);
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* SWAP BUTTON - Centered in the group */}
                                    <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newSegments = [...segments];
                                                const temp = newSegments[idx].from;
                                                newSegments[idx].from = newSegments[idx].to;
                                                newSegments[idx].to = temp;
                                                setSegments(newSegments);
                                            }}
                                            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors text-[#1e2049]"
                                        >
                                            <FiRepeat className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* TO */}
                                    <div className={`${pillSectionBase} h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white pl-4 md:pl-6`} onClick={() => setActiveSuggestion(`segment_${idx}_to`)}>
                                        <div className="w-full">
                                            <div className={labelClass}>To</div>
                                            <div className={`text-[15px] font-bold leading-tight truncate ${segment.to ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                                {segment.to ? segment.to.split('(')[0].trim() : "Destination"}
                                            </div>
                                            {segment.to && <div className="text-[10px] text-gray-400 truncate">{segment.to.match(/\((.*?)\)/)?.[1] || ''}, {segment.to.split(',')[1]?.trim() || 'Airport'}</div>}
                                        </div>
                                        {activeSuggestion === `segment_${idx}_to` && (
                                            <SuggestionsDropdown
                                                initialSearch={''}
                                                list={airportList}
                                                onSelect={(val) => {
                                                    const newSegments = [...segments];
                                                    newSegments[idx].to = val;
                                                    setSegments(newSegments);
                                                    setActiveSuggestion(null);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* DEPART */}
                                <div className={`${pillSectionBase} h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} ref={el => multiCityContainerRefs.current[idx] = el}>
                                    <div
                                        className="w-full h-full flex flex-col justify-center items-start text-left cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSuggestion(null);
                                            setMultiCityDatesOpen(prev => ({ ...prev, [idx]: true }));
                                        }}
                                    >
                                        <div className="text-[10px] font-bold text-[#E41D57] uppercase tracking-wider mb-0.5">Depart</div>
                                        <div className={`text-[15px] font-bold leading-tight ${segment.depart ? 'text-[#1e2049]' : 'text-gray-400 font-normal'}`}>
                                            {segment.depart ? format(segment.depart, "dd MMM") : 'Select Date'}
                                        </div>
                                        <div className="text-[10px] text-gray-400 truncate">Date from choice</div>
                                    </div>
                                    <DatePicker
                                        selected={segment.depart}
                                        onChange={(date, event) => {
                                            if (event) event.stopPropagation();
                                            const newSegments = [...segments];
                                            newSegments[idx].depart = date;
                                            setSegments(newSegments);
                                            setMultiCityDatesOpen(prev => ({ ...prev, [idx]: false }));
                                            setActiveSuggestion(null);
                                        }}
                                        open={multiCityDatesOpen[idx] || false}
                                        onClickOutside={() => setMultiCityDatesOpen(prev => ({ ...prev, [idx]: false }))}
                                        popperContainer={({ children }) => {
                                            if (window.innerWidth < 768) {
                                                return createPortal(children, document.body);
                                            }
                                            return multiCityContainerRefs.current[idx] ? createPortal(children, multiCityContainerRefs.current[idx]) : null;
                                        }}
                                        className="hidden"
                                        popperClassName="fresh-datepicker-popper"
                                        monthsShown={1}
                                        minDate={new Date()}
                                        popperPlacement="bottom-start"
                                        popperModifiers={[
                                            { name: "flip", enabled: false },
                                            { name: "preventOverflow", enabled: true }
                                        ]}
                                        renderDayContents={(day) => <span>{day}</span>}
                                    />
                                </div>

                                {/* COL 4: TRAVELERS (Row 0) or ACTIONS (Row > 0) */}
                                {idx === 0 ? (
                                    <div className={`${pillSectionBase} h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white`} onClick={() => setShowTravelerModal(!showTravelerModal)}>
                                        <div className={labelClass}>Travelers</div>
                                        <div className="text-[15px] font-bold text-[#1e2049] truncate leading-tight">
                                            {adults + children + kids + infants} Guests{cabinClass && `, ${cabinClass === 'Economy' ? 'Eco' : cabinClass === 'Business' ? 'Bus' : '1st'}`}
                                        </div>
                                        <div className="text-[10px] text-gray-400 truncate">{cabinClass || 'Economy'}</div>
                                        {showTravelerModal && (
                                            <div className="absolute top-full right-0 mt-4 w-[85vw] md:w-[340px] z-[70]" onClick={e => e.stopPropagation()}>
                                                <TravelerModalContent
                                                    adults={adults} setAdults={setAdults}
                                                    children={children} setChildren={setChildren}
                                                    kids={kids} setKids={setKids}
                                                    infants={infants} setInfants={setInfants}
                                                    cabinClass={cabinClass} setCabinClass={setCabinClass}
                                                    onClose={() => setShowTravelerModal(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-24 flex items-center gap-2">
                                        {/* If it's the last segment, show 'Add City' button occupying space? Or just Actions? */}
                                        {/* If we want 'Add Another City' box here as per screenshot */}
                                        {idx === segments.length - 1 ? (
                                            <div
                                                className={`${pillSectionBase} flex-1 h-24 border border-gray-200 rounded-xl hover:border-gray-300 bg-white flex flex-row items-center justify-center gap-2`}
                                                onClick={() => setSegments([...segments, { from: '', to: '', depart: null }])}
                                            >
                                                <FiPlus className="text-[#1e2049]" />
                                                <span className="text-[#1e2049] font-bold text-sm">Add Another City</span>
                                            </div>
                                        ) : (
                                            <div className="flex-1"></div> /* Spacer */
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => {
                                                const newSegments = segments.filter((_, i) => i !== idx);
                                                setSegments(newSegments);
                                            }}
                                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                            title="Remove Flight"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* SEARCH BUTTON (Centered) */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleSubmit}
                                className="bg-[#E41D57] hover:bg-[#D41B50] text-white px-16 py-3 rounded-xl shadow-lg shadow-[#E41D57]/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 text-xl font-bold"
                            >
                                <span className="hidden md:inline">Search</span>
                                <span className="md:hidden">Search</span>
                            </button>
                        </div>

                    </div>
                )
            }
        </div >
    );
};

// --- SUBCOMPONENTS ---

const SuggestionsDropdown = ({ initialSearch, list, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
    }, []);

    const filteredList = list.filter(a => {
        if (!a) return false;
        if (!searchTerm) return true; // Show all if empty
        const lower = searchTerm.toLowerCase();
        return (
            (a.code && a.code.toLowerCase().includes(lower)) ||
            (a.name && a.name.toLowerCase().includes(lower)) ||
            (a.shortName && a.shortName.toLowerCase().includes(lower))
        );
    }).slice(0, 10);

    return (
        <div className="absolute top-full left-0 mt-4 w-[85vw] md:w-[350px] bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden py-2 z-[600]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-2 border-b border-gray-100 flex items-center gap-2">
                <FiSearch className="text-gray-400 w-4 h-4" />
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search"
                    className="w-full text-sm text-gray-700 placeholder:text-gray-400 outline-none font-medium"
                />
            </div>
            <div className="max-h-80 overflow-y-auto">
                {filteredList.map((a, idx) => (
                    <div
                        key={idx}
                        className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => onSelect(`${a.shortName} (${a.code})`)}
                    >
                        <div>
                            <div className="text-sm font-bold text-gray-900">{a.shortName}</div>
                            <div className="text-xs text-gray-500">{a.name}</div>
                        </div>
                        <span className="text-[10px] font-bold text-white bg-[#E41D57] px-1.5 py-0.5 rounded">{a.code}</span>
                    </div>
                ))}
                {filteredList.length === 0 && <div className="p-5 text-sm text-gray-400 text-center">No results found</div>}
            </div>
        </div>
    );
};

const TravelerModalContent = ({ adults, setAdults, children, setChildren, kids, setKids, infants, setInfants, cabinClass, setCabinClass, onClose }) => (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 cursor-default text-left">
        <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-xl text-gray-900">Travelers</h4>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="space-y-5 mb-8">
            <CounterRow label="Adults" sub="12+ yrs" value={adults} setValue={setAdults} min={1} max={9} />
            <CounterRow label="Children" sub="5-11 yrs" value={children} setValue={setChildren} min={0} max={9} />
            <CounterRow label="Kids" sub="2-5 yrs" value={kids} setValue={setKids} min={0} max={9} />
            <CounterRow label="Infants" sub="< 2 yrs" value={infants} setValue={setInfants} min={0} max={9} />
        </div>
        <div className="border-t border-gray-100 pt-6">
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-500">Cabin Class</h4>
            <div className="grid grid-cols-3 gap-3">
                {['Economy', 'Business', 'First Class'].map((c) => (
                    <button key={c} onClick={() => setCabinClass(prev => prev === c ? '' : c)} className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all border ${cabinClass === c ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}>{c}</button>
                ))}
            </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
            <button onClick={onClose} className="bg-[#E41D57] text-white font-bold py-3 px-8 rounded-full text-sm hover:bg-[#c01b4b] transition-all shadow-lg shadow-[#E41D57]/30">Apply</button>
        </div>
    </div>
);

const CounterRow = ({ label, sub, value, setValue, min, max }) => (
    <div className="flex justify-between items-center">
        <div><div className="text-base font-bold text-gray-900">{label}</div><div className="text-sm text-gray-500">{sub}</div></div>
        <div className="flex items-center gap-4">
            <button onClick={() => setValue(Math.max(min, value - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center" disabled={value <= min}><FiMinus className="w-3 h-3" /></button>
            <div className="flex font-bold text-gray-900 border border-gray-200 rounded-full px-3 py-1 text-sm">{value}</div>
            <button onClick={() => setValue(Math.min(max, value + 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center" disabled={value >= max}><FiPlus className="w-3 h-3" /></button>
        </div>
    </div>
);

// CustomDateInput is no longer used, removed to avoid confusion.

export default FlightSearchForm;
