import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiHome, FiCalendar, FiDollarSign, FiTrendingUp, FiPlus, FiEye, FiEdit, FiStar, FiUsers, FiBarChart, FiLogOut, FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const PropertyOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showSuccess, showError } = useToast();
  
  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      showError('Failed to logout');
    }
  };

  // Fetch property owner's properties
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery(
    'owner-properties',
    () => api.get('/property-owner/properties'),
    {
      select: (response) => response.data?.data || { properties: [], pagination: {} },
    }
  );

  // Fetch property owner's bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery(
    'owner-bookings',
    () => api.get('/property-owner/bookings?limit=10'),
    {
      select: (response) => response.data?.data || { bookings: [], pagination: {} },
    }
  );

  // Fetch property owner's analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'owner-analytics',
    () => api.get('/property-owner/analytics'),
    {
      select: (response) => response.data?.data || {},
    }
  );

  const stats = [
    {
      title: 'Total Properties',
      value: propertiesData?.pagination?.totalItems || 0,
      icon: FiHome,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Active Bookings',
      value: bookingsData?.bookings?.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length || 0,
      icon: FiCalendar,
      color: 'bg-green-500',
      change: '+5',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `BDT ${analyticsData?.totalRevenue || 0}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Average Rating',
      value: analyticsData?.averageRating || '0.0',
      icon: FiStar,
      color: 'bg-purple-500',
      change: '+0.3',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List a new property for rent',
      icon: FiPlus,
      color: 'bg-green-500',
      onClick: () => navigate('/property-owner/properties/new')
    },
    {
      title: 'Manage Properties',
      description: 'View and edit your properties',
      icon: FiHome,
      color: 'bg-blue-500',
      onClick: () => navigate('/property-owner/properties')
    },
    {
      title: 'View Bookings',
      description: 'Manage booking requests',
      icon: FiCalendar,
      color: 'bg-purple-500',
      onClick: () => navigate('/property-owner/bookings')
    },
    {
      title: 'Earnings Summary',
      description: 'Track your financial performance',
      icon: FiBarChart,
      color: 'bg-emerald-500',
      onClick: () => navigate('/property-owner/earnings')
    },
    {
      title: 'Analytics',
      description: 'View performance metrics',
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      onClick: () => navigate('/property-owner/analytics')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your properties and bookings</p>
          </div>
          {/* Mobile Logout Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => navigate('/property-owner/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiUser className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
          {/* Desktop Logout Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/property-owner/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiUser className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
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
                <FiTrendingUp className={`w-4 h-4 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`ml-1 text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="ml-1 text-sm text-gray-500">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{action.title}</div>
                      <div className="text-sm text-gray-600">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                {bookingsLoading ? (
                  <LoadingSpinner />
                ) : bookingsData?.bookings?.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsData.bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{booking.property_title}</h4>
                          <p className="text-sm text-gray-600">{booking.guest_first_name} {booking.guest_last_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
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
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Properties */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Properties</h2>
              <button
                onClick={() => navigate('/my-properties')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            {propertiesLoading ? (
              <LoadingSpinner />
            ) : propertiesData?.properties?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesData.properties.slice(0, 6).map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={property.main_image?.image_url || '/images/placeholder.svg'}
                      alt={property.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{property.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{property.city}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-red-600">BDT {property.base_price}/night</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          property.status === 'active' ? 'bg-green-100 text-green-800' :
                          property.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => navigate(`/property/${property.id}`)}
                          className="flex-1 btn-outline text-sm"
                        >
                          <FiEye className="inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/property-owner/properties/${property.id}/edit`)}
                          className="flex-1 btn-primary text-sm"
                        >
                          <FiEdit className="inline mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first property</p>
                <button
                  onClick={() => navigate('/property-owner/properties/new')}
                  className="btn-primary"
                >
                  <FiPlus className="inline mr-2" />
                  Add Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
