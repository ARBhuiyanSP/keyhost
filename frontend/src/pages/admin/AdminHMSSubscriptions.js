import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiDollarSign, FiUsers, FiPackage, 
  FiSearch, FiRefreshCw, FiCheckCircle, 
  FiAlertCircle, FiClock, FiCreditCard 
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminHMSSubscriptions = () => {
  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery(
    ['admin-hms-subscriptions', search, gatewayFilter, startDate, endDate],
    async () => {
      let params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (gatewayFilter) params.push(`gateway=${encodeURIComponent(gatewayFilter)}`);
      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const res = await api.get(`/admin/hms-subscriptions/revenue-analytics${queryString}`);
      return res.data?.data || {};
    },
    { refetchOnWindowFocus: false }
  );

  const summary = data?.summary || {};
  const payments = data?.payments || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <FiDollarSign className="w-6 h-6" />
            </span>
            HMS Subscription Revenue Analytics
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Track total revenue, active host subscriptions, and fee payment history.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div 
          className="p-5 rounded-2xl text-white shadow-md border-2 border-amber-600"
          style={{ backgroundColor: '#d97706' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">Net Subscription Revenue</span>
            <span className="p-2.5 bg-amber-800/60 rounded-xl text-amber-100 shadow-inner">
              <FiDollarSign className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight text-white">
            ৳{parseFloat(summary.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs font-bold text-amber-100 mt-2">
            Net fee payments (minus gateway fees)
          </p>
        </div>

        {/* Gateway Fees */}
        <div 
          className="p-5 rounded-2xl text-white shadow-md border-2 border-orange-600"
          style={{ backgroundColor: '#ea580c' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-orange-100">Gateway Fees Deducted</span>
            <span className="p-2.5 bg-orange-800/60 rounded-xl text-orange-100 shadow-inner">
              <FiCreditCard className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight text-white">
            ৳{parseFloat(summary.total_gateway_fees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs font-bold text-orange-100 mt-2">
            Payment gateway processing fees
          </p>
        </div>

        {/* Active Paid Subscriptions */}
        <div 
          className="p-5 rounded-2xl text-white shadow-md border-2 border-emerald-700"
          style={{ backgroundColor: '#059669' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">Active Paid Hosts</span>
            <span className="p-2.5 bg-emerald-800/60 rounded-xl text-emerald-100 shadow-inner">
              <FiUsers className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight text-white">
            {summary.active_paid_subscriptions || 0}
          </div>
          <p className="text-xs font-bold text-emerald-100 mt-2">
            Active paid plan subscribers
          </p>
        </div>

        {/* Total Orders / Renewals */}
        <div 
          className="p-5 rounded-2xl text-white shadow-md border-2 border-indigo-700"
          style={{ backgroundColor: '#4f46e5' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-100">Fee Transactions Logged</span>
            <span className="p-2.5 bg-indigo-800/60 rounded-xl text-indigo-100 shadow-inner">
              <FiPackage className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight text-white">
            {summary.total_orders || 0}
          </div>
          <p className="text-xs font-bold text-indigo-100 mt-2">
            Package purchases & renewals
          </p>
        </div>

        {/* Trialing Hosts */}
        <div 
          className="p-5 rounded-2xl text-white shadow-md border-2 border-blue-700"
          style={{ backgroundColor: '#2563eb' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-100">Free Trialing Hosts</span>
            <span className="p-2.5 bg-blue-800/60 rounded-xl text-blue-100 shadow-inner">
              <FiClock className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight text-white">
            {summary.trialing_subscriptions || 0}
          </div>
          <p className="text-xs font-bold text-blue-100 mt-2">
            Hosts currently on free trial
          </p>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Host Name, Email, Phone, TrxID..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Gateway Filter */}
          <div>
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Payment Gateways</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearch('');
                setGatewayFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Payment Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-amber-600" />
            HMS Subscription Payment Records ({payments.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner message="Loading subscription payment records..." />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <FiAlertCircle className="w-10 h-10 mx-auto text-gray-300" />
            <p className="font-bold text-gray-600">No subscription fee payment records found</p>
            <p className="text-xs text-gray-400">When hosts pay HMS subscription fees, the payment history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                  <th className="py-3.5 px-4">Host Details</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Gateway Fee</th>
                  <th className="py-3.5 px-4">Gateway & TrxID</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors font-medium text-gray-700">
                    <td className="py-4 px-4">
                      <div className="font-black text-gray-900">{p.host_name}</div>
                      <div className="text-xs text-gray-500 font-semibold">{p.host_email}</div>
                      {p.host_phone && <div className="text-xs text-gray-400 font-medium">{p.host_phone}</div>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{p.package_name}</div>
                      <div className="text-xs text-amber-600 font-bold">{p.duration_days} Days Access</div>
                    </td>
                    <td className="py-4 px-4 font-black text-gray-900">
                      ৳{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 font-bold text-orange-600">
                      {p.gateway_fee > 0 ? `৳${p.gateway_fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      {p.gateway_fee > 0 && p.gateway_channel && (
                        <div className="text-[10px] text-gray-400 font-medium">{p.gateway_channel}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg mb-1">
                        {p.payment_method}
                      </span>
                      <div className="font-mono text-xs text-gray-500 font-semibold">{p.tran_id}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-gray-600">
                      {new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-emerald-700">
                      {p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHMSSubscriptions;
