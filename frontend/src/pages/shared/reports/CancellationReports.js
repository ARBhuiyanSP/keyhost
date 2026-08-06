import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiPrinter, FiX, FiCalendar, FiInfo } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CancellationReports = ({ userRole }) => {
    // Specifically fetch cancelled bookings
    const [filters, setFilters] = useState({
        status: 'cancelled',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 100
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [monthsShown, setMonthsShown] = useState(window.innerWidth < 768 ? 1 : 2);
    const datePickerRef = useRef(null);

    const endpoint = userRole === 'admin' ? '/admin/bookings' : '/property-owner/bookings';

    useEffect(() => {
        const handleResize = () => {
            setMonthsShown(window.innerWidth < 768 ? 1 : 2);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getQueryParams = () => {
        const params = {
            status: filters.status,
            page: filters.page,
            limit: filters.limit
        };

        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        return params;
    };

    const { data, isLoading, isFetching } = useQuery(
        [`${userRole}-cancellation-reports`, filters],
        () => {
            const params = getQueryParams();
            return api.get(`${endpoint}?${new URLSearchParams(params).toString()}`).then(res => res.data.data);
        },
        { refetchOnWindowFocus: false, keepPreviousData: true }
    );

    // Extract unique cancellation reasons from raw data
    const uniqueReasons = useMemo(() => {
        const bookingsList = data?.bookings || [];
        const reasons = bookingsList
            .map(b => b.cancellation_reason)
            .filter(reason => reason && reason.trim() !== '');
        return [...new Set(reasons)];
    }, [data?.bookings]);

    // Client-side instant smooth search filter
    const filteredBookings = useMemo(() => {
        const bookingsList = data?.bookings || [];
        
        let list = bookingsList;
        if (selectedReason) {
            list = list.filter(b => b.cancellation_reason === selectedReason);
        }

        if (!searchTerm.trim()) return list;
        
        const term = searchTerm.toLowerCase().trim();
        return list.filter(b => {
            const ref = (b.booking_reference || '').toLowerCase();
            const guestName = `${b.guest_first_name || ''} ${b.guest_last_name || ''}`.toLowerCase();
            const propTitle = (b.property_title || '').toLowerCase();
            const reason = (b.cancellation_reason || '').toLowerCase();
            return ref.includes(term) || guestName.includes(term) || propTitle.includes(term) || reason.includes(term);
        });
    }, [data?.bookings, searchTerm, selectedReason]);

    const handlePrint = () => window.print();

    const totalLostValue = filteredBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    const formatNumber = (amount) => {
        const value = parseFloat(amount || 0);
        const hasDecimals = value % 1 !== 0;
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: 2
        });
    };

    const presets = [
        {
            label: 'Yesterday',
            getRange: () => {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                return [d, d];
            }
        },
        {
            label: 'Today',
            getRange: () => {
                const d = new Date();
                return [d, d];
            }
        },
        {
            label: 'Last 7 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 6);
                return [start, end];
            }
        },
        {
            label: 'Last 14 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 13);
                return [start, end];
            }
        },
        {
            label: 'Last 30 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 29);
                return [start, end];
            }
        },
        {
            label: 'Last 90 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 89);
                return [start, end];
            }
        },
        {
            label: 'Last 120 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 119);
                return [start, end];
            }
        },
        {
            label: 'Last 1 Year',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setFullYear(start.getFullYear() - 1);
                return [start, end];
            }
        }
    ];

    const handlePresetClick = (range) => {
        setFilters(prev => ({
            ...prev,
            startDate: format(range[0], 'yyyy-MM-dd'),
            endDate: range[1] ? format(range[1], 'yyyy-MM-dd') : ''
        }));
        setIsDatePickerOpen(false);
    };

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setFilters(prev => ({
            ...prev,
            startDate: start ? format(start, 'yyyy-MM-dd') : '',
            endDate: end ? format(end, 'yyyy-MM-dd') : ''
        }));
        if (start && end) {
            setIsDatePickerOpen(false);
        }
    };

    const fmtDate = (dateStr) => {
        if (!dateStr) return '';
        return format(new Date(dateStr), 'MMM dd, yyyy');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 print:bg-white print:p-0">
            <style>{`
                @keyframes slideProgress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-slide {
                    animation: slideProgress 1.6s infinite linear;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }

                /* Custom datepicker popover styling */
                .hms-daterange-popover {
                    filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
                }
                .hms-daterange-popover::before {
                    content: '';
                    position: absolute;
                    top: -6px;
                    left: 50%;
                    transform: translateX(-50%) rotate(45deg);
                    width: 12px;
                    height: 12px;
                    background: #f9fafb;
                    border-top: 1px solid rgba(229, 231, 235, 1);
                    border-left: 1px solid rgba(229, 231, 235, 1);
                    z-index: 10;
                }
                @media (min-width: 768px) {
                    .hms-daterange-popover::before {
                        left: auto;
                        right: 24px;
                        transform: rotate(45deg);
                        background: #ffffff;
                    }
                }

                .hms-daterange-picker-picker .react-datepicker {
                    border: none !important;
                    font-family: inherit !important;
                    background: transparent !important;
                    display: flex !important;
                }
                .hms-daterange-picker-picker .react-datepicker__header {
                    background: transparent !important;
                    border-bottom: none !important;
                    padding-top: 8px !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day-name {
                    color: #9ca3af !important;
                    font-weight: 600 !important;
                    width: 2.25rem !important;
                    line-height: 2.25rem !important;
                    margin: 0.125rem !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day {
                    width: 2.25rem !important;
                    line-height: 2.25rem !important;
                    margin: 0.125rem !important;
                    border-radius: 50% !important;
                    color: #374151 !important;
                    font-weight: 550 !important;
                    transition: all 0.15s ease !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day:hover {
                    background-color: #f3f4f6 !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--outside-month {
                    color: #d1d5db !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--today {
                    border: 1px solid #004e59 !important;
                    border-radius: 50% !important;
                    background-color: transparent !important;
                    color: #004e59 !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--today.react-datepicker__day--selected,
                .hms-daterange-picker-picker .react-datepicker__day--today.react-datepicker__day--range-start,
                .hms-daterange-picker-picker .react-datepicker__day--today.react-datepicker__day--range-end {
                    background-color: #004e59 !important;
                    color: white !important;
                    border: none !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--selected,
                .hms-daterange-picker-picker .react-datepicker__day--range-start,
                .hms-daterange-picker-picker .react-datepicker__day--range-end {
                    background-color: #004e59 !important;
                    color: white !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--in-selecting-range,
                .hms-daterange-picker-picker .react-datepicker__day--in-range {
                    background-color: rgba(0, 78, 89, 0.08) !important;
                    color: #004e59 !important;
                    border-radius: 0 !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--range-start {
                    border-top-left-radius: 50% !important;
                    border-bottom-left-radius: 50% !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--range-end {
                    border-top-right-radius: 50% !important;
                    border-bottom-right-radius: 50% !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--range-start.react-datepicker__day--range-end {
                    border-radius: 50% !important;
                }
                .hms-daterange-picker-picker .react-datepicker__month-container {
                    padding: 0 8px !important;
                }
                .hms-daterange-picker-picker .react-datepicker__navigation {
                    display: none !important;
                }
            `}</style>

            <div className="bg-white px-8 py-8 border-b border-gray-200/80 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cancellation Reports</h1>
                        <p className="text-gray-500 mt-1.5 text-sm">Review rejected and cancelled bookings with reasons.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Cancellation & Rejection Log</h1>
                </div>

                {/* Glassmorphic Report Filters Console */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/80 p-6 mb-8 print-hide transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm tracking-wide uppercase">
                            <FiFilter className="text-red-500" />
                            <span>Report Filters</span>
                        </h3>
                        {isFetching && (
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 animate-pulse">
                                Updating Grid...
                            </span>
                        )}
                    </div>

                    {/* Main search row with toggle/clear/print buttons */}
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FiSearch className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reference, guest, property, or reason..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50/50 border border-gray-250 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#004e59] focus:ring-1 focus:ring-[#004e59] transition-all text-gray-800 placeholder-gray-450"
                            />
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                                    showAdvanced 
                                        ? 'bg-[#004e59]/10 text-[#004e59] border-[#004e59]/30' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <FiFilter size={14} />
                                <span>Filters</span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">
                                    {[selectedReason, filters.startDate].filter(Boolean).length}
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedReason('');
                                    setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
                                }}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-750 bg-red-50 hover:bg-red-100/75 transition-all"
                            >
                                <FiX size={14} />
                                <span>Clear</span>
                            </button>

                            <button 
                                onClick={handlePrint} 
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-[#004e59] hover:bg-[#003b43] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                <FiPrinter size={14} /> Print Report
                            </button>
                        </div>
                    </div>

                    {/* Advanced Collapsible filters */}
                    {showAdvanced && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Filter by Reason
                                </label>
                                <select
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800"
                                >
                                    <option value="">All Reasons</option>
                                    {uniqueReasons.map((reason, idx) => (
                                        <option key={idx} value={reason}>
                                            {reason.length > 50 ? `${reason.substring(0, 50)}...` : reason}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div ref={datePickerRef} className="relative">
                                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Date Range
                                </label>
                                <div 
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    className={`flex items-center gap-2 bg-white border ${
                                        isDatePickerOpen ? 'border-[#004e59] ring-1 ring-[#004e59]' : 'border-gray-250'
                                    } rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer select-none transition-all`}
                                >
                                    <FiCalendar className="text-gray-400" size={14} />
                                    <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                                        {filters.startDate ? fmtDate(filters.startDate) : "Start"} ➔ {filters.endDate ? fmtDate(filters.endDate) : "End"}
                                    </span>
                                </div>
                                
                                {isDatePickerOpen && (
                                    <div className="absolute left-0 md:right-0 md:left-auto z-50 mt-2 bg-white border border-gray-250 rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden w-[90vw] max-w-[320px] md:max-w-none md:w-max hms-daterange-popover">
                                        {/* Left presets list */}
                                        <div className="w-full md:w-32 border-b md:border-b-0 md:border-r border-gray-150 p-1.5 flex flex-row md:flex-col gap-1 overflow-x-auto bg-gray-50/50 whitespace-nowrap">
                                            {presets.map(p => (
                                                <button
                                                    key={p.label}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePresetClick(p.getRange());
                                                    }}
                                                    className="px-2.5 py-1.5 md:w-full text-left rounded-lg text-xxs font-bold text-gray-600 hover:bg-gray-100 hover:text-[#004e59] transition-colors inline-block md:block flex-shrink-0"
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {/* DatePicker */}
                                        <div className="p-2 bg-white hms-daterange-picker-picker" onClick={(e) => e.stopPropagation()}>
                                            <DatePicker
                                                selected={filters.startDate ? new Date(filters.startDate) : null}
                                                startDate={filters.startDate ? new Date(filters.startDate) : null}
                                                endDate={filters.endDate ? new Date(filters.endDate) : null}
                                                selectsRange
                                                onChange={handleDateRangeChange}
                                                monthsShown={monthsShown}
                                                inline
                                                renderCustomHeader={({
                                                    monthDate,
                                                    customHeaderCount,
                                                    decreaseMonth,
                                                    increaseMonth,
                                                    decreaseYear,
                                                    increaseYear,
                                                    prevMonthButtonDisabled,
                                                    nextMonthButtonDisabled,
                                                    prevYearButtonDisabled,
                                                    nextYearButtonDisabled,
                                                }) => {
                                                    const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
                                                    const year = monthDate.getFullYear();
                                                    
                                                    return (
                                                        <div className="flex items-center justify-between px-3 py-1.5 select-none relative">
                                                            {customHeaderCount === 0 ? (
                                                                <div className="flex items-center gap-1.5 absolute left-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={decreaseYear}
                                                                        disabled={prevYearButtonDisabled}
                                                                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-[10px] font-bold p-1 cursor-pointer"
                                                                    >
                                                                        &lt;&lt;
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={decreaseMonth}
                                                                        disabled={prevMonthButtonDisabled}
                                                                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-[10px] font-bold p-1 cursor-pointer"
                                                                    >
                                                                        &lt;
                                                                    </button>
                                                                </div>
                                                            ) : null}
                                                            
                                                            <div className="w-full text-center text-[11px] font-bold text-gray-700">
                                                                {monthName} {year}
                                                            </div>
                                                            
                                                            {(customHeaderCount === 1 || monthsShown === 1) ? (
                                                                <div className="flex items-center gap-1.5 absolute right-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={increaseMonth}
                                                                        disabled={nextMonthButtonDisabled}
                                                                        className="text-gray-400 hover:text-gray-950 disabled:opacity-30 text-[10px] font-bold p-1 cursor-pointer"
                                                                    >
                                                                        &gt;
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={increaseYear}
                                                                        disabled={nextYearButtonDisabled}
                                                                        className="text-gray-400 hover:text-gray-955 disabled:opacity-30 text-[10px] font-bold p-1 cursor-pointer"
                                                                    >
                                                                        &gt;&gt;
                                                                    </button>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Soft top loading progress bar */}
                {isFetching && (
                    <div className="w-full h-1 bg-red-100/50 overflow-hidden rounded-full mb-4">
                        <div className="h-full bg-red-500 w-1/3 rounded-full animate-progress-slide"></div>
                    </div>
                )}

                {isLoading && !data ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"><LoadingSpinner /></div>
                ) : (
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none transition-opacity duration-200 ${isFetching ? 'opacity-65' : 'opacity-100'}`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-red-50/50 border-b border-red-100 text-xs uppercase tracking-wider text-red-800">
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Guest</th>
                                    <th className="px-6 py-4">Reason / Status</th>
                                    <th className="px-6 py-4 text-right">Lost Value (BDT)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.map(b => (
                                    <tr key={b.id} className="hover:bg-red-50/10 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{b.booking_reference}</td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-700" title={b.property_title}>{b.property_title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{b.guest_first_name} {b.guest_last_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-red-100 text-red-800 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">Cancelled</span>
                                            <p className="text-xs text-gray-400 mt-1.5 italic font-sans">{b.cancellation_reason || 'No specific reason provided'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-red-600 text-right line-through">
                                            {formatNumber(b.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length > 0 && (
                                    <tr className="bg-red-50/30 font-bold border-t-2 border-red-200">
                                        <td colSpan="4" className="px-6 py-4 text-sm text-right text-red-800">Total</td>
                                        <td className="px-6 py-4 text-sm font-black text-red-650 text-right print-text-black">
                                            {formatNumber(totalLostValue)}
                                        </td>
                                    </tr>
                                )}
                                {(!filteredBookings || filteredBookings.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FiInfo className="text-3xl text-gray-300" />
                                                <span className="text-sm font-medium">No cancellations found.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CancellationReports;
