import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiCreditCard, FiBarChart2, FiDownload, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminEarnings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('12');

  // Fetch earnings dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    'admin-earnings-dashboard',
    () => api.get('/admin/earnings/dashboard'),
    {
      select: (response) => response.data?.data || {},
      retry: false, // Don't retry if endpoint doesn't exist
      onError: (error) => {
        console.log('Dashboard API not available yet:', error.message);
      }
    }
  );

  // Fetch earnings history
  const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery(
    'admin-earnings-history',
    () => api.get('/admin/earnings/earnings?limit=10'),
    {
      select: (response) => response.data?.data || {},
      retry: false,
      onError: (error) => {
        console.log('Earnings history API not available yet:', error.message);
      }
    }
  );

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery(
    ['admin-earnings-analytics', selectedPeriod],
    () => api.get(`/admin/earnings/analytics?period=${selectedPeriod}`),
    {
      select: (response) => response.data?.data || {},
      retry: false,
      onError: (error) => {
        console.log('Analytics API not available yet:', error.message);
      }
    }
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Number only — no currency prefix
  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (dashboardLoading) {
    return <LoadingSpinner />;
  }

  // Show message if API endpoints are not available
  if (dashboardError || earningsError || analyticsError) {
    // Check if the error is due to authentication (401) vs API not available (404)
    const isAuthError = dashboardError?.response?.status === 401 || 
                       earningsError?.response?.status === 401 || 
                       analyticsError?.response?.status === 401;
    
    const isApiNotFound = dashboardError?.response?.status === 404 || 
                         earningsError?.response?.status === 404 || 
                         analyticsError?.response?.status === 404;

    if (isAuthError) {
      // Show authentication required message
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Earnings</h1>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-blue-800">
                  <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                  <p className="mb-4">
                    Please log in as an admin to access the earnings dashboard.
                  </p>
                  <div className="text-sm text-blue-700">
                    <p><strong>Next steps:</strong></p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Log in with admin credentials</li>
                      <li>Return to this page</li>
                      <li>View your earnings dashboard</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isApiNotFound) {
      // Show API not available message
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Earnings</h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-yellow-800">
                  <h3 className="text-lg font-semibold mb-2">Commission System Setup Required</h3>
                  <p className="mb-4">
                    The admin earnings API endpoints are not available yet. This is normal if the backend server hasn't been restarted after setting up the commission system.
                  </p>
                  <div className="text-sm text-yellow-700">
                    <p><strong>Next steps:</strong></p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Restart the backend server</li>
                      <li>Refresh this page</li>
                      <li>The earnings dashboard will then be available</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic error message for other types of errors
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Earnings</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-red-800">
                <h3 className="text-lg font-semibold mb-2">Error Loading Earnings Data</h3>
                <p className="mb-4">
                  There was an error loading the earnings dashboard. Please try refreshing the page.
                </p>
                <div className="text-sm text-red-700">
                  <p><strong>If the problem persists:</strong></p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Refresh the page</li>
                    <li>Contact support if the issue continues</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Provide default values to prevent undefined errors
  const {
    currentMonth = {
      total_bookings: 0,
      total_booking_amount: 0,
      total_commission: 0,
      total_tax: 0,
      net_earnings: 0,
      pending_amount: 0,
      paid_amount: 0,
      failed_amount: 0,
      payable_amount: 0  // Total - Commission = amount to pay owners
    },
    lifetime = {
      total_bookings: 0,
      total_booking_amount: 0,
      total_commission: 0,
      total_tax: 0,
      net_earnings: 0,
      pending_amount: 0,
      paid_amount: 0,
      failed_amount: 0,
      payable_amount: 0  // Total - Commission = amount to pay owners
    },
    monthlyEarnings = [],
    recentEarnings = [],
    settings = {
      admin_commission_rate: 10
    }
  } = dashboardData || {};

  const {
    earningsTrend = [],
    topProperties = [],
    paymentBreakdown = [],
    bookingPaymentBreakdown = []
  } = analyticsData || {};

  const totalBookingAmount = lifetime.total_booking_amount || 0;
  const totalCommission = lifetime.total_commission || 0;
  const paidToOwners = lifetime.completed_owner_payouts || 0;
  const payableAmount = lifetime.payable_amount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Earnings</h1>
          <p className="text-gray-600 mt-2">Track commission earnings from property bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Booking Amount */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalBookingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Commission Earned */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalCommission)}
                </p>
              </div>
            </div>
          </div>

          {/* Paid to Owners */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiTrendingDown className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid to Owners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paidToOwners)}
                </p>
              </div>
            </div>
          </div>

          {/* Payable Amount */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payable Amount</p>
                <p className={`text-2xl font-bold ${payableAmount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {formatCurrency(payableAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field w-auto"
              >
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
                <option value="24">Last 24 months</option>
              </select>
            </div>
            {earningsTrend.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FiBarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium">No earnings data yet</p>
                  <p className="text-sm mt-1">Data will appear once bookings are made</p>
                </div>
              </div>
            ) : (
              (() => {
                // Build chart — sort ascending by month
                const sorted = [...earningsTrend].sort((a, b) => a.month.localeCompare(b.month));
                const maxVal = Math.max(...sorted.map(d => parseFloat(d.total_booking_amount) || 0), 1);
                const chartH = 200;
                const chartW = 500;
                const padL = 60, padR = 10, padT = 10, padB = 40;
                const innerW = chartW - padL - padR;
                const innerH = chartH - padT - padB;
                const barGroupW = innerW / sorted.length;
                const barW = Math.min(barGroupW * 0.35, 24);
                const gap = barW * 0.4;

                // Y axis gridlines (5 levels)
                const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => ({
                  y: padT + innerH * (1 - r),
                  label: Math.round(maxVal * r).toLocaleString()
                }));

                return (
                  <div className="w-full overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full"
                      style={{ minWidth: `${Math.max(sorted.length * 60, 300)}px`, height: '220px' }}
                      aria-label="Earnings Trend Chart"
                    >
                      {/* Grid lines */}
                      {yTicks.map((t, i) => (
                        <g key={i}>
                          <line
                            x1={padL} y1={t.y} x2={chartW - padR} y2={t.y}
                            stroke="#e5e7eb" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3,3'}
                          />
                          <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {parseInt(t.label) >= 1000
                              ? `${(parseInt(t.label) / 1000).toFixed(0)}k`
                              : t.label}
                          </text>
                        </g>
                      ))}

                      {/* Y-axis label */}
                      <text
                        x={10} y={padT + innerH / 2}
                        textAnchor="middle" fontSize="9" fill="#6b7280"
                        transform={`rotate(-90, 10, ${padT + innerH / 2})`}
                      >
                        BDT
                      </text>

                      {/* Bars */}
                      {sorted.map((d, i) => {
                        const totalAmt = parseFloat(d.total_booking_amount) || 0;
                        const commission = parseFloat(d.total_commission) || 0;
                        const cx = padL + barGroupW * i + barGroupW / 2;
                        const totalH = (totalAmt / maxVal) * innerH;
                        const commH = (commission / maxVal) * innerH;
                        const [yr, mo] = d.month.split('-');
                        const monthLabel = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'short' });
                        const label = `${monthLabel} '${yr.slice(2)}`;
                        const totalY = padT + innerH - totalH;
                        const commY = padT + innerH - commH;

                        return (
                          <g key={d.month} className="group">
                            {/* Total Amount bar (blue) */}
                            <rect
                              x={cx - barW - gap / 2}
                              y={totalY}
                              width={barW}
                              height={totalH}
                              fill="#3b82f6"
                              rx="2"
                              opacity="0.85"
                              className="transition-opacity hover:opacity-100"
                            />
                            {/* Commission bar (green) */}
                            <rect
                              x={cx + gap / 2}
                              y={commY}
                              width={barW}
                              height={commH}
                              fill="#10b981"
                              rx="2"
                              opacity="0.85"
                              className="transition-opacity hover:opacity-100"
                            />
                            {/* Tooltip on hover (title) */}
                            <title>
                              {`${d.month}\nTotal: ৳${parseInt(totalAmt).toLocaleString()}\nCommission: ৳${parseInt(commission).toLocaleString()}\nBookings: ${d.bookings_count}`}
                            </title>
                            {/* X-axis label */}
                            <text
                              x={cx} y={padT + innerH + 16}
                              textAnchor="middle" fontSize="9" fill="#6b7280"
                            >
                              {label}
                            </text>
                          </g>
                        );
                      })}

                      {/* X axis line */}
                      <line
                        x1={padL} y1={padT + innerH}
                        x2={chartW - padR} y2={padT + innerH}
                        stroke="#d1d5db" strokeWidth="1"
                      />
                    </svg>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-2 px-4 justify-center text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-blue-500"></span>
                        Total Booking Amount
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500"></span>
                        Commission
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Payment Status Breakdown — two sections */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>

            {/* Reusable donut renderer */}
            {[
              {
                label: '🧾 Booking Payments',
                getData: (key) => {
                  const found = bookingPaymentBreakdown.find(p => p.payment_status === key);
                  return { count: found ? parseInt(found.count) : 0, amount: found ? parseFloat(found.total_amount) : 0 };
                },
                colors: {
                  paid:    { hex: '#10b981', bg: 'bg-emerald-500' },
                  pending: { hex: '#f59e0b', bg: 'bg-amber-400'   },
                  failed:  { hex: '#ef4444', bg: 'bg-red-500'     },
                },
                totalLabel: 'Total Collected',
                totalColor: 'text-gray-800',
                countSuffix: 'bookings',
                centerColor: '#10b981',
              },
              {
                label: '💰 Commission Payments',
                getData: (key) => {
                  const found = paymentBreakdown.find(p => p.payment_status === key);
                  return { count: found ? parseInt(found.count) : 0, amount: found ? parseFloat(found.amount) : 0 };
                },
                colors: {
                  paid:    { hex: '#6366f1', bg: 'bg-indigo-500' },
                  pending: { hex: '#f59e0b', bg: 'bg-amber-400'  },
                  failed:  { hex: '#ef4444', bg: 'bg-red-500'    },
                },
                totalLabel: 'Total Commission',
                totalColor: 'text-indigo-700',
                countSuffix: 'entries',
                centerColor: '#6366f1',
              },
            ].map((section, si) => {
              const allStatuses = ['paid', 'pending', 'failed'];
              const rows = allStatuses.map(k => ({ key: k, ...section.getData(k), color: section.colors[k] }));
              const totalAmt = rows.reduce((s, r) => s + r.amount, 0) || 1;
              const totalCnt = rows.reduce((s, r) => s + r.count, 0);

              // SVG donut params
              const r = 30, cx = 36, cy = 36, sw = 10;
              const circ = 2 * Math.PI * r;
              let cumPct = 0;

              return (
                <div key={si}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">{section.label}</p>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {totalCnt} {section.countSuffix}
                    </span>
                  </div>

                  {/* Chart + bars row */}
                  <div className="flex items-center gap-4">
                    {/* Donut chart */}
                    <div className="flex-shrink-0">
                      <svg width="72" height="72" viewBox="0 0 72 72">
                        {/* Background ring */}
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
                        {rows.map((row) => {
                          const pct = row.amount / totalAmt;
                          const dash = `${circ * pct} ${circ}`;
                          const offset = -(circ * cumPct);
                          cumPct += pct;
                          return (
                            <circle
                              key={row.key}
                              cx={cx} cy={cy} r={r}
                              fill="none"
                              stroke={row.color.hex}
                              strokeWidth={sw}
                              strokeDasharray={dash}
                              strokeDashoffset={offset}
                              strokeLinecap="butt"
                              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                          );
                        })}
                        {/* Center % */}
                        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#374151">
                          {totalAmt > 1 ? Math.round((rows.find(r => r.key === 'paid')?.amount || 0) / totalAmt * 100) : 0}%
                        </text>
                        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill="#9ca3af">paid</text>
                      </svg>
                    </div>

                    {/* Progress bars */}
                    <div className="flex-1 space-y-2">
                      {rows.map(row => {
                        const pct = totalAmt > 1 ? Math.round((row.amount / totalAmt) * 100) : 0;
                        return (
                          <div key={row.key}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${row.color.bg}`}></span>
                                <span className="capitalize font-medium text-gray-700">{row.key}</span>
                                <span className="text-gray-400">({row.count})</span>
                              </div>
                              <span className="font-semibold text-gray-700">{formatCurrency(row.amount)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${row.color.bg}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer total */}
                  <div className="mt-3 flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span>{section.totalLabel}</span>
                    <span className={`font-bold ${section.totalColor}`}>{formatCurrency(totalAmt === 1 ? 0 : totalAmt)}</span>
                  </div>

                  {/* Divider between sections */}
                  {si === 0 && <div className="border-t border-dashed border-gray-200 mt-4" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Earning Properties */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Earning Properties</h3>
          
          {/* Desktop view (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission (BDT)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-normal max-w-md">
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {property.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {property.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-905 font-bold">
                        {property.bookings_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-extrabold text-blue-700">
                        {formatNumber(property.total_commission)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view (hidden on desktop) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {topProperties.map((property) => (
              <div key={property.id} className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm space-y-3 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded">
                    {property.city}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {property.bookings_count} bookings
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">
                    {property.title}
                  </h4>
                </div>

                <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center text-xs">
                  <span className="text-xs font-semibold text-gray-400">Total Commission:</span>
                  <span className="font-extrabold text-blue-700 text-sm">
                    {formatNumber(property.total_commission)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
            <button 
              onClick={() => navigate('/admin/accounting')}
              className="btn-outline flex items-center justify-center"
            >
              <FiEye className="w-4 h-4 mr-2" />
              View All
            </button>
          </div>

          {/* Desktop view (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {earning.booking_reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal max-w-xs">
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {earning.property_title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {earning.property_city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {earning.guest_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {earning.guest_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-700">
                        {formatCurrency(earning.net_commission)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {earning.commission_rate}% of {formatCurrency(earning.booking_total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        earning.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        earning.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {earning.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(earning.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view (hidden on desktop) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {recentEarnings.map((earning) => (
              <div key={earning.id} className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm space-y-3 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {earning.booking_reference}
                  </span>
                  <span className="text-gray-400 font-semibold">
                    {formatDate(earning.created_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">
                    {earning.property_title}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium text-gray-700 mr-1">Location:</span> {earning.property_city}
                  </p>
                </div>

                <div className="border-t border-b border-gray-100 py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Guest</span>
                    <span className="font-bold text-gray-800">{earning.guest_name}</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 truncate max-w-[150px]">{earning.guest_email}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Commission</span>
                    <span className="font-extrabold text-green-700 text-sm block">
                      {formatCurrency(earning.net_commission)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {earning.commission_rate}% of {formatCurrency(earning.booking_total)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-semibold text-gray-400">Payment Status:</span>
                  <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    earning.payment_status === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                    earning.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {earning.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;
