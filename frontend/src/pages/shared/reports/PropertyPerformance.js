import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { FiPrinter } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDatesForPreset = (preset) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  switch (preset) {
    case 'this_month': {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'last_month': {
      const start = new Date(currentYear, currentMonth - 1, 1);
      const end = new Date(currentYear, currentMonth, 0);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'this_year': {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'last_year': {
      const start = new Date(currentYear - 1, 0, 1);
      const end = new Date(currentYear - 1, 11, 31);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }
    case 'last_30_days': {
      return { period: '30' };
    }
    case 'last_90_days': {
      return { period: '90' };
    }
    case 'all_time': {
      return { period: '9999' };
    }
    default:
      return { period: '365' };
  }
};

const PropertyPerformance = ({ userRole }) => {
    const isAdmin = userRole === 'admin';
    
    // Date range and custom picker states
    const [dateRange, setDateRange] = useState('last_30_days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Applied filter states
    const [appliedFilters, setAppliedFilters] = useState({
      dateRange: 'last_30_days',
      startDate: '',
      endDate: ''
    });

    const handleApplyFilters = () => {
      setAppliedFilters({
        dateRange,
        startDate,
        endDate
      });
    };

    const handlePresetChange = (preset) => {
      setDateRange(preset);
      if (preset !== 'custom') {
        setAppliedFilters({
          dateRange: preset,
          startDate: '',
          endDate: ''
        });
      }
    };

    // Calculate API query params based on applied filters
    const apiParams = useMemo(() => {
      const params = {};
      if (appliedFilters.dateRange === 'custom') {
        if (appliedFilters.startDate && appliedFilters.endDate) {
          params.startDate = appliedFilters.startDate;
          params.endDate = appliedFilters.endDate;
        }
      } else {
        const resolved = getDatesForPreset(appliedFilters.dateRange);
        if (resolved.period) {
          if (isAdmin) {
            params.period = resolved.period;
          } else {
            params.days = resolved.period;
          }
        } else {
          params.startDate = resolved.startDate;
          params.endDate = resolved.endDate;
        }
      }
      return params;
    }, [appliedFilters, isAdmin]);

    // Endpoint mapping
    const endpoint = isAdmin ? '/admin/analytics' : '/property-owner/analytics';
    
    const { data, isLoading, isError } = useQuery(
        [`${userRole}-performance-reports`, apiParams],
        () => api.get(endpoint, { params: apiParams }).then(res => res.data.data),
        { refetchOnWindowFocus: false, keepPreviousData: true }
    );

    const handlePrint = () => window.print();

    // Normalize keys since admin returns total_bookings/total_revenue and owner returns bookings/revenue
    const properties = useMemo(() => {
        if (!data) return [];
        const rawProperties = data.topProperties || [];
        return rawProperties.map(p => ({
            title: p.title || 'Unknown Property',
            bookings: parseInt(p.bookings ?? p.total_bookings ?? 0),
            revenue: parseFloat(p.revenue ?? p.total_revenue ?? 0)
        }));
    }, [data]);

    const formatCurrency = (amount) => {
        const value = parseFloat(amount || 0);
        const hasDecimals = value % 1 !== 0;
        return '৳' + value.toLocaleString('en-IN', {
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: 2
        });
    };

    const formatNumber = (amount) => {
        const value = parseFloat(amount || 0);
        const hasDecimals = value % 1 !== 0;
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: hasDecimals ? 2 : 0,
            maximumFractionDigits: 2
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
            <div className="bg-white px-8 py-8 border-b border-gray-200 print:hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Property Performance</h1>
                        <p className="text-gray-500 mt-2 text-sm font-medium">See how many days properties were booked.</p>
                    </div>
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                        <FiPrinter/> Print Report
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                
                {/* Filters bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8 print:hidden flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Time Period</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold"
                      value={dateRange}
                      onChange={(e) => handlePresetChange(e.target.value)}
                    >
                      <option value="last_30_days">Last 30 Days</option>
                      <option value="last_90_days">Last 90 Days</option>
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="this_year">This Year</option>
                      <option value="last_year">Last Year</option>
                      <option value="all_time">All Time</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {dateRange === 'custom' && (
                    <>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Start Date</label>
                        <input
                          type="date"
                          className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">End Date</label>
                        <input
                          type="date"
                          className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <button
                          onClick={handleApplyFilters}
                          className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-sm"
                        >
                          Apply Filter
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Property Performance Log</h1>
                    <p className="text-gray-500 text-xs mt-1">
                      Period: {appliedFilters.dateRange === 'custom'
                        ? `${appliedFilters.startDate} to ${appliedFilters.endDate}`
                        : appliedFilters.dateRange.replace(/_/g, ' ').toUpperCase()} &middot; Generated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 text-red-500 font-semibold">
                        Failed to load property performance data. Please try again later.
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden print:border-none print:shadow-none">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 print:bg-transparent print:border-b-2 print:border-gray-900 print:text-black">
                              <th className="px-6 py-4">Property Name</th>
                              <th className="px-6 py-4">Total Bookings</th>
                              <th className="px-6 py-4 text-right">Yield Revenue (BDT)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                            {properties.length > 0 ? (
                              properties.map((p, i) => (
                                <tr key={i} className="print:break-inside-avoid">
                                  <td className="px-6 py-4 font-bold text-gray-900 print:text-black">
                                    <Link 
                                      to={`${isAdmin ? '/admin/properties' : '/property-owner/properties'}?search=${encodeURIComponent(p.title)}`}
                                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                      {p.title}
                                    </Link>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 print:text-black font-mono">{p.bookings} confirmed bookings</td>
                                  <td className="px-6 py-4 text-right font-bold text-green-600 print:text-black font-mono">{formatNumber(p.revenue)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                  No property performance records found for this period.
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

export default PropertyPerformance;
