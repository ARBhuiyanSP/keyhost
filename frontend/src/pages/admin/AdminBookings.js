import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { FiCalendar, FiSearch, FiFilter, FiEye, FiUser, FiHome, FiDollarSign, FiMapPin, FiX, FiPrinter, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/textUtils';
import AdminUserProfileModal from '../../components/admin/AdminUserProfileModal';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ExpandablePropertyTitle = ({ title, maxLength = 25 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!title || title.length <= maxLength) {
    return <div className="text-sm font-medium text-gray-900 leading-tight">{title}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm font-medium text-gray-900 leading-tight whitespace-normal break-words">
        {isExpanded ? title : `${title.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-primary-600 font-medium text-[11px] hover:underline focus:outline-none text-left mt-0.5 self-start"
      >
        {isExpanded ? 'View Less' : 'View More'}
      </button>
    </div>
  );
};

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
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fadeIn">
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

const AdminBookings = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    property_id: '',
    page: 1,
    limit: 10
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState('0');
  const [deductionReason, setDeductionReason] = useState('Full release');
  const [isProcessingDeduction, setIsProcessingDeduction] = useState(false);

  // Custom Date Picker States for filter
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
      endDate: format(range[1], 'yyyy-MM-dd')
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

  // Fetch properties list for filter dropdown
  const { data: propertiesList } = useQuery(
    'admin-properties-list',
    () => api.get('/admin/properties/list').then(res => res.data?.data?.properties || []),
    { refetchOnWindowFocus: false }
  );

  // Fetch bookings
  const { data: bookingsData, isLoading, isFetching, refetch } = useQuery(
    ['admin-bookings', filters],
    () => api.get(`/admin/bookings?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { bookings: [], pagination: {} },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'request_accepted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewBooking = async (booking) => {
    try {
      // Fetch payment history for the booking
      const response = await api.get(`/admin/bookings/${booking.id}/payments`);
      const payments = response.data?.data?.payments || [];

      setSelectedBooking({
        ...booking,
        payments: payments
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Use booking data if API call fails
      setSelectedBooking(booking);
      setShowDetailsModal(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
  };

  const handlePrintBooking = () => {
    if (!selectedBooking) return;

    const printWindow = window.open('', '_blank');
    const nights = Math.ceil((new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24));

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Details - ${selectedBooking.booking_reference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #2563eb; 
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header p { 
              color: #666; 
              font-size: 14px;
            }
            .booking-ref {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .booking-ref h2 {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .booking-ref p {
              color: #6b7280;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              margin-bottom: 15px;
            }
            .info-label {
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              color: #1f2937;
              font-size: 16px;
              font-weight: 500;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-confirmed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .status-checked_in { background: #dbeafe; color: #1e40af; }
            .status-checked_out { background: #f3f4f6; color: #374151; }
            .payment-box {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              padding: 20px;
              border-radius: 8px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .payment-total {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              border-top: 2px solid #d1d5db;
              padding-top: 10px;
              margin-top: 10px;
            }
            .special-requests {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              border-radius: 4px;
              font-size: 14px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Keyhost Homes</h1>
            <p>Booking Confirmation & Details</p>
          </div>

          <div class="booking-ref">
            <h2>${selectedBooking.booking_reference}</h2>
            <p>Created on ${new Date(selectedBooking.created_at).toLocaleString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Guest Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${selectedBooking.guest_first_name} ${selectedBooking.guest_last_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${selectedBooking.guest_email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${selectedBooking.guest_phone || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Number of Guests</div>
                <div class="info-value">${selectedBooking.number_of_guests} Guest${selectedBooking.number_of_guests > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Property Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Property Name</div>
                <div class="info-value">${selectedBooking.property_title}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${selectedBooking.property_city}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Booking Dates</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Check-in Date</div>
                <div class="info-value">${new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Check-out Date</div>
                <div class="info-value">${new Date(selectedBooking.check_out_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Duration</div>
                <div class="info-value">${nights} Night${nights > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="payment-box">
              <div className="payment-row">
                <span>Total Amount:</span>
                <span className="payment-total">BDT {formatPrice(selectedBooking.total_amount)}</span>
              </div>
              <div class="payment-row">
                <span>Payment Status:</span>
                <span style="color: ${selectedBooking.payment_status === 'paid' ? '#065f46' : '#92400e'}; font-weight: 600;">
                  ${selectedBooking.payment_status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Booking Status</div>
            <span class="status-badge status-${selectedBooking.status}">
              ${selectedBooking.status?.replace('_', ' ')}
            </span>
          </div>

          ${selectedBooking.special_requests ? `
          <div class="section">
            <div class="section-title">Special Requests</div>
            <div class="special-requests">
              ${selectedBooking.special_requests}
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>This is an official booking confirmation from Keyhost Homes</p>
            <p>For inquiries, please contact us at support@keyhosthomes.com</p>
            <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-250/70 p-5 mb-6 transition-all duration-300">
          {/* Main search row with toggle/clear buttons */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by reference, guest name, or property..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                onClick={() => setFilters({ status: '', search: '', startDate: '', endDate: '', property_id: '', page: 1, limit: 10 })}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-750 bg-red-50 hover:bg-red-100/75 transition-all"
              >
                <FiX size={14} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Advanced Collapsible filters */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
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
                  <option value="pending">Pending</option>
                  <option value="request_accepted">Request Accepted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
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

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({bookingsData?.pagination?.totalItems || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : bookingsData?.bookings?.length > 0 ? (
            <div className={`transition-all duration-300 ${isFetching ? 'opacity-65 pointer-events-none filter blur-[0.5px]' : 'opacity-100'}`}>
              
              {/* ── MOBILE CARD LIST (< md) ── */}
              <div className="md:hidden divide-y divide-gray-100">
                {bookingsData.bookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Header: Ref & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Ref</span>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {booking.booking_reference}
                        </p>
                        <span className="text-[11px] text-gray-400">
                          Booked: {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getStatusColor(booking.status)}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          booking.payment_status === 'paid'
                            ? 'bg-green-50 text-green-700 border-green-150'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                        }`}>
                          {booking.payment_status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Guest & Property */}
                    <div className="space-y-1.5 my-2.5 text-xs">
                      <div>
                        <span className="font-semibold text-gray-400 block mb-0.5">Guest:</span>
                        <span 
                          onClick={() => setSelectedUserProfile({ userId: booking.guest_user_id })}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {booking.guest_first_name} {booking.guest_last_name}
                        </span>
                        <span className="text-gray-550 block truncate font-medium">{booking.guest_email}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-400 block mb-0.5">Property:</span>
                        <span className="font-medium text-gray-800 block truncate">{booking.property_title}</span>
                        <span className="text-gray-500 flex items-center gap-1 mt-0.5">
                          <FiMapPin className="w-3.5 h-3.5 shrink-0" /> {booking.property_city}
                        </span>
                        <div className="mt-1 text-[11px]">
                          <span className="text-gray-400">Host: </span>
                          <span 
                            onClick={() => setSelectedUserProfile({ userId: booking.host_user_id })}
                            className="font-bold text-blue-650 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {booking.host_first_name} {booking.host_last_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dates & Amount */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-55 p-2.5 rounded-lg text-xs my-2 border border-gray-100">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Dates & Guests:</span>
                        <p className="font-semibold text-gray-800 leading-tight">
                          {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                        <span className="text-[10px] text-gray-500">{booking.number_of_guests} guests</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block mb-0.5">Total Amount:</span>
                        <p className="text-sm font-black text-red-600 leading-tight">
                          ৳{formatPrice(booking.total_amount)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-2.5 flex justify-end">
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── DESKTOP TABLE (≥ md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Actions
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Dates
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Amount (BDT)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookingsData.bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-normal text-left text-sm font-medium">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md hover:bg-primary-50 transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-all">
                          <div>
                            <div className="text-sm font-medium text-gray-900 leading-tight">
                              {booking.booking_reference}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words">
                          <div className="flex items-center">
                            <div className="hidden sm:flex w-8 h-8 bg-primary-100 rounded-full items-center justify-center shrink-0">
                              <span className="text-primary-600 font-medium text-xs">
                                {booking.guest_first_name?.[0]}{booking.guest_last_name?.[0]}
                              </span>
                            </div>
                            <div className="sm:ml-3">
                              <div 
                                onClick={() => setSelectedUserProfile({ userId: booking.guest_user_id })}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer leading-tight"
                              >
                                {booking.guest_first_name} {booking.guest_last_name}
                              </div>
                              <div className="text-xs text-gray-500 break-all">
                                {booking.guest_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-normal align-top">
                          <div className="w-40 max-w-[180px]">
                            <ExpandablePropertyTitle title={booking.property_title} maxLength={22} />
                            <div className="text-xs text-gray-500 flex items-center mt-1.5">
                              <FiMapPin className="w-3 h-3 mr-1 shrink-0" />
                              <span className="truncate whitespace-normal" title={booking.property_city}>{booking.property_city}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              <span className="text-gray-400">Host: </span>
                              <span 
                                onClick={() => setSelectedUserProfile({ userId: booking.host_user_id })}
                                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {booking.host_first_name} {booking.host_last_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-normal break-words">
                          <div className="text-xs text-gray-900">
                            {new Date(booking.check_in_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(booking.check_out_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.number_of_guests} guests
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-normal">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-center ${getStatusColor(booking.status)}`}>
                            {booking.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-normal">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1 leading-tight">
                            <span className="font-bold text-red-600 break-all">{formatPrice(booking.total_amount)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.payment_status || 'Pending'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {bookingsData?.pagination && bookingsData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((bookingsData.pagination.currentPage - 1) * bookingsData.pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(bookingsData.pagination.currentPage * bookingsData.pagination.itemsPerPage, bookingsData.pagination.totalItems)} of{' '}
                  {bookingsData.pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', bookingsData.pagination.prevPage)}
                    disabled={!bookingsData.pagination.hasPrevPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {bookingsData.pagination.currentPage} of {bookingsData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handleFilterChange('page', bookingsData.pagination.nextPage)}
                    disabled={!bookingsData.pagination.hasNextPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={handleCloseModal}
              ></div>

              {/* Center modal */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                {/* Header */}
                <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" id="modal-title">
                    Booking Details
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="bg-white px-6 py-6">
                  <div className="space-y-6">
                    {/* Booking Reference */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Booking Reference</h4>
                      <p className="text-xl font-bold text-gray-900">{selectedBooking.booking_reference}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(selectedBooking.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Guest Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUser className="mr-2" />
                        Guest Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.guest_first_name} {selectedBooking.guest_last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Number of Guests</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.number_of_guests}</p>
                        </div>
                      </div>
                    </div>

                    {/* Property Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiHome className="mr-2" />
                        Property Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Property Name</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.property_title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {selectedBooking.property_city}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Dates */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiCalendar className="mr-2" />
                        Booking Dates
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Check-out</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedBooking.check_out_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24))} nights
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiDollarSign className="mr-2" />
                        Payment Information
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Amount</span>
                          <span className="text-lg font-bold text-gray-900">BDT {formatPrice(selectedBooking.total_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment Status</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${selectedBooking.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {selectedBooking.payment_status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Status */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Booking Status</h4>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Security Deposit Management */}
                    {selectedBooking.status === 'checked_out' && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-red-800">Security Deposit Management</h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            selectedBooking.security_deposit_status === 'processed' 
                              ? 'bg-green-100 text-green-700' 
                              : selectedBooking.security_deposit_status === 'claim_requested'
                              ? 'bg-red-100 text-red-700 animate-pulse'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {selectedBooking.security_deposit_status?.replace('_', ' ') || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-xs text-red-700">
                            Security Deposit Amount: <span className="font-bold">৳{formatPrice(selectedBooking.security_deposit || 0)}</span>
                          </p>

                          {selectedBooking.security_deposit_status === 'claim_requested' && (
                            <div className="bg-white border-l-4 border-red-500 p-3 rounded shadow-sm">
                              <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Host Deduction Request</p>
                              <p className="text-sm font-black text-gray-900 mb-1">৳{formatPrice(selectedBooking.security_deposit_claim_amount)}</p>
                              <p className="text-xs text-gray-600 italic">"{selectedBooking.security_deposit_claim_reason}"</p>
                              <p className="text-[9px] text-gray-400 mt-2">Requested on {new Date(selectedBooking.security_deposit_claim_at).toLocaleString()}</p>
                            </div>
                          )}
                          
                          {selectedBooking.security_deposit_status !== 'processed' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (selectedBooking.security_deposit_status === 'claim_requested') {
                                    setDeductionAmount(selectedBooking.security_deposit_claim_amount.toString());
                                    setDeductionReason(selectedBooking.security_deposit_claim_reason);
                                  } else {
                                    setDeductionAmount('0');
                                    setDeductionReason('Full release');
                                  }
                                  setShowDeductionModal(true);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm w-full flex items-center justify-center gap-2"
                              >
                                <FiDollarSign />
                                {selectedBooking.security_deposit_status === 'claim_requested' ? 'Process Host Claim' : 'Process Return / Deduction'}
                              </button>
                            </div>
                          )}
                        </div>
                        {selectedBooking.security_deposit_status === 'processed' && (
                          <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                            <FiCheckCircle /> Security deposit has been processed.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Payment History */}
                    {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <FiDollarSign className="mr-2" />
                          Payment History & Ledger
                        </h4>

                        {/* Accounting Summary */}
                        <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-4 border-2 border-gray-200 mb-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount (DR)</div>
                              <div className="text-xl font-bold text-red-600">
                                BDT {selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Receivable</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid Amount (CR)</div>
                              <div className="text-xl font-bold text-green-600">
                                BDT {selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Received</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Remaining</div>
                              <div className="text-xl font-bold text-orange-600">
                                BDT {(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                                  selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Due</div>
                            </div>
                          </div>
                        </div>

                        {/* Transaction History */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Transaction History ({selectedBooking.payments.length} entries)</h5>
                          <div className="bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
                            <div className="space-y-1">
                              {selectedBooking.payments.map((payment, index) => (
                                <div key={payment.id} className="bg-white rounded p-2 border border-gray-200 text-xs">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className="font-semibold">#{index + 1}</span>
                                        <span className={`px-1.5 py-0.5 rounded ${payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                          }`}>
                                          {payment.dr_amount > 0 ? 'DR' : 'CR'}
                                        </span>
                                        <span className="text-blue-600">{payment.payment_reference}</span>
                                      </div>
                                      <div className="text-gray-600 capitalize">{payment.transaction_type?.replace('_', ' ')}</div>
                                      <div className="text-gray-500">
                                        {new Date(payment.created_at).toLocaleString('en-US', {
                                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      {payment.dr_amount > 0 && <div className="font-semibold text-red-600">DR: BDT {parseFloat(payment.dr_amount).toFixed(2)}</div>}
                                      {payment.cr_amount > 0 && <div className="font-semibold text-green-600">CR: BDT {parseFloat(payment.cr_amount).toFixed(2)}</div>}
                                      <div className="text-gray-600 mt-0.5">
                                        Bal: <span className={`font-semibold ${payment.running_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                          BDT {parseFloat(payment.running_balance || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    {selectedBooking.special_requests && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {selectedBooking.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <button
                    onClick={handlePrintBooking}
                    className="btn-primary inline-flex items-center"
                  >
                    <FiPrinter className="mr-2" />
                    Print Booking
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedUserProfile && (
          <AdminUserProfileModal
            userId={selectedUserProfile.userId}
            phone={selectedUserProfile.phone}
            email={selectedUserProfile.email}
            onClose={() => setSelectedUserProfile(null)}
          />
        )}
      </div>
      {/* Admin Security Deduction Modal */}
      {showDeductionModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Security Deposit</h3>
                  <p className="text-xs text-gray-500">Ref: #{selectedBooking?.booking_reference}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeductionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isProcessingDeduction}
              >
                <FiX className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Deposit Amount</p>
                  <p className="text-2xl font-black text-blue-900">BDT {selectedBooking?.security_deposit || 0}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-blue-200 text-blue-700 text-[10px] font-bold rounded uppercase">Holding</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deduction Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">BDT</span>
                    <input 
                      type="number"
                      value={deductionAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDeductionAmount(val);
                        if (parseFloat(val) === 0) setDeductionReason('Full release');
                        else if (deductionReason === 'Full release') setDeductionReason('');
                      }}
                      className="w-full pl-14 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:ring-0 transition-all outline-none font-bold text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400 uppercase font-medium">Enter 0 for a full refund to guest</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Processing Reason</label>
                  <textarea 
                    value={deductionReason}
                    onChange={(e) => setDeductionReason(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:ring-0 transition-all outline-none min-h-[100px] text-sm"
                    placeholder="e.g. Damage to furniture, missing linens, etc."
                  ></textarea>
                </div>
              </div>

              {/* Summary calculation */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-dashed border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>To be Refunded:</span>
                  <span className="font-bold text-green-600">BDT {Math.max(0, (selectedBooking?.security_deposit || 0) - (parseFloat(deductionAmount) || 0))}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>To be Deducted:</span>
                  <span className="font-bold text-red-600">BDT {parseFloat(deductionAmount) || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setShowDeductionModal(false)}
                className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isProcessingDeduction}
              >
                Close
              </button>
              <button 
                onClick={async () => {
                  if (parseFloat(deductionAmount) > (selectedBooking?.security_deposit || 0)) {
                    alert('Deduction cannot exceed security deposit');
                    return;
                  }
                  if (parseFloat(deductionAmount) > 0 && !deductionReason.trim()) {
                    alert('Reason is required for deductions');
                    return;
                  }

                  setIsProcessingDeduction(true);
                  try {
                    await api.post(`/admin/bookings/${selectedBooking.id}/security-deposit-deduction`, {
                      deduction_amount: deductionAmount,
                      reason: deductionReason
                    });
                    setShowDeductionModal(false);
                    handleCloseModal();
                    refetch();
                  } catch (err) {
                    alert('Failed to process security deposit.');
                  } finally {
                    setIsProcessingDeduction(false);
                  }
                }}
                disabled={isProcessingDeduction}
                className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                {isProcessingDeduction ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <FiX className="w-5 h-5" />}
                Process Security Deposit
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
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
            background: #f9fafb; /* Matches presets sidebar horizontal container */
            border-top: 1px solid rgba(229, 231, 235, 1);
            border-left: 1px solid rgba(229, 231, 235, 1);
            z-index: 10;
        }
        @media (min-width: 768px) {
            .hms-daterange-popover::before {
                left: auto;
                right: 24px;
                transform: rotate(45deg);
                background: #ffffff; /* On desktop, right side of popover is the calendar (white bg) */
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
    </div>
  );
};

export default AdminBookings;
