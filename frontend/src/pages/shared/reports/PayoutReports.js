import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { FiPrinter, FiSearch, FiFilter, FiX, FiCalendar, FiInfo } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const fmt = (amount) => {
  const v = parseFloat(amount || 0);
  return '৳' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtNumber = (amount) => {
  const v = parseFloat(amount || 0);
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const STATUS_STYLES = {
  completed:  'bg-emerald-100 text-emerald-800',
  pending:    'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  failed:     'bg-red-100 text-red-800',
};

const PayoutReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [monthsShown, setMonthsShown] = useState(window.innerWidth < 768 ? 1 : 2);
  const datePickerRef = useRef(null);

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    owner_id: ''
  });

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

  const handleFilterChange = (key, value) => {
    setAppliedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const { data, isLoading, isError } = useQuery(
    ['admin-payout-reports'],
    async () => {
      const res = await api.get('/admin/owner-payouts/payouts', { params: { limit: 100, page: 1 } });
      return res.data.data;
    },
    { refetchOnWindowFocus: false, keepPreviousData: true }
  );

  const handlePrint = () => window.print();

  const allPayouts = data?.payouts || [];

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
    setAppliedFilters(prev => ({
      ...prev,
      startDate: format(range[0], 'yyyy-MM-dd'),
      endDate: range[1] ? format(range[1], 'yyyy-MM-dd') : ''
    }));
    setIsDatePickerOpen(false);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setAppliedFilters(prev => ({
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

  // Extract unique hosts/owners from all payouts
  const uniqueOwners = [];
  const seenOwners = new Set();
  allPayouts.forEach(p => {
    if (p.property_owner_id && !seenOwners.has(p.property_owner_id)) {
      seenOwners.add(p.property_owner_id);
      uniqueOwners.push({
        id: p.property_owner_id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.business_name || 'Unknown Owner',
        business_name: p.business_name
      });
    }
  });

  // Client-side search and filters logic
  const payouts = allPayouts.filter(p => {
    // 1. Search term filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const ref = (p.payout_reference || '').toLowerCase();
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const biz = (p.business_name || '').toLowerCase();
      const method = (p.payment_method || '').toLowerCase();
      
      if (!ref.includes(s) && !name.includes(s) && !biz.includes(s) && !method.includes(s)) {
        return false;
      }
    }

    // 2. Status filter
    if (appliedFilters.status && p.payment_status !== appliedFilters.status) {
      return false;
    }

    // Owner filter
    if (appliedFilters.owner_id && p.property_owner_id !== parseInt(appliedFilters.owner_id)) {
      return false;
    }

    // 3. Date range filter
    if (!p.created_at) return true;
    const d = new Date(p.created_at);
    if (appliedFilters.startDate && appliedFilters.endDate) {
      const from = new Date(appliedFilters.startDate);
      const to = new Date(appliedFilters.endDate);
      to.setHours(23, 59, 59, 999);
      return d >= from && d <= to;
    } else if (appliedFilters.startDate) {
      const from = new Date(appliedFilters.startDate);
      return d >= from;
    } else if (appliedFilters.endDate) {
      const to = new Date(appliedFilters.endDate);
      to.setHours(23, 59, 59, 999);
      return d <= to;
    }
    return true;
  });

  // Totals
  const totalNetPayout = payouts.reduce((s, p) => s + parseFloat(p.net_payout || 0), 0);
  const totalEarnings = payouts.reduce((s, p) => s + parseFloat(p.total_earnings || 0), 0);
  const totalCommission = payouts.reduce((s, p) => s + parseFloat(p.total_commission_paid || 0), 0);
  const completedCount = payouts.filter(p => p.payment_status === 'completed').length;
  const pendingCount = payouts.filter(p => p.payment_status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0 font-sans">
      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          tr { break-inside: avoid !important; }
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

      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payout Reports</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Monitor cleared and pending property owner payouts.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">

        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b-2 border-gray-950 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-gray-950 tracking-wider">KEYHOST HOMES</h2>
              <p className="text-xs text-gray-600 uppercase tracking-widest mt-0.5">Vacation Rentals & Property Management</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-extrabold text-gray-955 uppercase tracking-widest">PAYOUT RECONCILIATION</h1>
              <p className="text-[11px] text-gray-500 mt-0.5">Statement Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-xs font-bold text-gray-800 mt-2">
                Period: {appliedFilters.startDate && appliedFilters.endDate
                  ? `${fmtDate(appliedFilters.startDate)} to ${fmtDate(appliedFilters.endDate)}`
                  : 'All Time'}
              </p>
            </div>
          </div>
        </div>

        {/* Glassmorphic Report Filters Console */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-250/70 p-5 mb-8 print:hidden transition-all duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm tracking-wide uppercase">
              <FiFilter className="text-[#004e59]" />
              <span>Report Filters</span>
            </h3>
          </div>

          {/* Main search row with toggle/clear/print buttons */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by reference, owner name, business, or method..."
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
                  {[appliedFilters.status, appliedFilters.startDate, appliedFilters.owner_id].filter(Boolean).length}
                </span>
              </button>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setAppliedFilters({ startDate: '', endDate: '', status: '', owner_id: '' });
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
                <FiPrinter size={14} /> Print Statement
              </button>
            </div>
          </div>

          {/* Advanced Collapsible filters */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Owner / Host Name
                </label>
                <select
                  value={appliedFilters.owner_id}
                  onChange={(e) => handleFilterChange('owner_id', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800"
                >
                  <option value="">All Owners / Hosts</option>
                  {uniqueOwners.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Payout Status
                </label>
                <select
                  value={appliedFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] transition-all text-gray-800"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div ref={datePickerRef} className="relative">
                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Custom Date Range
                </label>
                <div 
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className={`flex items-center gap-2 bg-white border ${
                    isDatePickerOpen ? 'border-[#004e59] ring-1 ring-[#004e59]' : 'border-gray-250'
                  } rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer select-none transition-all`}
                >
                  <FiCalendar className="text-gray-400" size={14} />
                  <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                    {appliedFilters.startDate ? fmtDate(appliedFilters.startDate) : "Start"} ➔ {appliedFilters.endDate ? fmtDate(appliedFilters.endDate) : "End"}
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
                        selected={appliedFilters.startDate ? new Date(appliedFilters.startDate) : null}
                        startDate={appliedFilters.startDate ? new Date(appliedFilters.startDate) : null}
                        endDate={appliedFilters.endDate ? new Date(appliedFilters.endDate) : null}
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

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 font-semibold">Failed to load payout records. Please try again.</div>
        ) : (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 print:grid-cols-2 print:gap-4">
              <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-100 shadow-sm print:border-gray-300 print:bg-transparent">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest print:text-gray-700">Total Payouts</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono print:text-black">{payouts.length}</h3>
              </div>
              <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-100 shadow-sm print:border-gray-300 print:bg-transparent">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest print:text-gray-700">Total Gross Earnings</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono print:text-black">{fmt(totalEarnings)}</h3>
              </div>
              <div className="bg-rose-50/70 p-5 rounded-xl border border-rose-100 shadow-sm print:border-gray-300 print:bg-transparent">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-widest print:text-gray-700">Commission Deducted</p>
                <h3 className="text-2xl font-black text-rose-700 mt-1 font-mono print:text-black">({fmt(totalCommission)})</h3>
              </div>
              <div className="bg-indigo-50/70 p-5 rounded-xl border border-indigo-100 shadow-sm print:border-gray-300 print:bg-transparent">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest print:text-gray-700">Net Amount Paid Out</p>
                <h3 className="text-2xl font-black text-indigo-800 mt-1 font-mono print:text-black">{fmt(totalNetPayout)}</h3>
              </div>
            </div>

            {/* Ledger Summary Block */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
              <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:px-0 print:border-b-2 print:border-gray-950">
                <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest print:text-black">Payout Summary Ledger</h3>
                <div className="flex items-center gap-3 print:hidden">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">{completedCount} Completed</span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">{pendingCount} Pending</span>
                </div>
              </div>
              <div className="p-8 print:px-0 print:py-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 print:border-gray-955">
                      <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Date</th>
                      <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black font-mono">Reference</th>
                      <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Owner Name</th>
                      <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Method</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Gross Earnings (৳)</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Commission (৳)</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Net Payout (৳)</th>
                      <th className="py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black print:hidden">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                    {payouts.length > 0 ? payouts.map((p, i) => (
                      <tr key={p.id || i} className="print:break-inside-avoid">
                        <td className="py-3 text-xs text-gray-600 print:text-black font-mono">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('en-CA') : '—'}
                        </td>
                        <td className="py-3 text-xs text-gray-800 print:text-black font-bold font-mono">
                          {p.payout_reference || '—'}
                        </td>
                        <td className="py-3 text-sm text-gray-800 print:text-black font-semibold">
                          {p.first_name} {p.last_name}
                          {p.business_name && <span className="block text-[10px] text-gray-400 font-normal">{p.business_name}</span>}
                        </td>
                        <td className="py-3 text-sm text-gray-650 print:text-black capitalize">
                          {(p.payment_method || '—').replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 text-right text-sm text-gray-800 print:text-black font-mono">
                          {fmtNumber(p.total_earnings)}
                        </td>
                        <td className="py-3 text-right text-sm text-rose-600 print:text-black font-mono">
                          ({fmtNumber(p.total_commission_paid)})
                        </td>
                        <td className="py-3 text-right text-sm font-bold text-emerald-705 print:text-black font-mono">
                          {fmtNumber(p.net_payout)}
                        </td>
                        <td className="py-3 text-center print:hidden">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${STATUS_STYLES[p.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                            {p.payment_status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-gray-400 text-sm">
                          No payout records found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {payouts.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-gray-900">
                        <td colSpan="4" className="py-4 text-sm font-extrabold text-gray-900 print:text-black uppercase tracking-wide">
                          TOTALS
                        </td>
                        <td className="py-4 text-right text-sm font-bold text-gray-900 print:text-black font-mono border-t border-gray-400">
                          {fmtNumber(totalEarnings)}
                        </td>
                        <td className="py-4 text-right text-sm font-bold text-rose-700 print:text-black font-mono border-t border-gray-400">
                          ({fmtNumber(totalCommission)})
                        </td>
                        <td className="py-4 text-right text-base font-black text-emerald-800 print:text-black font-mono border-t-2 border-b-4 border-double border-gray-900">
                          {fmtNumber(totalNetPayout)}
                        </td>
                        <td className="print:hidden"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Signature Block */}
            <div className="hidden print:grid grid-cols-2 gap-12 mt-20 pt-10">
              <div className="text-center">
                <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                <p className="text-xs font-semibold text-gray-700">Prepared By</p>
                <p className="text-[10px] text-gray-500">Finance & Accounts Department</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                <p className="text-xs font-semibold text-gray-700">Authorized Signature</p>
                <p className="text-[10px] text-gray-500">Keyhost Homes Executive</p>
              </div>
            </div>

            {/* Footnotes */}
            <div className="mt-8 pt-6 border-t border-gray-200 print:border-gray-900 text-xs text-gray-500 space-y-1">
              <p>* This statement is auto-generated by Keyhost Homes systems. All amounts are in Bangladeshi Taka (৳).</p>
              <p>* Commission deducted figures are shown in parentheses per standard accounting convention.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutReports;
