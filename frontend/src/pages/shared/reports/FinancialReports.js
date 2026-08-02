import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiPrinter } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const fmt = (amount) => {
  const v = parseFloat(amount || 0);
  return '৳' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const FinancialReports = ({ userRole }) => {
  const isAdmin = userRole === 'admin';
  
  // Date range state
  const [dateRange, setDateRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Applied filters state (used for API query)
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: 'this_month',
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

  // Resolve API endpoint based on user role
  const endpoint = isAdmin
    ? `/admin/earnings/financial-reports`
    : `/property-owner/earnings/financial-reports`;

  const { data: responseData, isLoading, isError } = useQuery(
    [`${userRole}-financial-reports`, appliedFilters],
    () => api.get(endpoint, {
      params: {
        dateRange: appliedFilters.dateRange,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate
      }
    }).then(res => res.data.data),
    { refetchOnWindowFocus: false, keepPreviousData: true }
  );

  const handlePrint = () => window.print();

  const summary = responseData?.summary || {};
  const totalBookings = summary.total_bookings || 0;
  const gross = parseFloat(summary.gross_revenue || 0);
  const commission = parseFloat(summary.total_commission || 0);
  const tax = parseFloat(summary.total_tax || 0);
  const net = isAdmin ? parseFloat(summary.net_platform_earnings || 0) : parseFloat(summary.net_earnings || 0);
  const bookingsList = responseData?.bookings || [];
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:pb-0 font-sans text-gray-800">
      {/* Print Styles Override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-family: 'Inter', -apple-system, sans-serif !important;
          }
          .print-hidden {
            display: none !important;
          }
          /* Standard accounting double underline */
          .accounting-double-underline {
            border-top: 1px solid #111827 !important;
            border-bottom: 4px double #111827 !important;
            font-weight: 900 !important;
          }
          .print-border-black {
            border-color: #111827 !important;
          }
          .print-break-before-page {
            break-before: page !important;
          }
          tr {
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* ── HEADER ── */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Reports</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              {isAdmin ? 'Platform commission & booking revenue analytics' : 'Your income, expenses, and service charge records'}
            </p>
          </div>
          <div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <FiPrinter size={16} /> Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
        
        {/* Printable Statement Header */}
        <div className="hidden print:block mb-8 border-b-2 border-gray-950 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-gray-950 tracking-wider">KEYHOST HOMES</h2>
              <p className="text-xs text-gray-600 uppercase tracking-widest mt-0.5">Vacation Rentals & Property Management</p>
              <p className="text-[10px] text-gray-500 mt-1">support@keyhost24.com | www.keyhost24.com</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-extrabold text-gray-950 uppercase tracking-widest">INCOME STATEMENT</h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Statement Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs font-bold text-gray-800 mt-2">
                Reporting Period: {appliedFilters.dateRange === 'custom' 
                  ? `${appliedFilters.startDate} to ${appliedFilters.endDate}` 
                  : appliedFilters.dateRange.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8 print:hidden flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Date Range Preset</label>
            <select
              className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold"
              value={dateRange}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
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

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500">
            <p className="font-semibold text-lg">Failed to load financial records. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Gross Income Card */}
              <div className="bg-emerald-50/70 p-6 rounded-xl border border-emerald-100 print:border-gray-300 print:bg-transparent print:shadow-none shadow-sm transition duration-300 hover:shadow-md">
                <p className="text-xs font-bold text-emerald-800 print:text-gray-700 uppercase tracking-widest">Gross Revenue</p>
                <h3 className="text-3xl font-black text-gray-950 mt-2 print:text-black">
                  {fmt(gross)}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 font-medium hidden print:block">Total revenue before commission deductions</p>
              </div>

              {/* Service Charges Card */}
              <div className="bg-rose-50/70 p-6 rounded-xl border border-rose-100 print:border-gray-300 print:bg-transparent print:shadow-none shadow-sm transition duration-300 hover:shadow-md">
                <p className="text-xs font-bold text-rose-800 print:text-gray-700 uppercase tracking-widest">
                  {isAdmin ? 'Keyhost Revenue (Commission)' : 'Service Charges (Commission)'}
                </p>
                <h3 className="text-3xl font-black text-rose-800 mt-2 print:text-black">
                  {fmt(commission)}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 font-medium hidden print:block">
                  {isAdmin ? 'Platform commission revenue' : 'Platform service fee deductions'}
                </p>
              </div>
            </div>

            {/* Standard Accounting Financial Statement */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
              <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:px-0 print:border-b-2 print:border-gray-950">
                <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest print:text-gray-950">Ledger Statement</h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider print:hidden">
                  {appliedFilters.dateRange.replace('_', ' ')}
                </span>
              </div>
              
              <div className="p-8 print:px-0 print:py-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300 print:border-gray-950">
                      <th className="py-3 text-sm font-bold uppercase tracking-wider text-gray-700 print:text-black">Particulars</th>
                      <th className="py-3 text-right text-sm font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/4">Details (৳)</th>
                      <th className="py-3 text-right text-sm font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/4">Amount (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                    
                    {/* REVENUE SECTION */}
                    <tr>
                      <td className="py-4 font-bold text-gray-900 print:text-black text-sm uppercase tracking-wide" colSpan="3">
                        Revenue
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                        Gross Booking Revenue (Stay)
                      </td>
                      <td className="py-3.5 text-right text-sm text-gray-700 print:text-black font-semibold font-mono">
                        {fmt(gross)}
                      </td>
                      <td className="py-3.5 text-right text-sm text-gray-500"></td>
                    </tr>
                    <tr className="bg-gray-50/50 print:bg-transparent">
                      <td className="py-3 pl-6 text-sm font-bold text-gray-800 print:text-black uppercase">
                        Total Gross Revenue
                      </td>
                      <td className="py-3 text-right text-sm text-gray-500"></td>
                      <td className="py-3 text-right text-sm font-bold text-gray-900 print:text-black border-t border-gray-400 print:border-gray-600 font-mono">
                        {fmt(gross)}
                      </td>
                    </tr>

                    {/* LESS DEDUCTIONS SECTION */}
                    <tr>
                      <td className="py-4 font-bold text-gray-900 print:text-black text-sm uppercase tracking-wide pt-6" colSpan="3">
                        Less: Operating Deductions
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                        Platform Commission Deductions
                      </td>
                      <td className="py-3.5 text-right text-sm text-rose-600 print:text-black font-semibold font-mono">
                        ({fmt(commission)})
                      </td>
                      <td className="py-3.5 text-right text-sm text-gray-500"></td>
                    </tr>
                    {isAdmin && tax > 0 && (
                      <tr>
                        <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                          Tax / Vat Deductions
                        </td>
                        <td className="py-3.5 text-right text-sm text-rose-500 print:text-black font-semibold font-mono">
                          ({fmt(tax)})
                        </td>
                        <td className="py-3.5 text-right text-sm text-gray-500"></td>
                      </tr>
                    )}
                    <tr className="bg-gray-50/50 print:bg-transparent">
                      <td className="py-3 pl-6 text-sm font-bold text-gray-800 print:text-black uppercase">
                        Total Deductions
                      </td>
                      <td className="py-3 text-right text-sm text-gray-500"></td>
                      <td className="py-3 text-right text-sm font-bold text-rose-600 print:text-black border-t border-gray-400 print:border-gray-600 font-mono">
                        ({fmt(commission + (isAdmin ? tax : 0))})
                      </td>
                    </tr>

                    {/* FINAL SETTLED ROW */}
                    <tr className="bg-gray-50 print:bg-transparent">
                      <td className="py-5 text-base font-extrabold text-gray-950 print:text-black uppercase tracking-wider">
                        FINAL SETTLED (NET)
                      </td>
                      <td className="py-5 text-right text-sm text-gray-500"></td>
                      <td className="py-5 text-right text-lg font-black text-blue-700 print:text-black border-t-2 border-b-4 border-double border-gray-900 accounting-double-underline font-mono">
                        {fmt(net)}
                      </td>
                    </tr>

                    {/* Extra Statistics for details */}
                    <tr>
                      <td className="py-4 font-bold text-gray-900 print:text-black text-sm uppercase tracking-wide pt-8" colSpan="3">
                        Operational Metrics
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                        Total Bookings Recorded
                      </td>
                      <td className="py-3.5 text-right text-sm text-gray-500"></td>
                      <td className="py-3.5 text-right text-sm font-semibold text-gray-900 print:text-black font-mono">
                        {totalBookings}
                      </td>
                    </tr>
                    {isAdmin && (
                      <>
                        <tr>
                          <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                            Property Owner Payable Total
                          </td>
                          <td className="py-3.5 text-right text-sm text-gray-500"></td>
                          <td className="py-3.5 text-right text-sm font-bold text-cyan-700 print:text-black font-mono">
                            {fmt(summary.owner_payable_total)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                            Commission Collected (Paid)
                          </td>
                          <td className="py-3.5 text-right text-sm text-gray-500"></td>
                          <td className="py-3.5 text-right text-sm font-bold text-emerald-600 print:text-black font-mono">
                            {fmt(summary.collected_commission)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 pl-6 text-sm text-gray-700 print:text-black font-medium">
                            Commission Pending Collection
                          </td>
                          <td className="py-3.5 text-right text-sm text-gray-500"></td>
                          <td className="py-3.5 text-right text-sm font-bold text-amber-600 print:text-black font-mono">
                            {fmt(summary.pending_commission)}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SCHEDULE A: TOP PROPERTIES (Admin Only) */}
            {isAdmin && responseData?.topProperties?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none print-break-before-page">
                <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:px-0 print:border-b-2 print:border-gray-950">
                  <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest print:text-black">
                    Schedule A: Property Revenue Breakdown (Top 5)
                  </h3>
                </div>
                <div className="p-8 print:px-0 print:py-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300 print:border-gray-950">
                        <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Property Name</th>
                        <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">City</th>
                        <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/6">Bookings</th>
                        <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/5">Gross Revenue (৳)</th>
                        <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/5">Commission (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                      {responseData.topProperties.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 text-sm text-gray-800 print:text-black font-semibold">{p.title}</td>
                          <td className="py-3 text-sm text-gray-600 print:text-black">{p.city}</td>
                          <td className="py-3 text-right text-sm text-gray-800 print:text-black font-mono">{p.total_bookings}</td>
                          <td className="py-3 text-right text-sm text-gray-800 print:text-black font-bold font-mono">{fmt(p.gross_revenue)}</td>
                          <td className="py-3 text-right text-sm text-gray-850 print:text-black font-bold font-mono">{fmt(p.commission_earned)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCHEDULE B & C (Admin Only) */}
            {isAdmin && (responseData?.paymentMethods?.length > 0 || responseData?.commissionStatus?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print-break-before-page">
                {/* Schedule B: Payment Methods */}
                {responseData?.paymentMethods?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none print:mb-12">
                    <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 print:bg-transparent print:px-0 print:border-b-2 print:border-gray-950">
                      <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest print:text-black">
                        Schedule B: Revenue by Payment Method
                      </h3>
                    </div>
                    <div className="p-8 print:px-0 print:py-4">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300 print:border-gray-950">
                            <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Payment Method</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/4">Bookings</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/3">Amount (৳)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                          {responseData.paymentMethods.map((m, i) => (
                            <tr key={i}>
                              <td className="py-3 text-sm text-gray-800 print:text-black font-semibold capitalize">{m.method?.replace(/_/g, ' ') || 'Unknown'}</td>
                              <td className="py-3 text-right text-sm text-gray-800 print:text-black font-mono">{m.count}</td>
                              <td className="py-3 text-right text-sm text-gray-800 print:text-black font-bold font-mono">{fmt(m.total_amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Schedule C: Commission Receivables */}
                {responseData?.commissionStatus?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
                    <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 print:bg-transparent print:px-0 print:border-b-2 print:border-gray-955">
                      <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest print:text-black">
                        Schedule C: Commission Collection Status
                      </h3>
                    </div>
                    <div className="p-8 print:px-0 print:py-4">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300 print:border-gray-950">
                            <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Collection Status</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/4">Records</th>
                            <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/3">Commission (৳)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                          {responseData.commissionStatus.map((c, i) => (
                            <tr key={i}>
                              <td className="py-3 text-sm text-gray-800 print:text-black font-semibold capitalize">{c.payment_status}</td>
                              <td className="py-3 text-right text-sm text-gray-800 print:text-black font-mono">{c.count}</td>
                              <td className="py-3 text-right text-sm text-gray-800 print:text-black font-bold font-mono">{fmt(c.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SCHEDULE D: DETAILED BOOKINGS TRANSACTION DETAILS */}
            {bookingsList.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8 print:border-none print:shadow-none print-break-before-page">
                <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:px-0 print:border-b-2 print:border-gray-950">
                  <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-widest print:text-black">
                    {isAdmin ? 'Schedule D: Booking Transaction Details' : 'Schedule A: Booking Transaction Details'}
                  </h3>
                  <span className="text-xs bg-gray-250 text-gray-700 px-3 py-1 rounded-full font-bold print:hidden">
                    {bookingsList.length} records
                  </span>
                </div>
                <div className="p-8 print:px-0 print:py-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300 print:border-gray-950">
                        <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/8">Date</th>
                        <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/5">Reference</th>
                        <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black">Property Name</th>
                        <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/6">Gross Revenue (৳)</th>
                        <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/6">Commission (৳)</th>
                        <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700 print:text-black w-1/6">Net Earnings (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                      {bookingsList.map((b, i) => (
                        <tr key={i}>
                          <td className="py-3 text-xs text-gray-650 print:text-black font-mono">{b.date}</td>
                          <td className="py-3 text-xs text-gray-800 print:text-black font-bold font-mono">{b.booking_reference}</td>
                          <td className="py-3 text-sm text-gray-700 print:text-black truncate max-w-[200px]" title={b.property_title}>{b.property_title}</td>
                          <td className="py-3 text-right text-sm text-gray-800 print:text-black font-mono">{fmt(b.gross_revenue)}</td>
                          <td className="py-3 text-right text-sm text-rose-600 print:text-black font-mono">({fmt(b.commission)})</td>
                          <td className="py-3 text-right text-sm text-emerald-600 print:text-black font-bold font-mono">{fmt(b.net_earnings || (parseFloat(b.gross_revenue) - parseFloat(b.commission)))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Signature Block & Footnotes Container (Always forced together at the bottom) */}
            <div className="print-break-inside-avoid">
              {/* Signature Section - Only visible on print */}
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

              {/* Footnotes / Bookings metadata */}
              <div className="mt-12 pt-6 border-t border-gray-200 print:border-gray-900 text-xs text-gray-500 space-y-1">
                <p>* This statement is generated automatically by Keyhost Homes systems.</p>
                <p>* All bookings accounted for are settled and completed in "paid" status.</p>
                <p>* Calculated values correspond strictly to the period starting {appliedFilters.startDate || 'inception'} to {appliedFilters.endDate || 'present'}.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
