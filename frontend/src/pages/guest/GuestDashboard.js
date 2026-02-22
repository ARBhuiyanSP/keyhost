import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiCalendar, FiHeart, FiStar, FiMapPin, FiUsers, FiTrendingUp, FiSearch, FiLogOut, FiUser, FiGrid, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/authStore';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { user } = useAuthStore();

  const [bookingsData, setBookingsData] = useState([]);
  const [favoritesData, setFavoritesData] = useState([]);
  const [recommendedData, setRecommendedData] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent bookings
      const bookingsResponse = await api.get('/guest/bookings?limit=5');
      setBookingsData(bookingsResponse.data?.data?.bookings || []);

      // Fetch favorites
      const favoritesResponse = await api.get('/guest/favorites');
      setFavoritesData(favoritesResponse.data?.data?.favorites || []);

      // Fetch recommended properties
      const recommendedResponse = await api.get('/guest/properties/recommended?limit=6');
      setRecommendedData(recommendedResponse.data?.data?.properties || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      // showError('Failed to load dashboard data');
    } finally {
      setBookingsLoading(false);
    }
  };

  const topCards = [
    {
      title: 'Total Bookings',
      value: bookingsData.length,
      icon: FiCalendar,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Bookings',
      value: bookingsData.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length,
      icon: FiCheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      title: 'Favorites',
      value: favoritesData.length,
      icon: FiHeart,
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      title: 'Cities Visited',
      value: new Set(bookingsData.map(b => b.property_city)).size,
      icon: FiMapPin,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  const middleCards = [
    {
      title: 'Upcoming Trips',
      value: bookingsData.filter(b => new Date(b.check_in_date) > new Date()).length,
      icon: FiCalendar,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50'
    },
    {
      title: 'Completed Trips',
      value: bookingsData.filter(b => new Date(b.check_out_date) < new Date()).length,
      icon: FiCheckCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-50'
    },
    {
      title: 'Reviews Given',
      value: 0,
      icon: FiStar,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.first_name || 'Guest'}</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate('/properties')} className="px-4 py-2 bg-[#0F2936] text-white rounded-md text-sm hover:bg-[#1A3A4A]">Find Property</button>
        </div>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {middleCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className={`w-12 h-12 ${card.bg} rounded-full flex items-center justify-center mr-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded bg-gray-100 hover:bg-gray-200"><FiGrid className="w-4 h-4" /></button>
              <span className="text-sm font-medium text-gray-600">History</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {bookingsLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : bookingsData.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-3 font-semibold border-b">Property</th>
                    <th className="p-3 font-semibold border-b">Dates</th>
                    <th className="p-3 font-semibold border-b">Cost</th>
                    <th className="p-3 font-semibold border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {bookingsData.map((booking, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-blue-600 cursor-pointer" onClick={() => navigate(`/guest/bookings/${booking.id}`)}>{booking.property_title}</td>
                      <td className="p-3 text-xs">{new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-gray-800">BDT {booking.total_amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">No bookings yet</div>
            )}
          </div>
        </div>

        {/* Recommended Section (Simplified) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recommended</h3>
          <div className="space-y-4">
            {recommendedData.slice(0, 3).map((property, index) => (
              <div key={index} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => navigate(`/property/${property.id}`)}>
                <img src={property.main_image?.image_url || '/images/placeholder.svg'} alt={property.title} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium text-sm text-gray-900 line-clamp-1">{property.title}</p>
                  <p className="text-xs text-gray-500">{property.city}</p>
                  <p className="text-xs font-bold text-red-500 mt-1">BDT {property.base_price}</p>
                </div>
              </div>
            ))}
            {recommendedData.length === 0 && <p className="text-gray-500 text-center">No recommendations</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
