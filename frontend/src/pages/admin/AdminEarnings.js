import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiCreditCard, FiBarChart2, FiDownload, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminEarnings = () => {
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    paymentBreakdown = []
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
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiBarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chart visualization would go here</p>
                <p className="text-sm">Data: {earningsTrend.length} months</p>
              </div>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Status</h3>
            <div className="space-y-4">
              {paymentBreakdown.map((status) => (
                <div key={status.payment_status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status.payment_status === 'paid' ? 'bg-green-500' :
                      status.payment_status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="capitalize text-gray-700">
                      {status.payment_status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(status.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {status.count} transactions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Earning Properties */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Earning Properties</h3>
          <div className="overflow-x-auto">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProperties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {property.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.bookings_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(property.total_commission)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
            <button className="btn-outline">
              <FiEye className="w-4 h-4 mr-2" />
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
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
                  <tr key={earning.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {earning.booking_reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {earning.property_title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {earning.property_city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {earning.guest_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {earning.guest_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(earning.net_commission)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {earning.commission_rate}% of {formatCurrency(earning.booking_total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        earning.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        earning.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {earning.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(earning.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;
