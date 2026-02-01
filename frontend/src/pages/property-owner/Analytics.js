import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar, FiStar, FiUsers, FiHome, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30'); // days

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery(
    ['owner-analytics', timeRange],
    () => api.get(`/property-owner/analytics?days=${timeRange}`),
    {
      select: (response) => response.data?.data || {},
    }
  );

  const stats = [
    {
      title: 'Total Revenue',
      value: `BDT ${analyticsData?.totalRevenue || 0}`,
      change: analyticsData?.revenueChange || 0,
      icon: FiDollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Bookings',
      value: analyticsData?.totalBookings || 0,
      change: analyticsData?.bookingsChange || 0,
      icon: FiCalendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Average Rating',
      value: analyticsData?.averageRating || '0.0',
      change: analyticsData?.ratingChange || 0,
      icon: FiStar,
      color: 'bg-yellow-500'
    },
    {
      title: 'Occupancy Rate',
      value: `${analyticsData?.occupancyRate || 0}%`,
      change: analyticsData?.occupancyChange || 0,
      icon: FiHome,
      color: 'bg-purple-500'
    }
  ];

  const topProperties = analyticsData?.topProperties || [];
  const recentBookings = analyticsData?.recentBookings || [];
  const revenueChart = analyticsData?.revenueChart || [];
  const bookingChart = analyticsData?.bookingChart || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Track your property performance</p>
            </div>
            <div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="input-field w-auto"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.change >= 0 ? (
                  <FiTrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <FiTrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stat.change)}%
                </span>
                <span className="ml-1 text-sm text-gray-500">from last period</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {isLoading ? (
              <LoadingSpinner />
            ) : revenueChart.length > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueChart.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-primary-500 rounded-t w-full mb-2"
                      style={{ height: `${(item.amount / Math.max(...revenueChart.map(r => r.amount))) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <span className="text-xs font-bold text-red-600">BDT {item.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>

          {/* Bookings Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend</h3>
            {isLoading ? (
              <LoadingSpinner />
            ) : bookingChart.length > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {bookingChart.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-blue-500 rounded-t w-full mb-2"
                      style={{ height: `${(item.count / Math.max(...bookingChart.map(b => b.count))) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <span className="text-xs font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No booking data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Properties */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Properties</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : topProperties.length > 0 ? (
                <div className="space-y-4">
                  {topProperties.map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{property.title}</h4>
                          <p className="text-sm text-gray-600">{property.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">BDT {property.revenue}</p>
                        <p className="text-sm text-gray-500">{property.bookings} bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No property data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium text-sm">
                            {booking.guest_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.property_title}</h4>
                          <p className="text-sm text-gray-600">{booking.guest_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">BDT {booking.amount}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent bookings</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Demographics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Local Guests</span>
                <span className="text-sm font-medium">{analyticsData?.localGuests || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">International Guests</span>
                <span className="text-sm font-medium">{analyticsData?.internationalGuests || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Business Travelers</span>
                <span className="text-sm font-medium">{analyticsData?.businessTravelers || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Sources</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Direct Bookings</span>
                <span className="text-sm font-medium">{analyticsData?.directBookings || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Online Travel Agents</span>
                <span className="text-sm font-medium">{analyticsData?.otaBookings || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Referrals</span>
                <span className="text-sm font-medium">{analyticsData?.referralBookings || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Stay Duration</span>
                <span className="text-sm font-medium">{analyticsData?.avgStayDuration || 0} nights</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Repeat Guest Rate</span>
                <span className="text-sm font-medium">{analyticsData?.repeatGuestRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cancellation Rate</span>
                <span className="text-sm font-medium">{analyticsData?.cancellationRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
