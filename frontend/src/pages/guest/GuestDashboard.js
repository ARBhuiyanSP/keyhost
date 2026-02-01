import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiCalendar, FiHeart, FiStar, FiMapPin, FiUsers, FiTrendingUp, FiSearch, FiLogOut, FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/authStore';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { user, logout } = useAuthStore();
  
  
  const [bookingsData, setBookingsData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [recommendedData, setRecommendedData] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch recent bookings
      console.log('Fetching bookings...');
      const bookingsResponse = await api.get('/guest/bookings?limit=5');
      console.log('Bookings response:', bookingsResponse.data);
      setBookingsData(bookingsResponse.data?.data?.bookings || []);

      // Fetch favorites
      console.log('Fetching favorites...');
      const favoritesResponse = await api.get('/guest/favorites');
      console.log('Favorites response:', favoritesResponse.data);
      setFavoritesData(favoritesResponse.data?.data?.favorites || []);

      // Fetch recommended properties
      console.log('Fetching recommended properties...');
      const recommendedResponse = await api.get('/guest/properties/recommended?limit=6');
      console.log('Recommended response:', recommendedResponse.data);
      setRecommendedData(recommendedResponse.data?.data?.properties || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      showError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingsLoading(false);
      setFavoritesLoading(false);
      setRecommendedLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      showError('Failed to logout');
    }
  };

  const quickActions = [
    {
      title: 'Find Properties',
      description: 'Search for accommodations',
      icon: FiSearch,
      color: 'bg-blue-500',
      onClick: () => {
        console.log('Navigating to /properties');
        navigate('/properties');
      }
    },
    {
      title: 'My Bookings',
      description: 'View your reservations',
      icon: FiCalendar,
      color: 'bg-green-500',
      onClick: () => {
        console.log('Navigating to /guest/bookings');
        navigate('/guest/bookings');
      }
    },
    {
      title: 'My Favorites',
      description: 'Saved properties',
      icon: FiHeart,
      color: 'bg-red-500',
      onClick: () => {
        console.log('Navigating to /guest/favorites');
        navigate('/guest/favorites');
      }
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile',
      icon: FiUsers,
      color: 'bg-purple-500',
      onClick: () => {
        console.log('Navigating to /guest/profile');
        navigate('/guest/profile');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back{user?.first_name ? `, ${user.first_name}` : ''}!</h1>
            <p className="text-gray-600 mt-2">Discover amazing places to stay</p>
          </div>
          {/* Mobile Logout Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => navigate('/guest/profile')}
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
              onClick={() => navigate('/guest/profile')}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                  <button
                    onClick={() => navigate('/guest/bookings')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                {bookingsLoading ? (
                  <LoadingSpinner />
                ) : bookingsData?.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsData.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => navigate(`/guest/bookings/${booking.id}`)}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <img
                          src={booking.property_image || '/images/placeholder.svg'}
                          alt={booking.property_title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-900">{booking.property_title}</h4>
                          <p className="text-sm text-gray-600">
                            {booking.property_city} • {booking.number_of_guests} guests
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring amazing properties!</p>
                    <button
                      onClick={() => navigate('/properties')}
                      className="btn-primary"
                    >
                      Browse Properties
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorites */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Favorites</h2>
              {favoritesLoading ? (
                <LoadingSpinner />
              ) : favoritesData?.length > 0 ? (
                <div className="space-y-3">
                  {favoritesData.slice(0, 3).map((favorite) => (
                    <div
                      key={favorite.id}
                      onClick={() => navigate(`/property/${favorite.property_id}`)}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <img
                        src={favorite.main_image || '/images/placeholder.svg'}
                        alt={favorite.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="ml-3 flex-1">
                        <h4 className="font-medium text-gray-900">{favorite.title}</h4>
                        <p className="text-sm text-gray-600">{favorite.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">BDT {favorite.base_price}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/guest/favorites')}
                    className="btn-outline w-full"
                  >
                    View All Favorites
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No favorites yet</p>
                </div>
              )}
            </div>

            {/* Travel Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Travel Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiCalendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Total Bookings</span>
                  </div>
                  <span className="font-medium">{bookingsData?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiMapPin className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Cities Visited</span>
                  </div>
                  <span className="font-medium">
                    {new Set(bookingsData?.map(b => b.property_city)).size || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiStar className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-gray-600">Reviews Given</span>
                  </div>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiHeart className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Favorites</span>
                  </div>
                  <span className="font-medium">{favoritesData?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Properties */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
            <button
              onClick={() => navigate('/properties')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </button>
          </div>

          {recommendedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="loading-skeleton h-48"></div>
                  <div className="p-4">
                    <div className="loading-skeleton h-4 mb-2"></div>
                    <div className="loading-skeleton h-4 w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedData?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedData.map((property) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img
                    src={property.main_image?.image_url || '/images/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <FiMapPin className="mr-1" />
                      {property.city}, {property.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiStar className="text-yellow-400 mr-1" />
                        <span className="font-medium">{property.average_rating || 'New'}</span>
                        <span className="text-gray-500 ml-1">({property.total_reviews})</span>
                      </div>
                      <span className="font-bold text-red-600">BDT {property.base_price}/night</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recommendations available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
