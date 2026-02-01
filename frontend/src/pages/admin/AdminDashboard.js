import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiUsers, FiHome, FiCalendar, FiDollarSign, FiTrendingUp, FiStar, FiEye, FiEdit, FiGrid, FiSettings } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading } = useQuery(
    'admin-dashboard',
    () => api.get('/admin/dashboard'),
    {
      select: (response) => response.data?.data || {},
    }
  );

  const stats = dashboardData?.statistics || {};
  const recentBookings = dashboardData?.recentBookings || [];
  const pendingReviews = dashboardData?.pendingReviews || [];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Properties',
      value: stats.totalProperties || 0,
      icon: FiHome,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: FiCalendar,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `BDT ${stats.totalRevenue || 0}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      change: '+22%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your booking system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
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
                <FiTrendingUp className={`w-4 h-4 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`ml-1 text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="ml-1 text-sm text-gray-500">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiUsers className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-500">View and manage all users</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/properties')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiHome className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage Properties</h3>
                  <p className="text-sm text-gray-500">Approve and manage properties</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/amenities')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiSettings className="w-8 h-8 text-teal-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Manage Amenities</h3>
                  <p className="text-sm text-gray-500">Manage property amenities</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/property-types')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiHome className="w-8 h-8 text-indigo-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Property Types</h3>
                  <p className="text-sm text-gray-500">Manage property types</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/display-categories')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiGrid className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Display Categories</h3>
                  <p className="text-sm text-gray-500">Manage home page categories</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/bookings')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiCalendar className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">View Bookings</h3>
                  <p className="text-sm text-gray-500">Monitor all bookings</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/reviews')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiStar className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Review Management</h3>
                  <p className="text-sm text-gray-500">Moderate reviews and ratings</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiTrendingUp className="w-8 h-8 text-indigo-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-500">View platform analytics</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <FiEdit className="w-8 h-8 text-gray-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">System Settings</h3>
                  <p className="text-sm text-gray-500">Configure platform settings</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{booking.property_title}</h4>
                        <p className="text-sm text-gray-600">{booking.guest_first_name} {booking.guest_last_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-bold text-red-600 mt-1">BDT {booking.total_amount}</p>
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

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
                <button
                  onClick={() => navigate('/admin/reviews')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : pendingReviews.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.property_title}</h4>
                          <p className="text-sm text-gray-600">{review.first_name} {review.last_name}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Handle approve review
                              api.patch(`/admin/reviews/${review.id}/status`, { status: 'approved' })
                                .then(() => {
                                  // Refresh data
                                  window.location.reload();
                                });
                            }}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              // Handle reject review
                              api.patch(`/admin/reviews/${review.id}/status`, { status: 'rejected' })
                                .then(() => {
                                  // Refresh data
                                  window.location.reload();
                                });
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiUsers className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Manage Users</div>
                <div className="text-sm text-gray-600">View and manage user accounts</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/properties')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiHome className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Manage Properties</div>
                <div className="text-sm text-gray-600">Approve and manage properties</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/amenities')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiSettings className="w-6 h-6 text-teal-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Manage Amenities</div>
                <div className="text-sm text-gray-600">Manage property amenities</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/display-categories')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiGrid className="w-6 h-6 text-orange-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Display Categories</div>
                <div className="text-sm text-gray-600">Manage home page categories</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/bookings')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiCalendar className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">View Bookings</div>
                <div className="text-sm text-gray-600">Monitor all bookings</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/reviews')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiStar className="w-6 h-6 text-yellow-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Review Management</div>
                <div className="text-sm text-gray-600">Moderate reviews</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
