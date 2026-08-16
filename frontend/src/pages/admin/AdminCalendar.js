import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, 
  FiHome, FiRotateCw, FiCheck, FiX, FiCopy,
  FiSearch, FiFilter, FiChevronDown
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, addDays, subDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Reusable Searchable Dropdown Component for Property & Host filtering
const SearchableSelect = ({ options, value, onChange, placeholder, className, isHeader = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    const selectedOption = options.find(o => String(o.id) === String(value));

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter(o => o.name.toLowerCase().includes(q));
    }, [options, search]);

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={`relative inline-block ${className || ''}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={
                    isHeader
                        ? "flex items-center gap-1.5 text-sm font-bold text-[#004e59] bg-transparent hover:bg-gray-100/60 px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 transition-all focus:outline-none cursor-pointer max-w-[280px] sm:max-w-md truncate"
                        : "flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100/80 border border-gray-200 rounded-lg focus:outline-none shadow-sm min-w-[140px] max-w-[200px] truncate cursor-pointer"
                }
            >
                <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
                <FiChevronDown size={14} className={isHeader ? "text-[#004e59] shrink-0" : "text-gray-400 shrink-0"} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-1 z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5 space-y-2 animate-fade-in">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#004e59]"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                        <div
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className={`px-3 py-2 text-xs font-extrabold cursor-pointer rounded-xl transition-colors ${!value ? 'bg-[#004e59]/10 text-[#004e59]' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            {placeholder}
                        </div>
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-xs text-gray-400 font-medium">No results matching "{search}"</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`px-3 py-2 text-xs font-bold cursor-pointer rounded-xl transition-colors truncate ${String(value) === String(opt.id) ? 'bg-[#004e59]/10 text-[#004e59]' : 'text-gray-700 hover:bg-gray-50'}`}
                                    title={opt.name}
                                >
                                    {opt.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminCalendar = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
    const [visibleDaysCount, setVisibleDaysCount] = useState(14);
    const [propertyFilter, setPropertyFilter] = useState('');
    const [hostFilter, setHostFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProperties, setExpandedProperties] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [copiedRef, setCopiedRef] = useState(false);

    // Responsive visible days count
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setVisibleDaysCount(7);
            } else if (width < 1024) {
                setVisibleDaysCount(10);
            } else {
                setVisibleDaysCount(14);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format dates range for the grid headers
    const rangeDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < visibleDaysCount; i++) {
            dates.push(addDays(startDate, i));
        }
        return dates;
    }, [startDate, visibleDaysCount]);

    const rangeEndDate = rangeDates[rangeDates.length - 1];
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(addDays(rangeEndDate, 1), 'yyyy-MM-dd');

    // Fetch master calendar data matrix from backend
    const { data: matrixData, isLoading, refetch } = useQuery(
        ['admin-calendar-matrix', formattedStartDate, formattedEndDate, propertyFilter, hostFilter, statusFilter, searchTerm],
        async () => {
            const params = new URLSearchParams({
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                ...(propertyFilter && { property_id: propertyFilter }),
                ...(hostFilter && { host_id: hostFilter }),
                ...(statusFilter && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await api.get(`/admin/calendar/matrix?${params.toString()}`);
            return response.data?.data || {};
        },
        { refetchOnWindowFocus: false, keepPreviousData: true }
    );

    const properties = matrixData?.properties || [];
    const bookings = matrixData?.bookings || [];
    const summary = matrixData?.summary || {};

    // Persistent master dropdown lists so options NEVER disappear when a host with 0 properties is selected
    const [masterProperties, setMasterProperties] = useState([]);
    const [masterHosts, setMasterHosts] = useState([]);

    useEffect(() => {
        if (matrixData?.allProperties && matrixData.allProperties.length > 0) {
            setMasterProperties(matrixData.allProperties);
        } else if (matrixData?.properties && matrixData.properties.length > 0 && masterProperties.length === 0) {
            setMasterProperties(matrixData.properties);
        }
    }, [matrixData?.allProperties, matrixData?.properties]);

    useEffect(() => {
        if (matrixData?.hosts && matrixData.hosts.length > 0) {
            setMasterHosts(matrixData.hosts);
        }
    }, [matrixData?.hosts]);

    const propertyOptions = useMemo(() => {
        const list = masterProperties.length > 0 ? masterProperties : (matrixData?.allProperties || matrixData?.properties || []);
        return list.map(p => ({ id: p.id, name: p.title }));
    }, [masterProperties, matrixData?.allProperties, matrixData?.properties]);

    const hostOptions = useMemo(() => {
        const list = masterHosts.length > 0 ? masterHosts : (matrixData?.hosts || []);
        return list.map(h => ({ id: h.id, name: h.name }));
    }, [masterHosts, matrixData?.hosts]);

    // Auto-expand all properties by default
    useEffect(() => {
        if (properties.length > 0) {
            const initialMap = {};
            properties.forEach(p => {
                initialMap[p.id] = true;
            });
            setExpandedProperties(prev => ({ ...initialMap, ...prev }));
        }
    }, [properties]);

    const toggleGroup = (propId) => {
        setExpandedProperties(prev => ({
            ...prev,
            [propId]: !prev[propId]
        }));
    };

    const shiftDate = (days) => {
        setStartDate(prev => days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days)));
    };

    const resetToToday = () => {
        setStartDate(startOfDay(new Date()));
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 5 || day === 6; // Friday = 5, Saturday = 6
    };

    const isToday = (date) => {
        return isSameDay(date, new Date());
    };

    const getStatusStyle = (status) => {
        const s = String(status || '').toLowerCase();
        switch (s) {
            case 'pending':
                return 'bg-yellow-500/10 border border-yellow-500/20 border-l-4 border-l-yellow-500 text-yellow-800 hover:bg-yellow-500/15 shadow-sm';
            case 'request_accepted':
                return 'bg-indigo-600/10 border border-indigo-600/20 border-l-4 border-l-indigo-600 text-indigo-800 hover:bg-indigo-600/15 shadow-sm';
            case 'confirmed':
                return 'bg-[#004e59]/10 border border-[#004e59]/20 border-l-4 border-l-[#004e59] text-[#004e59] hover:bg-[#004e59]/15 shadow-sm';
            case 'checked_in':
                return 'bg-[#10b981]/10 border border-[#10b981]/20 border-l-4 border-l-[#10b981] text-[#047857] hover:bg-[#10b981]/15 shadow-sm';
            case 'checked_out':
            case 'completed':
                return 'bg-gray-500/10 border border-gray-500/20 border-l-4 border-l-gray-500 text-gray-800 hover:bg-gray-500/15 shadow-sm';
            default:
                return 'bg-gray-400/10 border border-gray-400/20 border-l-4 border-l-gray-400 text-gray-700 hover:bg-gray-400/15';
        }
    };

    // Calculate booking position over the timeline grid
    const getBookingSpan = (booking) => {
        const ci = startOfDay(new Date(booking.check_in_date));
        const co = startOfDay(new Date(booking.check_out_date));
        
        if (co <= rangeDates[0] || ci >= addDays(rangeEndDate, 1)) {
            return null;
        }

        let startIndex = 0;
        if (ci > rangeDates[0]) {
            const diffTime = ci - rangeDates[0];
            startIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));
        }

        let endIndex = visibleDaysCount;
        if (co <= addDays(rangeEndDate, 1)) {
            const diffTime = co - rangeDates[0];
            endIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));
        }

        startIndex = Math.max(0, Math.min(visibleDaysCount - 1, startIndex));
        endIndex = Math.max(1, Math.min(visibleDaysCount, endIndex));

        if (startIndex >= endIndex) return null;

        const leftOffset = (startIndex / visibleDaysCount) * 100;
        const width = ((endIndex - startIndex) / visibleDaysCount) * 100;

        return {
            left: `calc(${leftOffset}% + 3px)`,
            width: `calc(${width}% - 6px)`,
            guestName: booking.guest_name || 'Guest',
            ref: booking.booking_reference,
            status: booking.status,
            nights: Math.ceil(Math.abs(co - ci) / (1000 * 60 * 60 * 24)),
            checkIn: format(ci, 'MMM dd'),
            checkOut: format(co, 'MMM dd'),
            total: booking.total_amount,
            rawBooking: booking
        };
    };

    const handleCopyRef = (ref, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(ref);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-4 sm:p-6 max-w-[1700px] mx-auto bg-[#f8fafc] min-h-screen space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Timeline Calendar</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1.5">
                        <div className="flex items-center gap-1.5">
                            <FiHome className="flex-shrink-0 text-gray-400" />
                            <span className="font-semibold text-gray-700">Property:</span>
                        </div>

                        {/* Searchable Property Switcher Dropdown */}
                        <SearchableSelect
                            options={propertyOptions}
                            value={propertyFilter}
                            onChange={setPropertyFilter}
                            placeholder={`All Properties (${properties.length})`}
                            isHeader={true}
                        />
                    </div>
                </div>

                {/* Dynamic Executive Summary Badges */}
                <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-150 shadow-sm text-xs font-semibold">
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Rooms:</span>
                        <span className="font-black text-gray-900">{summary.totalRooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stays:</span>
                        <span className="font-black text-[#004e59]">{summary.totalBookings || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Occupancy:</span>
                        <span className="font-black text-emerald-600">{summary.occupancyRate || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Revenue:</span>
                        <span className="font-black text-gray-900 font-mono">৳{Number(summary.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Commission:</span>
                        <span className="font-black text-indigo-650 font-mono">৳{Number(summary.totalCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Status Badges & Refresh */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 bg-white px-4 py-2.5 rounded-xl border border-gray-150 shadow-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded border border-[#004e59]/30 border-l-4 border-l-[#004e59] bg-[#004e59]/15 inline-block"></span>
                            Confirmed
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded border border-[#10b981]/30 border-l-4 border-l-[#10b981] bg-[#10b981]/15 inline-block"></span>
                            Checked In
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded border border-yellow-500/30 border-l-4 border-l-yellow-500 bg-yellow-500/15 inline-block"></span>
                            Pending
                        </span>
                    </div>

                    <button 
                        onClick={() => refetch()}
                        className="p-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition flex items-center justify-center shrink-0 shadow-sm"
                        title="Refresh calendar"
                    >
                        <FiRotateCw />
                    </button>
                </div>
            </div>

            {/* Date Range & Controls Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-700">
                    Displaying from <strong className="text-[#004e59] font-bold">{format(startDate, 'MMM dd')}</strong> to <strong className="text-[#004e59] font-bold">{format(rangeEndDate, 'MMM dd, yyyy')}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Live Search Input */}
                    <div className="relative">
                        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search property / host / guest..."
                            className="pl-8 pr-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-gray-50/50 w-44 sm:w-56 focus:outline-none focus:border-[#004e59]"
                        />
                    </div>

                    {/* Searchable Host Filter */}
                    <SearchableSelect
                        options={hostOptions}
                        value={hostFilter}
                        onChange={setHostFilter}
                        placeholder="All Hosts"
                    />

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-gray-50/50 cursor-pointer focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="pending">Pending</option>
                    </select>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                        <button 
                            onClick={() => shiftDate(-visibleDaysCount)}
                            className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                            title={`${visibleDaysCount} days backward`}
                        >
                            <FiChevronsLeft size={14} />
                        </button>
                        <button 
                            onClick={() => shiftDate(-1)}
                            className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                            title="1 day backward"
                        >
                            <FiChevronLeft size={14} />
                        </button>

                        <div className="relative">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => date && setStartDate(startOfDay(date))}
                                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-bold text-center cursor-pointer w-28 bg-white"
                                dateFormat="yyyy-MM-dd"
                            />
                            <button 
                                onClick={resetToToday}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#004e59] font-bold bg-white pl-1"
                                title="Reset to today"
                            >
                                Today
                            </button>
                        </div>

                        <button 
                            onClick={() => shiftDate(1)}
                            className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                            title="1 day forward"
                        >
                            <FiChevronRight size={14} />
                        </button>
                        <button 
                            onClick={() => shiftDate(visibleDaysCount)}
                            className="p-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                            title={`${visibleDaysCount} days forward`}
                        >
                            <FiChevronsRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline Calendar Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[950px]">
                        {/* Table Header */}
                        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
                            {/* Room Header Col */}
                            <div className="w-44 sm:w-60 p-3 sm:p-4 flex items-center shrink-0 border-r border-gray-200 bg-gray-50 font-black tracking-wide uppercase">
                                ROOMS
                            </div>

                            {/* Days Header Cols */}
                            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${visibleDaysCount}, minmax(0, 1fr))` }}>
                                {rangeDates.map((date, idx) => {
                                    const wknd = isWeekend(date);
                                    const tday = isToday(date);
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`p-3 text-center border-r border-gray-200/60 flex flex-col justify-center gap-0.5 relative ${
                                                wknd ? 'bg-red-50/20 text-red-500 font-extrabold' : ''
                                            } ${tday ? 'bg-[#004e59]/10' : ''}`}
                                        >
                                            <span className="text-[10px] uppercase font-bold text-gray-400">{format(date, 'EEE')}</span>
                                            <span className={`text-xs font-black ${wknd ? 'text-red-500' : 'text-gray-800'}`}>{format(date, 'dd MMM')}</span>
                                            {tday && (
                                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#004e59] rounded-full animate-pulse"></span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Room Categories & Rows */}
                        <div className="divide-y divide-gray-100">
                            {properties.length === 0 ? (
                                <div className="p-16 text-center text-gray-500 font-semibold">
                                    No properties or rooms match the selected filters.
                                </div>
                            ) : (
                                properties.map((property) => {
                                    const isExpanded = !!expandedProperties[property.id];
                                    const propRooms = property.rooms || [];

                                    return (
                                        <div key={property.id} className="bg-white">
                                            {/* Category / Property Header Row */}
                                            <button 
                                                onClick={() => toggleGroup(property.id)}
                                                className="w-full flex items-center px-4 py-3 bg-gray-50/80 hover:bg-gray-100/70 border-b border-gray-150 transition-colors text-left"
                                            >
                                                <span className="mr-2 text-gray-400 shrink-0">
                                                    {isExpanded ? (
                                                        <svg className="w-4 h-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className="text-xs font-black text-gray-800 uppercase tracking-wider truncate max-w-md">
                                                    {property.title}
                                                </span>
                                                <span className="ml-2 px-2 py-0.5 bg-gray-200/70 text-[9px] font-bold text-gray-600 rounded-md">
                                                    {propRooms.length} {property.is_hms_enabled ? 'Rooms' : 'Unit'}
                                                </span>
                                                {property.host_name && (
                                                    <span className="ml-auto text-[10px] text-gray-400 font-medium hidden sm:inline">
                                                        Host: <strong className="text-gray-600 font-bold">{property.host_name}</strong>
                                                    </span>
                                                )}
                                            </button>

                                            {/* Property Rooms Rows */}
                                            {isExpanded && (
                                                <div className="divide-y divide-gray-100">
                                                    {propRooms.map((room) => {
                                                        const roomBookings = bookings.filter(b => {
                                                            if (room.id) {
                                                                return Number(b.hms_room_id) === Number(room.id);
                                                            } else {
                                                                return Number(b.property_id) === Number(property.id) && !b.hms_room_id;
                                                            }
                                                        });

                                                        return (
                                                            <div key={room.id || `prop-${property.id}`} className="flex h-[68px] hover:bg-gray-50/30 transition-colors">
                                                                {/* Left Room Info Column */}
                                                                <div className="w-44 sm:w-60 p-3 sm:p-4 border-r border-gray-200 flex flex-col justify-center shrink-0 bg-gray-50/20">
                                                                    <div className="font-extrabold text-xs sm:text-sm text-gray-850 truncate" title={room.room_number}>
                                                                        {room.room_number === 'Entire Listing' ? 'Entire Unit Listing' : `Room ${room.room_number}`}
                                                                    </div>
                                                                    <div className="text-[9px] sm:text-[10px] text-gray-450 mt-0.5 uppercase font-bold tracking-wide truncate">
                                                                        {room.room_type || 'Standard'} • BDT {Number(room.price || property.price_per_night || 0).toLocaleString('en-IN')}
                                                                    </div>
                                                                </div>

                                                                {/* Right Timeline Grid Cells */}
                                                                <div className="flex-1 relative">
                                                                    <div className="absolute inset-0 grid h-full" style={{ gridTemplateColumns: `repeat(${visibleDaysCount}, minmax(0, 1fr))` }}>
                                                                        {rangeDates.map((date, idx) => {
                                                                            const wknd = isWeekend(date);
                                                                            const tday = isToday(date);
                                                                            return (
                                                                                <div 
                                                                                    key={idx} 
                                                                                    className={`h-full border-r border-gray-200/50 relative ${
                                                                                        wknd ? 'bg-red-50/10' : ''
                                                                                    } ${tday ? 'bg-[#004e59]/10' : ''}`}
                                                                                >
                                                                                    {/* Faint Day Number in cell */}
                                                                                    <span className="absolute bottom-1 right-2 text-[10px] font-bold text-gray-400 pointer-events-none select-none">
                                                                                        {format(date, 'd')}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* Booking Pill Bars */}
                                                                    {roomBookings.map((booking) => {
                                                                        const span = getBookingSpan(booking);
                                                                        if (!span) return null;

                                                                        return (
                                                                            <div
                                                                                key={booking.id}
                                                                                style={{ 
                                                                                    left: span.left, 
                                                                                    width: span.width,
                                                                                    top: '8px',
                                                                                    height: '38px'
                                                                                }}
                                                                                onClick={() => setSelectedBooking(booking)}
                                                                                className={`absolute z-10 rounded-lg px-3 flex items-center select-none cursor-pointer transition-all active:scale-[0.98] ${getStatusStyle(span.status)}`}
                                                                                title={`${span.guestName} (${span.ref})\nStay: ${span.checkIn} - ${span.checkOut} (${span.nights} nights)\nStatus: ${span.status.toUpperCase()} • BDT ${span.total}`}
                                                                            >
                                                                                <span className="font-bold text-xs truncate">
                                                                                    {span.guestName}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Quick Detail Modal */}
            {selectedBooking && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div 
                        className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">Reservation Details</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <h3 className="text-base font-black text-gray-900 font-mono">{selectedBooking.booking_reference}</h3>
                                    <button 
                                        onClick={(e) => handleCopyRef(selectedBooking.booking_reference, e)}
                                        className="text-gray-400 hover:text-gray-700 p-0.5"
                                        title="Copy Reference"
                                    >
                                        {copiedRef ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={13} />}
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${getStatusStyle(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                    Source: <strong className="text-gray-700 capitalize">{selectedBooking.source || 'Online Direct'}</strong>
                                </span>
                            </div>

                            {/* Guest Info Box */}
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-150 space-y-1.5">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Guest Details</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">{selectedBooking.guest_name}</span>
                                    <span className="text-xs font-mono text-gray-600">{selectedBooking.guest_phone || 'No phone'}</span>
                                </div>
                                {selectedBooking.guest_email && (
                                    <span className="text-xs text-gray-500 block truncate">{selectedBooking.guest_email}</span>
                                )}
                            </div>

                            {/* Property & Stay Grid */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Property</span>
                                    <span className="font-bold text-gray-800 block mt-0.5 line-clamp-1">{selectedBooking.property_title}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Room Unit</span>
                                    <span className="font-bold text-gray-800 block mt-0.5">
                                        {selectedBooking.room_number ? `Room ${selectedBooking.room_number} (${selectedBooking.room_type || ''})` : 'Entire Unit Listing'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Check In</span>
                                    <span className="font-bold text-[#004e59] block mt-0.5 font-mono">
                                        {format(parseISO(selectedBooking.check_in_date), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Check Out</span>
                                    <span className="font-bold text-[#004e59] block mt-0.5 font-mono">
                                        {format(parseISO(selectedBooking.check_out_date), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Info Box */}
                            <div className="bg-[#004e59]/5 rounded-2xl p-4 border border-[#004e59]/15 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold text-[#004e59] uppercase tracking-wider block">Total Amount</span>
                                    <span className="text-base font-black text-gray-900 mt-0.5 block font-mono">
                                        ৳{Number(selectedBooking.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-extrabold text-[#004e59] uppercase tracking-wider block">Admin Commission</span>
                                    <span className="text-sm font-black text-emerald-700 mt-0.5 block font-mono">
                                        ৳{Number(selectedBooking.admin_commission_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <button 
                                onClick={() => navigate('/admin/bookings')}
                                className="text-xs font-bold text-[#004e59] hover:underline flex items-center gap-1"
                            >
                                View Bookings Panel
                            </button>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 bg-[#004e59] hover:bg-[#004e59]/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;
