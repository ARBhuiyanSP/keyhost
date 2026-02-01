import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiCreditCard, FiBarChart2, FiDownload, FiEye, FiSend, FiClock } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const PropertyOwnerEarnings = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState('12');

  // Fetch earnings dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    'property-owner-earnings-dashboard',
    () => api.get('/property-owner/earnings/dashboard'),
    {
      select: (response) => response.data?.data || {},
      retry: false,
      onError: (error) => {
        console.log('Dashboard API not available yet:', error.message);
      }
    }
  );

  // Fetch earnings history
  const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery(
    'property-owner-earnings-history',
    () => api.get('/property-owner/earnings/earnings?limit=10'),
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
    'property-owner-earnings-analytics',
    () => api.get(`/property-owner/earnings/analytics?period=${selectedPeriod}`),
    {
      select: (response) => response.data?.data || {},
      retry: false,
      onError: (error) => {
        console.log('Analytics API not available yet:', error.message);
      }
    }
  );

  // Fetch payout requests
  const { data: payoutsData, isLoading: payoutsLoading, refetch: refetchPayouts } = useQuery(
    'property-owner-payouts',
    () => api.get('/property-owner/earnings/payouts'),
    {
      select: (response) => {
        const data = response.data?.data || { payouts: [], pagination: {} };
        console.log('Payouts data:', data);
        return data;
      },
      retry: false,
      refetchOnWindowFocus: true
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Owner Earnings</h1>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-blue-800">
                  <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                  <p className="mb-4">
                    Please log in as a property owner to access the earnings dashboard.
                  </p>
                  <div className="text-sm text-blue-700">
                    <p><strong>Next steps:</strong></p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Log in with property owner credentials</li>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Owner Earnings</h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-yellow-800">
                  <h3 className="text-lg font-semibold mb-2">Earnings System Setup Required</h3>
                  <p className="mb-4">
                    The property owner earnings API endpoints are not available yet. This is normal if the backend server hasn't been restarted after setting up the earnings system.
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Owner Earnings</h1>
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

  const {
    currentMonth = {
      total_bookings: 0,
      total_booking_amount: 0,
      total_commission: 0,
      net_earnings: 0,
      pending_amount: 0,
      paid_amount: 0,
      available_for_payout: 0
    },
    lifetime = {
      total_bookings: 0,
      total_booking_amount: 0,
      total_commission: 0,
      net_earnings: 0,
      pending_amount: 0,
      paid_amount: 0,
      available_for_payout: 0
    },
    monthlyEarnings = [],
    recentEarnings = [],
    settings = {
      commission_rate: 10
    }
  } = dashboardData || {};

  const {
    earningsTrend = [],
    topProperties = [],
    paymentBreakdown = {
      cash_on_arrival: 0,
      online_payment: 0,
      bank_transfer: 0
    }
  } = analyticsData || {};

  const handlePayoutRequest = async () => {
    try {
      const response = await api.post('/property-owner/earnings/payout-request', {
        amount: currentMonth.available_for_payout,
        payment_method: 'bank_transfer'
      });
      
      if (response.data.success) {
        showSuccess('Payout request submitted successfully');
        // Refresh payout requests and dashboard data
        await queryClient.invalidateQueries('property-owner-payouts');
        await queryClient.invalidateQueries('property-owner-earnings-dashboard');
        // Explicitly refetch payout requests
        await refetchPayouts();
      }
    } catch (error) {
      console.error('Payout request error:', error);
      showError(error.response?.data?.message || 'Failed to submit payout request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Owner Earnings</h1>
          <p className="mt-2 text-gray-600">Track your bookings, commissions, and earnings</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="24">Last 2 years</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(lifetime.net_earnings)}</p>
              </div>
            </div>
          </div>

          {/* Commission Paid */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(lifetime.total_commission)}</p>
              </div>
            </div>
          </div>

          {/* Available for Payout */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available for Payout</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonth.available_for_payout)}</p>
              </div>
            </div>
          </div>

          {/* Commission Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiBarChart2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{settings.commission_rate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Request Section */}
        {currentMonth.available_for_payout > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
                <p className="text-gray-600">You have {formatCurrency(currentMonth.available_for_payout)} available for payout</p>
              </div>
              <button
                onClick={handlePayoutRequest}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Request Payout
              </button>
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Month vs Lifetime */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Month Earnings</span>
                <span className="font-semibold">{formatCurrency(currentMonth.net_earnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lifetime Earnings</span>
                <span className="font-semibold">{formatCurrency(lifetime.net_earnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Commission Paid</span>
                <span className="font-semibold text-red-600">{formatCurrency(lifetime.total_commission)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Amount</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(currentMonth.pending_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-semibold text-green-600">{formatCurrency(currentMonth.paid_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cash on Arrival</span>
                <span className="font-semibold">{formatCurrency(paymentBreakdown.cash_on_arrival)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Online Payment</span>
                <span className="font-semibold">{formatCurrency(paymentBreakdown.online_payment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bank Transfer</span>
                <span className="font-semibold">{formatCurrency(paymentBreakdown.bank_transfer)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Earnings</h3>
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
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Earnings
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {earning.booking_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {earning.property_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(earning.booking_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -{formatCurrency(earning.commission_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(earning.net_earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        earning.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : earning.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {earning.status}
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
        </div>

        {/* Payout Requests Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiSend className="mr-2 h-5 w-5" />
              Payout Requests
            </h2>
            {payoutsData && (
              <span className="text-sm text-gray-500">
                {payoutsData.payouts?.length || 0} request(s)
              </span>
            )}
          </div>

          {payoutsLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : payoutsData?.payouts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payoutsData.payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payout.payout_reference}
                        </div>
                        {payout.items_count > 0 && (
                          <div className="text-xs text-gray-500">
                            {payout.items_count} bookings
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </div>
                        {payout.total_earnings && (
                          <div className="text-xs text-gray-500">
                            Total: {formatCurrency(payout.total_earnings)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.payment_method?.replace('_', ' ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payout.status)}`}>
                          {payout.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.requested_at ? formatDate(payout.requested_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.processed_at ? formatDate(payout.processed_at) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payout.admin_notes || payout.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiSend className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payout requests</h3>
              <p className="text-gray-600">Your payout requests will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerEarnings;
