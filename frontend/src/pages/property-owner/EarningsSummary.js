import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCalendar, 
  FiClock, 
  FiHome,
  FiBarChart,
  FiPieChart,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EarningsSummary = () => {
  const [timeRange, setTimeRange] = useState('30'); // days

  // Fetch earnings data
  const { data: earningsData, isLoading, refetch } = useQuery(
    ['property-owner-earnings', timeRange],
    () => api.get(`/property-owner/earnings?period=${timeRange}`),
    {
      select: (response) => response.data?.data || {},
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGrowthIcon = (growth) => {
    const numGrowth = parseFloat(growth);
    if (numGrowth > 0) return <FiTrendingUp className="text-green-500" />;
    if (numGrowth < 0) return <FiTrendingDown className="text-red-500" />;
    return <FiBarChart className="text-gray-500" />;
  };

  const getGrowthColor = (growth) => {
    const numGrowth = parseFloat(growth);
    if (numGrowth > 0) return 'text-green-600';
    if (numGrowth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(earningsData?.totalEarnings || 0),
      icon: FiDollarSign,
      color: 'bg-green-500',
      subtitle: `${earningsData?.totalBookings || 0} bookings`
    },
    {
      title: 'Period Earnings',
      value: formatCurrency(earningsData?.periodEarnings || 0),
      icon: FiCalendar,
      color: 'bg-blue-500',
      subtitle: `Last ${timeRange} days`,
      growth: earningsData?.earningsGrowth || 0,
      growthLabel: 'vs previous period'
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(earningsData?.pendingAmount || 0),
      icon: FiClock,
      color: 'bg-yellow-500',
      subtitle: `${earningsData?.pendingBookings || 0} bookings remaining`
    },
    {
      title: 'Period Bookings',
      value: earningsData?.periodBookings || 0,
      icon: FiHome,
      color: 'bg-purple-500',
      subtitle: `Last ${timeRange} days`,
      growth: earningsData?.bookingsGrowth || 0,
      growthLabel: 'vs previous period'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings Summary</h1>
              <p className="mt-2 text-gray-600">
                Track your property earnings and financial performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={() => refetch()}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Refresh data"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  {stat.growth !== undefined && (
                    <div className="flex items-center mt-2">
                      {getGrowthIcon(stat.growth)}
                      <span className={`ml-1 text-sm font-medium ${getGrowthColor(stat.growth)}`}>
                        {stat.growth > 0 ? '+' : ''}{stat.growth}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">{stat.growthLabel}</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
              <FiBarChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {earningsData?.monthlyEarnings?.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(month.month + '-01').toLocaleDateString('bn-BD', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(month.earnings)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((month.earnings / Math.max(...(earningsData?.monthlyEarnings?.map(m => m.earnings) || [1]))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{month.bookings} bookings</span>
                      <span className="text-xs text-gray-500">
                        Avg: {formatCurrency(month.earnings / Math.max(month.bookings, 1))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
              <FiPieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {earningsData?.propertyEarnings?.slice(0, 5).map((property, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.city}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">{property.bookings} bookings</span>
                      <span className="text-xs text-gray-500">
                        Avg: {formatCurrency(property.avg_booking_value)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(property.earnings)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
              <FiDollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiDollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Total Received</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(earningsData?.totalEarnings || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiClock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">Pending Amount</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {formatCurrency(earningsData?.pendingAmount || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiCalendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">This Period</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(earningsData?.periodEarnings || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payments Received</h3>
              <FiCalendar className="w-5 h-5 text-gray-400" />
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
                      Payment Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earningsData?.recentEarnings?.map((earning, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {earning.booking_reference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{earning.property_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{earning.guest_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(earning.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(earning.created_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsSummary;
