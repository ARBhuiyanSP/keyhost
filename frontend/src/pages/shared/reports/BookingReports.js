import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiPrinter, FiDownload, FiCalendar, FiXCircle, FiInfo, FiX, FiCopy, FiCheck, FiCheckCircle } from 'react-icons/fi';
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

const SearchableUserSelect = ({ users, placeholder, selectedId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedUser = users?.find(u => u.id === parseInt(selectedId));

  useEffect(() => {
    if (selectedUser) {
      setSearch(`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.email || '');
    } else {
      setSearch('');
    }
  }, [selectedId, selectedUser]);

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || 
           u.email?.toLowerCase().includes(search.toLowerCase()) || 
           u.phone?.toLowerCase().includes(search.toLowerCase());
  }) || [];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder || "All Users"}
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
          {selectedUser && (
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
          {filteredUsers.length > 0 ? (
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
                {placeholder || "All Users"}
              </button>
              {filteredUsers.map(u => {
                const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || `User #${u.id}`;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onChange(u.id.toString());
                      setSearch(name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col ${
                      parseInt(selectedId) === u.id 
                        ? 'bg-[#004e59]/10 text-[#004e59] font-bold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold truncate w-full">{name}</span>
                    {u.phone && <span className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{u.phone}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-3 text-center text-xs text-gray-450 italic">
              No matching users found
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
        payment_status: '',
        payment_method: '',
        search: '',
        startDate: '',
        endDate: '',
        property_id: '',
        guest_id: '',
        host_id: '',
        dateType: 'check_in_date',
        page: 1,
        limit: 100
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [monthsShown, setMonthsShown] = useState(window.innerWidth < 768 ? 1 : 2);
    const datePickerRef = useRef(null);

    const [copiedId, setCopiedId] = useState(null);
    const [verifyingBooking, setVerifyingBooking] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState(null);

    const handleCopy = (id, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handleVerifyGateway = async (booking, e) => {
        e.stopPropagation();
        setVerifyingBooking(booking);
        setIsVerifying(true);
        setVerificationError(null);
        setVerificationData(null);
        try {
            const res = await api.get(`/admin/bookings/${booking.id}/verify-gateway`);
            if (res.data?.success) {
                setVerificationData(res.data.data);
            } else {
                setVerificationError(res.data?.message || 'Verification query failed');
            }
        } catch (err) {
            console.error('Verify gateway error:', err);
            setVerificationError(err.response?.data?.message || err.message || 'Verification query failed');
        } finally {
            setIsVerifying(false);
        }
    };

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

    // Fetch hosts list for admin filter
    const { data: hostsList } = useQuery(
        'admin-hosts-list',
        () => api.get('/admin/users?user_type=property_owner&limit=100').then(res => res.data?.data?.users || []),
        { enabled: userRole === 'admin', refetchOnWindowFocus: false }
    );

    // Fetch guests list for admin filter
    const { data: guestsList } = useQuery(
        'admin-guests-list',
        () => api.get('/admin/users?user_type=guest&limit=100').then(res => res.data?.data?.users || []),
        { enabled: userRole === 'admin', refetchOnWindowFocus: false }
    );

    const endpoint = userRole === 'admin' ? '/admin/bookings' : '/property-owner/bookings';

    const { data, isLoading, isFetching } = useQuery(
        [`${userRole}-booking-reports`, filters],
        () => api.get(`${endpoint}?${new URLSearchParams({ ...filters, report_mode: 'true' }).toString()}`).then(res => res.data.data),
        { refetchOnWindowFocus: false, keepPreviousData: true }
    );

    const bookings = data?.bookings || [];
    const totalAmount = bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    const handlePrint = () => window.print();

    // Export simplified CSV
    const exportCSV = () => {
        if (!bookings.length) return;
        const headers = userRole === 'admin' 
            ? ['Ref', 'Property', 'Host', 'Guest', 'Check In', 'Check Out', 'Payment Method', 'Txn ID', 'Amount', 'Gateway Fee', 'Commission', 'Status']
            : ['Ref', 'Property', 'Guest', 'Check In', 'Check Out', 'Amount', 'Status'];
        const csvRows = [headers.join(',')];
        
        bookings.forEach(b => {
            const row = userRole === 'admin'
                ? [
                    b.booking_reference,
                    `"${b.property_title || ''}"`,
                    `"${b.host_first_name || ''} ${b.host_last_name || ''}"`,
                    `"${b.guest_first_name || ''} ${b.guest_last_name || ''}"`,
                    b.check_in_date?.split('T')[0],
                    b.check_out_date?.split('T')[0],
                    b.payment_method || 'Online',
                    b.payment_txn_id || '—',
                    b.total_amount,
                    b.gateway_fee || 0,
                    b.commission_amount || 0,
                    b.status
                ]
                : [
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
                                    {[filters.status, filters.payment_status, filters.payment_method, filters.property_id, filters.guest_id, filters.host_id, filters.startDate].filter(Boolean).length}
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({
                                        status: '',
                                        payment_status: '',
                                        payment_method: '',
                                        search: '',
                                        startDate: '',
                                        endDate: '',
                                        property_id: '',
                                        guest_id: '',
                                        host_id: '',
                                        dateType: 'check_in_date',
                                        page: 1,
                                        limit: 100
                                    });
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
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Booking Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800 h-[42px]"
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

                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Payment Status
                                    </label>
                                    <select
                                        value={filters.payment_status}
                                        onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                        className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800 h-[42px]"
                                    >
                                        <option value="">All Payment Statuses</option>
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partially_paid">Partially Paid</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            )}

                            <div ref={datePickerRef} className="relative">
                                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Date Range
                                </label>
                                <div 
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    className={`flex items-center gap-2 bg-white border ${
                                        isDatePickerOpen ? 'border-[#004e59] ring-1 ring-[#004e59]' : 'border-gray-250'
                                    } rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer select-none transition-all h-[42px]`}
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


                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Payment Method
                                    </label>
                                    <select
                                        value={filters.payment_method}
                                        onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                                        className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800 h-[42px]"
                                    >
                                        <option value="">All Payment Methods</option>
                                        <option value="sslcommerz">SSLCommerz</option>
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="cash">Cash</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                            )}

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

                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Filter by Host
                                    </label>
                                    <SearchableUserSelect
                                        users={hostsList}
                                        placeholder="All Hosts"
                                        selectedId={filters.host_id}
                                        onChange={(val) => handleFilterChange('host_id', val)}
                                    />
                                </div>
                            )}

                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Filter by Guest
                                    </label>
                                    <SearchableUserSelect
                                        users={guestsList}
                                        placeholder="All Guests"
                                        selectedId={filters.guest_id}
                                        onChange={(val) => handleFilterChange('guest_id', val)}
                                    />
                                </div>
                            )}
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
                    <div className={`lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-155 lg:overflow-hidden print:border-none print:shadow-none transition-opacity duration-200 ${isFetching ? 'opacity-65' : 'opacity-100'}`}>
                        {/* Desktop view */}
                        <div className="hidden lg:block overflow-x-auto bg-white rounded-2xl border border-gray-155">
                            <table className="w-full text-left border-collapse print:min-w-0 table-fixed">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-155 text-xs uppercase tracking-wider text-gray-500">
                                        <th className={`px-3.5 py-3 ${userRole === 'admin' ? 'w-[15%]' : 'w-[20%]'}`}>Reference / Dates</th>
                                        <th className={`px-3.5 py-3 ${userRole === 'admin' ? 'w-[15%]' : 'w-[25%]'}`}>Property</th>
                                        {userRole === 'admin' && <th className="px-3.5 py-3 w-[10%]">Host</th>}
                                        <th className={`px-3.5 py-3 ${userRole === 'admin' ? 'w-[10%]' : 'w-[15%]'}`}>Guest</th>
                                        {userRole === 'admin' && <th className="px-3.5 py-3 w-[16%]">Payment Method</th>}
                                        <th className={`px-3.5 py-3 text-right ${userRole === 'admin' ? 'w-[8%]' : 'w-[15%]'}`}>Amount</th>
                                        {userRole === 'admin' && <th className="px-3.5 py-3 text-right w-[8%]">Gateway Fee</th>}
                                        {userRole === 'admin' && <th className="px-3.5 py-3 text-right w-[10%]">Commission</th>}
                                        <th className={`px-3.5 py-3 text-right ${userRole === 'admin' ? 'w-[10%]' : 'w-[15%]'}`}>Host Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((b) => {
                                        const hostAmt = parseFloat(b.total_amount) - parseFloat(b.gateway_fee || 0) - parseFloat(b.commission_amount || 0);
                                        return (
                                            <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-3.5 py-3 text-xs text-gray-900">
                                                    <div className="font-bold truncate" title={b.booking_reference}>{b.booking_reference}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 whitespace-nowrap">
                                                        {b.check_in_date?.split('T')[0]} → {b.check_out_date?.split('T')[0]}
                                                    </div>
                                                     {(() => {
                                                        const nights = b.check_in_date && b.check_out_date
                                                            ? Math.round((new Date(b.check_out_date) - new Date(b.check_in_date)) / (1000 * 60 * 60 * 24))
                                                            : null;
                                                        return (
                                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                                {nights > 0 && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                                                        {nights} night{nights > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusStyle(b.status)}`}>
                                                                    {b.status}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-3.5 py-3 text-xs text-gray-600 truncate" title={b.property_title}>{b.property_title}</td>
                                                {userRole === 'admin' && (
                                                    <td className="px-3.5 py-3 text-xs text-gray-600 truncate" title={`${b.host_first_name || ''} ${b.host_last_name || ''}`.trim() || b.host_email || '—'}>
                                                        {`${b.host_first_name || ''} ${b.host_last_name || ''}`.trim() || b.host_email || '—'}
                                                    </td>
                                                )}
                                                <td className="px-3.5 py-3 text-xs text-gray-600 truncate" title={`${b.guest_first_name} ${b.guest_last_name}`}>{b.guest_first_name} {b.guest_last_name}</td>

                                                {userRole === 'admin' && (
                                                    <td className="px-3.5 py-3 text-xs text-gray-650">
                                                        <span className="font-bold capitalize block">
                                                            {b.payment_method === 'sslcommerz' ? 'SSLCommerz' : b.payment_method === 'bkash' ? 'bKash' : b.payment_method === 'nagad' ? 'Nagad' : b.payment_method === 'cash' ? 'Cash' : b.payment_method || 'Online'}
                                                        </span>
                                                        {b.payment_txn_id && (
                                                            <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-gray-400">
                                                                <span className="select-all truncate max-w-[80px] inline-block" title={b.payment_txn_id}>
                                                                    {b.payment_txn_id}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleCopy(b.payment_txn_id, e)}
                                                                    className="text-gray-400 hover:text-[#004e59] transition-colors p-0.5 flex items-center justify-center flex-shrink-0"
                                                                    title="Copy Transaction ID"
                                                                >
                                                                    {copiedId === b.payment_txn_id ? <FiCheck size={11} className="text-emerald-500 animate-scale-up" /> : <FiCopy size={10} />}
                                                                </button>
                                                                {(b.payment_method === 'bkash' || b.payment_method === 'sslcommerz') && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleVerifyGateway(b, e)}
                                                                        className="text-gray-400 hover:text-emerald-600 transition-colors p-0.5 flex items-center justify-center flex-shrink-0"
                                                                        title="Verify Live with Gateway"
                                                                    >
                                                                        <FiCheckCircle size={11} className="hover:scale-110 transition-transform" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-3.5 py-3 text-xs font-bold text-gray-900 text-right print-text-black">
                                                    {formatNumber(b.total_amount)}
                                                </td>
                                                {userRole === 'admin' && (
                                                    <td className="px-3.5 py-3 text-xs font-bold text-red-650 text-right">
                                                        {formatNumber(b.gateway_fee || 0)}
                                                    </td>
                                                )}
                                                {userRole === 'admin' && (
                                                    <td className="px-3.5 py-3 text-xs font-bold text-emerald-700 text-right">
                                                        {formatNumber(b.commission_amount)}
                                                        {b.commission_rate > 0 && <span className="text-[9px] text-gray-400 block font-normal">({b.commission_rate}%)</span>}
                                                    </td>
                                                )}
                                                <td className="px-3.5 py-3 text-xs font-bold text-[#004e59] text-right print-text-black">
                                                    {formatNumber(hostAmt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {bookings.length > 0 && (
                                        <tr className="bg-gray-100/70 font-bold border-t-2 border-gray-255">
                                            <td colSpan={userRole === 'admin' ? 5 : 4} className="px-3.5 py-3 text-xs text-right text-gray-700">Total</td>
                                            <td className="px-3.5 py-3 text-xs font-black text-gray-900 text-right print-text-black">
                                                {formatNumber(totalAmount)}
                                            </td>
                                            {userRole === 'admin' && (
                                                <td className="px-3.5 py-3 text-xs font-black text-red-800 text-right">
                                                    {formatNumber(bookings.reduce((sum, b) => sum + (parseFloat(b.gateway_fee) || 0), 0))}
                                                </td>
                                            )}
                                            {userRole === 'admin' && (
                                                <td className="px-3.5 py-3 text-xs font-black text-emerald-800 text-right">
                                                    {formatNumber(bookings.reduce((sum, b) => sum + (parseFloat(b.commission_amount) || 0), 0))}
                                                </td>
                                            )}
                                            <td className="px-3.5 py-3 text-xs font-black text-[#004e59] text-right print-text-black">
                                                {formatNumber(bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.gateway_fee || 0) - parseFloat(b.commission_amount || 0)), 0))}
                                            </td>
                                        </tr>
                                    )}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan={userRole === 'admin' ? 9 : 5} className="px-3.5 py-16 text-center text-gray-400">
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

                        {/* Mobile/Tablet Card-based View */}
                        <div className="block lg:hidden space-y-4">
                            {bookings.map((b) => (
                                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-155 p-5 space-y-4">
                                    {/* Header: Reference and Status */}
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <span className="text-xs font-bold text-gray-900 select-all">{b.booking_reference}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getStatusStyle(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </div>

                                    {/* Property Title */}
                                    <div>
                                        <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Property</span>
                                        <span className="text-xs text-gray-800 font-semibold block line-clamp-2" title={b.property_title}>{b.property_title}</span>
                                    </div>

                                    {/* Dates & Guest & Host */}
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Dates</span>
                                            <span className="font-mono text-gray-650 block">{b.check_in_date?.split('T')[0]} → {b.check_out_date?.split('T')[0]}</span>
                                            {(() => {
                                                const nights = b.check_in_date && b.check_out_date
                                                    ? Math.round((new Date(b.check_out_date) - new Date(b.check_in_date)) / (1000 * 60 * 60 * 24))
                                                    : null;
                                                return nights > 0 ? (
                                                    <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                                        {nights} night{nights > 1 ? 's' : ''}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                        <div>
                                            <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Guest</span>
                                            <span className="text-gray-700 font-semibold block">{b.guest_first_name} {b.guest_last_name}</span>
                                        </div>
                                        {userRole === 'admin' && (
                                            <div className="col-span-2">
                                                <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Host</span>
                                                <span className="text-gray-700 font-semibold block">{`${b.host_first_name || ''} ${b.host_last_name || ''}`.trim() || b.host_email || '—'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment & Transaction Info */}
                                    {userRole === 'admin' && (
                                        <div className="bg-gray-50 rounded-xl p-3.5 space-y-2.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 font-semibold">Payment Method</span>
                                                <span className="font-bold text-gray-800 capitalize">
                                                    {b.payment_method === 'sslcommerz' ? 'SSLCommerz' : b.payment_method === 'bkash' ? 'bKash' : b.payment_method === 'nagad' ? 'Nagad' : b.payment_method === 'cash' ? 'Cash' : b.payment_method || 'Online'}
                                                </span>
                                            </div>
                                            {b.payment_txn_id && (
                                                <div className="flex flex-col gap-1 border-t border-gray-200/60 pt-2 text-xxs font-mono">
                                                    <span className="text-gray-400">Transaction ID</span>
                                                    <div className="flex items-center gap-2 text-gray-650">
                                                        <span className="select-all block truncate max-w-[170px]">{b.payment_txn_id}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleCopy(b.payment_txn_id, e)}
                                                            className="text-gray-455 hover:text-[#004e59] p-0.5 flex-shrink-0"
                                                        >
                                                            {copiedId === b.payment_txn_id ? <FiCheck size={11} className="text-emerald-500" /> : <FiCopy size={10} />}
                                                        </button>
                                                        {(b.payment_method === 'bkash' || b.payment_method === 'sslcommerz') && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleVerifyGateway(b, e)}
                                                                className="text-gray-455 hover:text-emerald-600 p-0.5 flex-shrink-0"
                                                                title="Verify Live with Gateway"
                                                            >
                                                                <FiCheckCircle size={11} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Financials (Amount, Gateway Fee, Commission) */}
                                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-right">
                                        <div>
                                            <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Amount</span>
                                            <span className="text-xs font-bold text-gray-900 block">৳{formatNumber(b.total_amount)}</span>
                                        </div>
                                        {userRole === 'admin' ? (
                                            <>
                                                <div>
                                                    <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Gateway Fee</span>
                                                    <span className="text-xs font-bold text-red-650 block">৳{formatNumber(b.gateway_fee || 0)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Commission</span>
                                                    <span className="text-xs font-bold text-emerald-700 block">
                                                        ৳{formatNumber(b.commission_amount)}
                                                        {b.commission_rate > 0 && <span className="text-[9px] text-gray-400 font-normal block">({b.commission_rate}%)</span>}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="col-span-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Mobile/Tablet Total Card */}
                            {bookings.length > 0 && (
                                <div className="bg-gray-100 rounded-2xl p-5 border border-gray-200/80 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                        <span>Total Bookings</span>
                                        <span className="text-gray-955 font-extrabold text-sm">{bookings.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                        <span>Total Amount</span>
                                        <span className="text-gray-955 font-extrabold text-sm">৳{formatNumber(totalAmount)}</span>
                                    </div>
                                    {userRole === 'admin' && (
                                        <>
                                            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                                <span>Total Gateway Fees</span>
                                                <span className="text-red-700 font-extrabold text-sm">৳{formatNumber(bookings.reduce((sum, b) => sum + (parseFloat(b.gateway_fee) || 0), 0))}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                                <span>Total Commission</span>
                                                <span className="text-emerald-800 font-extrabold text-sm">৳{formatNumber(bookings.reduce((sum, b) => sum + (parseFloat(b.commission_amount) || 0), 0))}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {bookings.length === 0 && (
                                <div className="bg-white rounded-2xl border border-gray-155 py-16 text-center text-gray-400 shadow-sm">
                                    <FiInfo className="text-3xl text-gray-300 mx-auto mb-2" />
                                    <span className="text-sm font-medium">No bookings match the selected filters.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Gateway Verification Modal */}
            {verifyingBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setVerifyingBooking(null)}>
                    <div 
                        className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 capitalize flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#004e59] animate-pulse"></span>
                                    {verifyingBooking.payment_method === 'sslcommerz' ? 'SSLCommerz' : 'bKash'} Live Query
                                </h3>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Booking Ref: {verifyingBooking.booking_reference}</p>
                            </div>
                            <button 
                                onClick={() => setVerifyingBooking(null)}
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {isVerifying && (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <LoadingSpinner />
                                    <span className="text-xs font-semibold text-gray-500 animate-pulse">Contacting gateway secure server...</span>
                                </div>
                            )}

                            {verificationError && (
                                <div className="flex flex-col items-center text-center py-4">
                                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100">
                                        <FiXCircle size={24} />
                                    </div>
                                    <h4 className="text-xs font-bold text-gray-800 mb-1">Gateway Connection Failed</h4>
                                    <p className="text-xxs text-gray-400 font-semibold max-w-xs leading-relaxed mb-4">{verificationError}</p>
                                    <button 
                                        onClick={(e) => handleVerifyGateway(verifyingBooking, e)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xxs font-bold transition-colors"
                                    >
                                        Retry Check
                                    </button>
                                </div>
                            )}

                            {verificationData && (
                                <div className="space-y-4">
                                    {/* Status Header Badge */}
                                    <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2.5 border border-emerald-100">
                                            <FiCheckCircle size={26} />
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {verificationData.status || 'Verified'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-semibold mt-1">Live Payment Verified</span>
                                    </div>

                                    {/* Verification Info Grid */}
                                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-left bg-gray-50/50 rounded-2xl p-4 border border-gray-150">
                                        <div>
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Gateway Txn ID</span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-[10px] font-mono font-bold text-gray-800 select-all">{verificationData.transactionId}</span>
                                                <button 
                                                    onClick={(e) => handleCopy(verificationData.transactionId, e)}
                                                    className="text-gray-400 hover:text-gray-700 p-0.5"
                                                >
                                                    {copiedId === verificationData.transactionId ? <FiCheck size={10} className="text-emerald-600 animate-scale-up" /> : <FiCopy size={9} />}
                                                </button>
                                            </div>
                                        </div>

                                        {verificationData.bankTranId && (
                                            <div>
                                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Bank Tran ID</span>
                                                <span className="block text-[10px] font-mono font-bold text-gray-800 mt-0.5 select-all">{verificationData.bankTranId}</span>
                                            </div>
                                        )}

                                        <div>
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Gateway Amount</span>
                                            <span className="block text-[11px] font-bold text-emerald-700 mt-0.5">
                                                BDT {formatNumber(verificationData.amount)} {verificationData.currency}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">System Amount</span>
                                            <span className="block text-[11px] font-bold text-gray-750 mt-0.5">
                                                BDT {formatNumber(verifyingBooking.total_amount)}
                                            </span>
                                        </div>

                                        <div className="col-span-2 border-t border-gray-150 pt-2.5">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Payer Details</span>
                                            <span className="block text-[10px] font-bold text-gray-800 mt-0.5 truncate" title={verificationData.payerDetails}>
                                                {verificationData.payerDetails || '—'}
                                            </span>
                                        </div>

                                        {verificationData.paymentTime && (
                                            <div className="col-span-2">
                                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Payment Timestamp</span>
                                                <span className="block text-[10px] font-bold text-gray-600 mt-0.5 font-mono">
                                                    {verificationData.paymentTime}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-gray-400 font-semibold text-center italic leading-normal">
                                        Reconciliation check completes successfully if amounts and Transaction IDs match.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button 
                                onClick={() => setVerifyingBooking(null)}
                                className="px-4 py-2 bg-[#004e59] hover:bg-[#004e59]/90 text-white rounded-lg text-xxs font-bold transition-all shadow-sm hover:shadow"
                            >
                                Dismiss Check
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingReports;
