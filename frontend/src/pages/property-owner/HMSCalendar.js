import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, 
  FiHome, FiCalendar, FiRotateCw, FiInfo, FiCheck, FiUser, FiX
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, addDays, subDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const HMSCalendar = () => {
    const navigate = useNavigate();
    const { showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [startDate, setStartDate] = useState(() => startOfDay(new Date()));
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [visibleDaysCount, setVisibleDaysCount] = useState(14);

    // Responsive visible days count based on screen width
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setVisibleDaysCount(4);  // Mobile
            } else if (width < 1024) {
                setVisibleDaysCount(7);  // Tablet
            } else {
                setVisibleDaysCount(14); // Desktop
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Date range helper
    const getRangeDates = (start, count) => {
        const dates = [];
        for (let i = 0; i < count; i++) {
            dates.push(addDays(start, i));
        }
        return dates;
    };

    const rangeDates = getRangeDates(startDate, visibleDaysCount);
    const rangeEndDate = rangeDates[visibleDaysCount - 1];

    // Fetch HMS properties
    const { data: properties, isLoading: isLoadingProperties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    // Synchronize selected property with local storage
    useEffect(() => {
        if (properties?.length > 0) {
            const savedId = localStorage.getItem('hms_selected_property_id');
            const parsedSavedId = savedId ? parseInt(savedId) : null;
            const exists = properties.some(p => p.id === parsedSavedId);
            
            if (exists && parsedSavedId) {
                setSelectedPropertyId(parsedSavedId);
            } else {
                setSelectedPropertyId(properties[0].id);
                localStorage.setItem('hms_selected_property_id', properties[0].id);
                localStorage.setItem('hms_selected_property_type', properties[0].property_type || 'hotel');
            }
        }
    }, [properties]);

    useEffect(() => {
        const handlePropertyChange = () => {
            const savedId = localStorage.getItem('hms_selected_property_id');
            if (savedId) {
                setSelectedPropertyId(parseInt(savedId));
            }
        };
        window.addEventListener('hmsPropertyChange', handlePropertyChange);
        return () => window.removeEventListener('hmsPropertyChange', handlePropertyChange);
    }, []);

    const handlePropertyChange = (val) => {
        const newId = parseInt(val);
        setSelectedPropertyId(newId);
        localStorage.setItem('hms_selected_property_id', newId);
        const prop = properties?.find(p => p.id === newId);
        if (prop) {
            localStorage.setItem('hms_selected_property_type', prop.property_type || 'hotel');
            window.dispatchEvent(new Event('hmsPropertyChange'));
        }
    };

    // Fetch rooms
    const { data: rooms, isLoading: isLoadingRooms } = useQuery(
        ['hms-rooms', selectedPropertyId],
        () => api.get(`/property-owner/hms/rooms/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (response) => response.data?.data?.rooms || []
        }
    );

    // Fetch reservations
    const { data: reservations, isLoading: isLoadingReservations, refetch: refetchReservations } = useQuery(
        ['hms-reservations', selectedPropertyId],
        () => api.get(`/property-owner/hms/reservations/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (response) => response.data?.data?.reservations || []
        }
    );

    // Filter out cancelled bookings
    const activeReservations = (reservations || []).filter(r => r.status !== 'cancelled');

    console.log('[HMSCalendar] Debug Info:', {
        selectedPropertyId,
        propertiesCount: properties?.length,
        roomsCount: rooms?.length,
        reservationsCount: reservations?.length,
        activeReservationsCount: activeReservations?.length,
        properties,
        rooms,
        reservations,
        activeReservations
    });

    // Group rooms by room_type
    const getGroupedRooms = () => {
        if (!rooms) return {};
        const groups = {};
        rooms.forEach(room => {
            const type = room.room_type || 'Uncategorized';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(room);
        });

        // Check if there are any active reservations that do not match any room in rooms
        const hasUnassigned = activeReservations.some(
            res => !rooms.some(r => Number(res.hms_room_id) === Number(r.id))
        );

        if (hasUnassigned) {
            groups['Unassigned / Pending Assignment'] = [{
                id: 'unassigned',
                room_number: 'Unassigned',
                room_type: 'Pending Assignment',
                floor: '-',
                price: 0,
                status: 'available'
            }];
        }

        return groups;
    };

    const groupedRooms = getGroupedRooms();

    // Auto-expand all groups on first load
    useEffect(() => {
        if (rooms && Object.keys(groupedRooms).length > 0) {
            const initialExpanded = {};
            Object.keys(groupedRooms).forEach(key => {
                initialExpanded[key] = true;
            });
            setExpandedGroups(initialExpanded);
        }
    }, [rooms]);

    const toggleGroup = (type) => {
        setExpandedGroups(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    // Date navigation helpers
    const shiftDate = (days) => {
        setStartDate(prev => addDays(prev, days));
    };

    const resetToToday = () => {
        setStartDate(startOfDay(new Date()));
    };

    const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
    const propertyType = selectedProperty?.property_type || 'hotel';

    const getTerminology = (propType) => {
        const type = (propType || '').toLowerCase();
        if (type.includes('apartment') || type.includes('flat') || type.includes('building')) {
            return {
                room: 'Flat',
                rooms: 'Flats',
                roomNo: 'Flat No.',
                roomType: 'Flat Type',
                roomSingular: 'flat'
            };
        } else if (type.includes('villa') || type.includes('house') || type.includes('resort')) {
            return {
                room: 'Unit',
                rooms: 'Units',
                roomNo: 'Unit No.',
                roomType: 'Unit Type',
                roomSingular: 'unit'
            };
        }
        return {
            room: 'Room',
            rooms: 'Rooms',
            roomNo: 'Room No.',
            roomType: 'Room Type',
            roomSingular: 'room'
        };
    };
    
    const terms = getTerminology(propertyType);

    // Check if a day is weekend (Friday or Saturday in BD/South Asia)
    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 5 || day === 6; // Friday = 5, Saturday = 6
    };

    const isToday = (date) => {
        return isSameDay(date, new Date());
    };

    const getStatusStyle = (status, bookingType) => {
        if (bookingType === 'monthly') {
            const styles = {
                pending: 'bg-purple-500/10 border border-purple-500/20 border-l-4 border-l-purple-500 text-purple-900 hover:bg-purple-500/15 shadow-sm',
                request_accepted: 'bg-purple-600/10 border border-purple-600/20 border-l-4 border-l-purple-600 text-purple-900 hover:bg-purple-600/15 shadow-sm',
                confirmed: 'bg-purple-700/10 border border-purple-700/20 border-l-4 border-l-purple-700 text-purple-950 hover:bg-purple-700/15 shadow-sm',
                checked_in: 'bg-purple-800/10 border border-purple-800/20 border-l-4 border-l-purple-800 text-purple-950 hover:bg-purple-800/15 shadow-sm',
                checked_out: 'bg-gray-500/10 border border-gray-500/20 border-l-4 border-l-gray-500 text-gray-800 hover:bg-gray-500/15 shadow-sm',
            };
            return styles[status] || 'bg-purple-400/10 border border-purple-400/20 border-l-4 border-l-purple-400 text-purple-900 hover:bg-purple-400/15';
        }
        const styles = {
            pending: 'bg-yellow-500/10 border border-yellow-500/20 border-l-4 border-l-yellow-500 text-yellow-800 hover:bg-yellow-500/15 shadow-sm',
            request_accepted: 'bg-indigo-600/10 border border-indigo-600/20 border-l-4 border-l-indigo-600 text-indigo-800 hover:bg-indigo-600/15 shadow-sm',
            confirmed: 'bg-[#004e59]/10 border border-[#004e59]/20 border-l-4 border-l-[#004e59] text-[#004e59] hover:bg-[#004e59]/15 shadow-sm',
            checked_in: 'bg-[#10b981]/10 border border-[#10b981]/20 border-l-4 border-l-[#10b981] text-[#047857] hover:bg-[#10b981]/15 shadow-sm',
            checked_out: 'bg-gray-500/10 border border-gray-500/20 border-l-4 border-l-gray-500 text-gray-800 hover:bg-gray-500/15 shadow-sm',
        };
        return styles[status] || 'bg-gray-400/10 border border-gray-400/20 border-l-4 border-l-gray-400 text-gray-700 hover:bg-gray-400/15';
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            request_accepted: 'bg-indigo-50 text-indigo-800 border-indigo-200',
            confirmed: 'bg-[#004e59]/10 text-[#004e59] border border-[#004e59]/20',
            checked_in: 'bg-[#10b981]/10 text-[#047857] border border-[#10b981]/20',
            checked_out: 'bg-gray-50 text-gray-800 border border-gray-200',
            cancelled: 'bg-rose-50 text-rose-700 border border-rose-200'
        };
        return styles[status] || 'bg-gray-50 text-gray-800 border border-gray-150';
    };

    // Calculate booking span position over the 14-day grid
    const getBookingSpan = (booking) => {
        // Format check_in/out to match range dates
        const ci = startOfDay(new Date(booking.check_in_date));
        const co = startOfDay(new Date(booking.check_out_date));
        
        // If booking checkout is before our start date, or checkin is after our end date, it's out of bounds
        if (co <= rangeDates[0] || ci >= addDays(rangeEndDate, 1)) {
            return null;
        }

        // Calculate startIndex within range
        let startIndex = 0;
        if (ci > rangeDates[0]) {
            // Find index of the check_in date
            const diffTime = ci - rangeDates[0];
            startIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));
        }

        // Calculate endIndex within range
        let endIndex = visibleDaysCount;
        if (co <= addDays(rangeEndDate, 1)) {
            // Find index of check_out date
            const diffTime = co - rangeDates[0];
            endIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));
        }

        // Constraints safeguard
        startIndex = Math.max(0, Math.min(visibleDaysCount - 1, startIndex));
        endIndex = Math.max(1, Math.min(visibleDaysCount, endIndex));

        if (startIndex >= endIndex) return null;

        const leftOffset = (startIndex / visibleDaysCount) * 100;
        const width = ((endIndex - startIndex) / visibleDaysCount) * 100;

        return {
            left: `calc(${leftOffset}% + 3px)`,
            width: `calc(${width}% - 6px)`,
            guestName: booking.guest_name || (booking.guest_first_name ? `${booking.guest_first_name} ${booking.guest_last_name || ''}`.trim() : 'Guest'),
            ref: booking.booking_reference,
            status: booking.status,
            paymentStatus: booking.payment_status,
            nights: booking.nights || Math.ceil(Math.abs(co - ci) / (1000 * 60 * 60 * 24)),
            checkIn: format(ci, 'MMM dd'),
            checkOut: format(co, 'MMM dd'),
            checkInFull: format(ci, 'MMM dd, yyyy'),
            checkOutFull: format(co, 'MMM dd, yyyy'),
            checkInDateFull: format(ci, 'yyyy-MM-dd'),
            checkOutDateFull: format(co, 'yyyy-MM-dd'),
            total: booking.total_amount,
            bookingType: booking.booking_type,
            monthsCount: booking.months_count,
            extraDays: booking.extra_days,
            rawBooking: booking
        };
    };

    const isLoading = isLoadingProperties || isLoadingRooms || isLoadingReservations;

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen">
            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Timeline Calendar</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-sm text-gray-500 mt-1.5">
                        <div className="flex items-center gap-2">
                            <FiHome className="flex-shrink-0" />
                            <span className="font-semibold whitespace-nowrap">Property:</span>
                        </div>
                        <select 
                            value={selectedPropertyId || ''} 
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="bg-transparent font-bold text-primary-600 border-none p-0 focus:ring-0 cursor-pointer max-w-[180px] xs:max-w-[240px] sm:max-w-xs md:max-w-md lg:max-w-lg truncate"
                        >
                            {properties?.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Status Legends */}
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
                        onClick={() => refetchReservations()}
                        className="p-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition flex items-center justify-center shrink-0 shadow-sm"
                        title="Refresh calendar"
                    >
                        <FiRotateCw />
                    </button>
                </div>
            </div>

            {/* Display range & Date Controls Row */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-700">
                    Displaying from <strong className="text-primary-700 font-bold">{format(startDate, 'MMM dd')}</strong> to <strong className="text-primary-700 font-bold">{format(rangeEndDate, 'MMM dd, yyyy')}</strong>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => shiftDate(-visibleDaysCount)}
                        className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        title={`${visibleDaysCount} days backward`}
                    >
                        <FiChevronsLeft size={16} />
                    </button>
                    <button 
                        onClick={() => shiftDate(-1)}
                        className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        title="1 day backward"
                    >
                        <FiChevronLeft size={16} />
                    </button>

                    <div className="relative">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => date && setStartDate(startOfDay(date))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-[#004e59]/20 font-bold text-center cursor-pointer max-w-[120px] bg-white"
                            dateFormat="yyyy-MM-dd"
                        />
                        <button 
                            onClick={resetToToday}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-800 font-bold bg-white pl-1.5"
                            title="Reset to today"
                        >
                            Today
                        </button>
                    </div>

                    <button 
                        onClick={() => shiftDate(1)}
                        className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        title="1 day forward"
                    >
                        <FiChevronRight size={16} />
                    </button>
                    <button 
                        onClick={() => shiftDate(visibleDaysCount)}
                        className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        title={`${visibleDaysCount} days forward`}
                    >
                        <FiChevronsRight size={16} />
                    </button>
                </div>
            </div>

            {/* Timeline Calendar Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-hidden w-full">
                    <div className="w-full">
                        {/* Table Header */}
                        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
                            {/* Room Header Col */}
                            <div className="w-40 sm:w-56 p-3 sm:p-4 flex items-center shrink-0 border-r border-gray-200 bg-gray-50 font-black tracking-wide uppercase">
                                Rooms
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
                                            } ${tday ? 'bg-primary-50/30' : ''}`}
                                        >
                                            <span className="text-[10px] uppercase font-bold text-gray-400">{format(date, 'EEE')}</span>
                                            <span className="text-xs font-black">{format(date, 'dd MMM')}</span>
                                            {tday && (
                                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Room Categories & Rows */}
                        <div className="divide-y divide-gray-100">
                            {Object.keys(groupedRooms).length === 0 ? (
                                <div className="p-20 text-center text-gray-500">
                                    No rooms found for this property. Please go to Room Inventory to add rooms.
                                </div>
                            ) : (
                                Object.keys(groupedRooms).map((roomType) => {
                                    const typeRooms = groupedRooms[roomType];
                                    const isExpanded = !!expandedGroups[roomType];
                                    return (
                                        <div key={roomType} className="bg-white">
                                            {/* Category Expand Header */}
                                            <button 
                                                onClick={() => toggleGroup(roomType)}
                                                className="w-full flex items-center px-4 py-3 bg-gray-50/70 hover:bg-gray-50 border-b border-gray-150 transition-colors text-left"
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
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                                                    {roomType}
                                                </span>
                                                <span className="ml-2 px-2 py-0.5 bg-gray-200/70 text-[9px] font-bold text-gray-500 rounded-md">
                                                    {typeRooms.length}
                                                </span>
                                            </button>

                                            {/* Group Rows */}
                                            {isExpanded && (
                                                <div className="divide-y divide-gray-100">
                                                    {typeRooms.map((room) => {
                                                        // Find all bookings matching this room
                                                        const roomBookings = activeReservations.filter(
                                                            res => room.id === 'unassigned'
                                                                ? !rooms.some(r => Number(res.hms_room_id) === Number(r.id))
                                                                : Number(res.hms_room_id) === Number(room.id)
                                                        );
                                                        
                                                        return (
                                                            <div key={room.id} className="flex h-[68px] hover:bg-gray-50/30 transition-colors">
                                                                {/* Left Room Info */}
                                                                <div className="w-40 sm:w-56 p-3 sm:p-4 border-r border-gray-200 flex flex-col justify-center shrink-0 bg-gray-50/20">
                                                                    <div className="font-extrabold text-xs sm:text-sm text-gray-850 truncate">
                                                                        {room.id === 'unassigned' ? 'Unassigned Bookings' : `${terms.room} ${room.room_number}`}
                                                                    </div>
                                                                    <div className="text-[9px] sm:text-[10px] text-gray-450 mt-0.5 uppercase font-bold tracking-wide truncate">
                                                                        {room.id === 'unassigned' ? 'Need to assign a room' : `Floor: ${room.floor || 'G'} • BDT ${room.price}`}
                                                                    </div>
                                                                </div>

                                                                {/* Right Timeline Grid */}
                                                                <div className="flex-1 relative">
                                                                    {/* Base Grid Cells */}
                                                                    <div className="absolute inset-0 grid h-full" style={{ gridTemplateColumns: `repeat(${visibleDaysCount}, minmax(0, 1fr))` }}>
                                                                        {rangeDates.map((date, idx) => {
                                                                            const wknd = isWeekend(date);
                                                                            const tday = isToday(date);
                                                                            return (
                                                                                <div 
                                                                                    key={idx} 
                                                                                    className={`h-full border-r border-gray-200/50 relative ${
                                                                                        wknd ? 'bg-red-50/10' : ''
                                                                                    } ${tday ? 'bg-primary-50/10' : ''}`}
                                                                                >
                                                                                    {/* Faint date number in cell */}
                                                                                    <span className="absolute bottom-1 right-2 text-[10px] font-bold text-gray-400 pointer-events-none select-none">
                                                                                        {format(date, 'd')}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* Booking absolute overlay bars */}
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
                                                                                    height: '38px',
                                                                                    backgroundImage: span.bookingType === 'monthly' ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(147, 51, 234, 0.08) 8px, rgba(147, 51, 234, 0.08) 16px)' : undefined
                                                                                }}
                                                                                onClick={() => setSelectedBooking(span)}
                                                                                className={`absolute z-10 rounded-lg px-3 flex items-center select-none cursor-pointer transition-all active:scale-[0.98] ${getStatusStyle(span.status, span.bookingType)}`}
                                                                                title={
                                                                                    span.bookingType === 'monthly'
                                                                                        ? `Monthly Booking — ${span.guestName} (${span.ref})\nStay: ${span.checkIn} - ${span.checkOut} (${span.monthsCount || Math.floor(span.nights / 30)} months${span.extraDays > 0 ? ` + ${span.extraDays} days` : ''})\nStatus: ${span.status.toUpperCase()} • BDT ${span.total}`
                                                                                        : `${span.guestName} (${span.ref})\nStay: ${span.checkIn} - ${span.checkOut} (${span.nights} nights)\nStatus: ${span.status.toUpperCase()} • BDT ${span.total}`
                                                                                }
                                                                            >
                                                                                <span className="font-bold text-xs truncate">
                                                                                    {span.bookingType === 'monthly' && <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>}
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

            {/* Slide-out Sidebar Drawer Modal */}
            {selectedBooking && (
                <>
                    {/* Backdrop overlay */}
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
                        onClick={() => setSelectedBooking(null)}
                    />
                    
                    {/* Drawer panel */}
                    <div 
                        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-gray-150"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="p-1 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-gray-100 transition mt-0.5"
                            >
                                <FiX size={20} />
                            </button>
                            <div className="flex-1">
                                <h3 className="text-base font-extrabold text-gray-800 leading-tight">
                                    Reservation Details for {selectedBooking.guestName} from {selectedBooking.checkInFull} to {selectedBooking.checkOutFull}
                                </h3>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-700">
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50 w-1/3">Guest Name</td>
                                            <td className="px-5 py-3.5 font-extrabold text-gray-800">{selectedBooking.guestName}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Booking Status</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStatusBadgeStyle(selectedBooking.status)}`}>
                                                    {selectedBooking.status.replace('_', ' ')}
                                                </span>
                                                {selectedBooking.bookingType === 'monthly' && (
                                                    <span className="ml-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-200">
                                                        Monthly Stay
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Check in</td>
                                            <td className="px-5 py-3.5 font-extrabold text-gray-850">{selectedBooking.checkInDateFull}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Check out</td>
                                            <td className="px-5 py-3.5 font-extrabold text-gray-850">{selectedBooking.checkOutDateFull}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Stay Duration</td>
                                            <td className="px-5 py-3.5 font-extrabold text-gray-850">
                                                {selectedBooking.bookingType === 'monthly'
                                                    ? `${selectedBooking.monthsCount || Math.floor(selectedBooking.nights / 30)} Months${(selectedBooking.extraDays || selectedBooking.nights % 30) > 0 ? ` + ${(selectedBooking.extraDays || selectedBooking.nights % 30)} Days` : ''}`
                                                    : `${selectedBooking.nights} Nights`
                                                }
                                            </td>
                                        </tr>
                                        {selectedBooking.bookingType === 'monthly' && (
                                            <>
                                                <tr>
                                                    <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Monthly Rent Rate</td>
                                                    <td className="px-5 py-3.5 font-extrabold text-gray-850">
                                                        BDT {parseFloat(selectedBooking.rawBooking?.monthly_rate_used || 0).toLocaleString()} / month
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Advance Payment</td>
                                                    <td className="px-5 py-3.5 font-extrabold text-gray-850">
                                                        BDT {parseFloat(selectedBooking.rawBooking?.advance_amount || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Remaining Balance</td>
                                                    <td className="px-5 py-3.5 font-extrabold text-gray-850 text-rose-600">
                                                        BDT {Math.max(0, parseFloat(selectedBooking.total || 0) - parseFloat(selectedBooking.rawBooking?.advance_amount || 0)).toLocaleString()}
                                                    </td>
                                                </tr>
                                                {selectedProperty && (
                                                    <tr>
                                                        <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Included in Rent</td>
                                                        <td className="px-5 py-3.5 font-extrabold text-gray-850">
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {(() => {
                                                                    const list = [];
                                                                    if (selectedProperty.monthly_furnished) list.push('🛋 Furnished');
                                                                    if (selectedProperty.monthly_wifi_included) list.push('🌐 WiFi');
                                                                    if (selectedProperty.monthly_electricity_included) list.push('⚡ Electricity');
                                                                    if (selectedProperty.monthly_gas_included) list.push('🔥 Gas');
                                                                    if (selectedProperty.monthly_water_included) list.push('💧 Water');
                                                                    if (selectedProperty.monthly_cleaning_included) list.push('🧹 Cleaning');
                                                                    if (selectedProperty.monthly_service_charge_included) list.push('💼 Service Charge');
                                                                    return list.map((inc, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-100">
                                                                            {inc}
                                                                        </span>
                                                                    ));
                                                                })()}
                                                            </div>
                                                            {selectedProperty.monthly_inclusions_notes && (
                                                                <p className="text-[10px] text-gray-500 mt-1 font-normal italic">
                                                                    Note: {selectedProperty.monthly_inclusions_notes}
                                                                </p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">VAT</td>
                                            <td className="px-5 py-3.5 font-extrabold text-gray-850">0.00</td>
                                        </tr>
                                        <tr>
                                            <td className="px-5 py-3.5 font-bold text-gray-400 bg-gray-50/50">Total Amount</td>
                                            <td className="px-5 py-3.5 font-black text-primary-700 text-sm">
                                                BDT {parseFloat(selectedBooking.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        if (selectedBooking && selectedBooking.rawBooking) {
                                            navigate('/property-owner/hms/reservations', { 
                                                state: { 
                                                    highlightBookingRef: selectedBooking.rawBooking.booking_reference 
                                                } 
                                            });
                                        }
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 bg-[#004e59] text-white font-extrabold rounded-lg hover:bg-[#003d4d] transition shadow-md active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HMSCalendar;
