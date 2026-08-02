import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiPrinter, FiDownload, FiCalendar, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SearchablePropertySelect = ({ properties, selectedId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProperty = properties?.find(p => p.id === parseInt(selectedId));

  // Sync search input with selected property title
  useEffect(() => {
    if (selectedProperty) {
      setSearch(selectedProperty.title);
    } else {
      setSearch('');
    }
  }, [selectedId, selectedProperty]);

  const filteredProperties = properties?.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.city?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="All Properties"
          value={search}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange('');
            }
          }}
          className="w-full bg-white border border-gray-250 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] focus:ring-1 focus:ring-[#004e59] transition-all text-gray-800 placeholder-gray-400 h-[42px]"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {selectedProperty && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-650 focus:outline-none p-0.5"
            >
              <FiX size={13} />
            </button>
          )}
          <span className="text-gray-450 pointer-events-none">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in">
          {filteredProperties.length > 0 ? (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setSearch('');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                  !selectedId ? 'bg-gray-100 text-[#004e59]' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Properties
              </button>
              {filteredProperties.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id.toString());
                    setSearch(p.title);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                    parseInt(selectedId) === p.id 
                      ? 'bg-[#004e59]/10 text-[#004e59] font-bold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-semibold truncate w-full">{p.title}</span>
                  {p.city && <span className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{p.city}</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-3 text-center text-xs text-gray-450 italic">
              No matching properties found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BookingReports = ({ userRole }) => {
    // Shared component for Admin and Property Owner
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        startDate: '',
        endDate: '',
        property_id: '',
        page: 1,
        limit: 100
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [monthsShown, setMonthsShown] = useState(window.innerWidth < 768 ? 1 : 2);
    const datePickerRef = useRef(null);

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

    // Debounce search input to avoid spamming the backend
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                page: 1,
                search: searchTerm
            }));
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

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
            page: 1,
            startDate: format(range[0], 'yyyy-MM-dd'),
            endDate: range[1] ? format(range[1], 'yyyy-MM-dd') : ''
        }));
        setIsDatePickerOpen(false);
    };

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setFilters(prev => ({
            ...prev,
            page: 1,
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            page: 1,
            [key]: value
        }));
    };

    // Fetch properties list for filter dropdown
    const { data: propertiesList } = useQuery(
        `${userRole}-properties-list`,
        () => api.get(userRole === 'admin' ? '/admin/properties/list' : '/property-owner/properties/list').then(res => res.data?.data?.properties || []),
        { refetchOnWindowFocus: false }
    );

    const endpoint = userRole === 'admin' ? '/admin/bookings' : '/property-owner/bookings';

    const { data, isLoading, isFetching } = useQuery(
        [`${userRole}-booking-reports`, filters],
        () => api.get(`${endpoint}?${new URLSearchParams(filters).toString()}`).then(res => res.data.data),
        { refetchOnWindowFocus: false, keepPreviousData: true }
    );

    const bookings = data?.bookings || [];
    const totalAmount = bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    const handlePrint = () => window.print();

    // Export simplified CSV
    const exportCSV = () => {
        if (!bookings.length) return;
        const headers = ['Ref', 'Property', 'Guest', 'Check In', 'Check Out', 'Amount', 'Status'];
        const csvRows = [headers.join(',')];
        
        bookings.forEach(b => {
            const row = [
                b.booking_reference, 
                `"${b.property_title || ''}"`, 
                `"${b.guest_first_name || ''} ${b.guest_last_name || ''}"`,
                b.check_in_date?.split('T')[0],
                b.check_out_date?.split('T')[0],
                b.total_amount,
                b.status
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Booking_Report.csv';
        a.click();
    };

    const formatNumber = (amount) => {
        const value = parseFloat(amount || 0);
        const hasDecimals = value % 1 !== 0;
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: 2
        });
    };

    const getStatusStyle = (status) => {
        const s = String(status || '').toLowerCase().trim();
        switch (s) {
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'completed':
            case 'checked_out':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
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
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Booking Reports</h1>
                        <p className="text-gray-500 mt-1.5 text-sm">Detailed list of all reservations and guest activity.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Booking Activity Report</h1>
                    <p className="text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Glassmorphic Report Filters Console */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/80 p-6 mb-8 print-hide transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm tracking-wide uppercase">
                            <FiFilter className="text-[#004e59]" />
                            <span>Report Filters</span>
                        </h3>
                        {isFetching && (
                            <span className="text-xs text-[#004e59] bg-[#004e59]/5 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 animate-pulse">
                                Updating Grid...
                            </span>
                        )}
                    </div>

                    {/* Main search row with toggle/clear/print/csv buttons */}
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FiSearch className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reference or guest..."
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
                                    {[filters.status, filters.property_id, filters.startDate].filter(Boolean).length}
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({ status: '', search: '', startDate: '', endDate: '', property_id: '', page: 1, limit: 100 });
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
                                <FiPrinter size={14} /> Print
                            </button>

                            <button 
                                onClick={exportCSV} 
                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-750 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                <FiDownload size={14} /> CSV
                            </button>
                        </div>
                    </div>

                    {/* Advanced Collapsible filters */}
                    {showAdvanced && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Booking Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                    <option value="checked_in">Checked In</option>
                                    <option value="checked_out">Checked Out</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Filter by Property
                                </label>
                                <SearchablePropertySelect
                                    properties={propertiesList}
                                    selectedId={filters.property_id}
                                    onChange={(val) => handleFilterChange('property_id', val)}
                                />
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
                                                                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-[10px] font-bold p-1 cursor-pointer"
                                                                    >
                                                                        &gt;
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={increaseYear}
                                                                        disabled={nextYearButtonDisabled}
                                                                        className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-[10px] font-bold p-1 cursor-pointer"
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
                    <div className="w-full h-1 bg-[#004e59]/10 overflow-hidden rounded-full mb-4">
                        <div className="h-full bg-[#004e59] w-1/3 rounded-full animate-progress-slide"></div>
                    </div>
                )}

                {isLoading && !data ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-155 p-12"><LoadingSpinner /></div>
                ) : (
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-155 overflow-hidden print:border-none print:shadow-none transition-opacity duration-200 ${isFetching ? 'opacity-65' : 'opacity-100'}`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-155 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Guest</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount (BDT)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{b.booking_reference}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[240px] truncate" title={b.property_title}>{b.property_title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{b.guest_first_name} {b.guest_last_name}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                            {b.check_in_date?.split('T')[0]} <span className="text-gray-300">→</span> {b.check_out_date?.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusStyle(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right print-text-black">
                                            {formatNumber(b.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length > 0 && (
                                    <tr className="bg-gray-100/70 font-bold border-t-2 border-gray-255">
                                        <td colSpan="5" className="px-6 py-4 text-sm text-right text-gray-700">Total</td>
                                        <td className="px-6 py-4 text-sm font-black text-gray-900 text-right print-text-black">
                                            {formatNumber(totalAmount)}
                                        </td>
                                    </tr>
                                )}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FiInfo className="text-3xl text-gray-300" />
                                                <span className="text-sm font-medium">No bookings match the selected filters.</span>
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

export default BookingReports;
