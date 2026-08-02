import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiHeart, 
  FiStar, 
  FiMapPin, 
  FiCheckCircle, 
  FiChevronRight,
  FiGrid
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/authStore';
import { sanitizeText } from '../../utils/textUtils';
import { getImageUrl } from '../../utils/imageUrl';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { user, isPropertyOwner, isAdmin } = useAuthStore();

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
    } finally {
      setBookingsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'request_accepted':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'checked_in':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'checked_out':
        return 'bg-slate-50 text-slate-700 border border-slate-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const topCards = [
    {
      title: 'Total Bookings',
      value: bookingsData.length,
      icon: FiCalendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50/50',
      borderColor: 'hover:border-blue-200',
      hoverShadow: 'hover:shadow-blue-100/50',
      path: '/guest/bookings'
    },
    {
      title: 'Active Bookings',
      value: bookingsData.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length,
      icon: FiCheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      borderColor: 'hover:border-emerald-200',
      hoverShadow: 'hover:shadow-emerald-100/50',
      path: '/guest/bookings'
    },
    {
      title: 'Favorites',
      value: favoritesData.length,
      icon: FiHeart,
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
      borderColor: 'hover:border-rose-200',
      hoverShadow: 'hover:shadow-rose-100/50',
      path: '/guest/favorites'
    },
    {
      title: 'Cities Visited',
      value: new Set(bookingsData.map(b => b.property_city).filter(Boolean)).size,
      icon: FiMapPin,
      color: 'text-purple-600',
      bg: 'bg-purple-50/50',
      borderColor: 'hover:border-purple-200',
      hoverShadow: 'hover:shadow-purple-100/50',
      path: '/guest/bookings'
    }
  ];

  const middleCards = [
    {
      title: 'Upcoming Trips',
      value: bookingsData.filter(b => new Date(b.check_in_date) > new Date()).length,
      icon: FiCalendar,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50/50',
      borderColor: 'hover:border-cyan-200',
      hoverShadow: 'hover:shadow-cyan-100/50',
      path: '/guest/bookings'
    },
    {
      title: 'Completed Trips',
      value: bookingsData.filter(b => new Date(b.check_out_date) < new Date()).length,
      icon: FiCheckCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
      borderColor: 'hover:border-rose-200',
      hoverShadow: 'hover:shadow-rose-100/50',
      path: '/guest/bookings'
    },
    {
      title: 'Reviews Given',
      value: 0,
      icon: FiStar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/50',
      borderColor: 'hover:border-indigo-200',
      hoverShadow: 'hover:shadow-indigo-100/50',
      path: '/guest/bookings'
    }
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Become a host banner - mobile only */}
      {!isPropertyOwner() && !isAdmin() && user?.user_type !== 'staff' && (
        <Link
          to="/become-host"
          className="md:hidden flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
              <FiHome className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Become a host</p>
              <p className="text-xs text-gray-500 mt-0.5">List your property &amp; earn</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full whitespace-nowrap">Get started →</span>
        </Link>
      )}

      {/* Personalized Welcome Header */}
      <div className="bg-gradient-to-r from-navy-900 to-primary-900 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {getGreeting()}, {user?.first_name || 'Guest'}! 👋
          </h2>
          <p className="text-blue-100 text-sm mt-1.5 opacity-90 max-w-xl">
            Welcome to your traveller dashboard. Explore recommended properties, check your itineraries, and manage bookings.
          </p>
        </div>
        <button 
          onClick={() => navigate('/properties')} 
          className="px-5 py-3 bg-white text-navy-900 font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
        >
          Find Property
        </button>
      </div>

      {/* Top Cards Row */}
      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => navigate(card.path)}
              className={`bg-white rounded-xl p-4 shadow-sm border border-gray-150/60 hover:shadow-md ${card.hoverShadow} ${card.borderColor} hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex items-center justify-between`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <h4 className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">{card.title}</h4>
                  <p className="text-lg font-black text-gray-900 tracking-tight mt-0.5">{card.value}</p>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Middle Cards Row */}
      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 font-bold">Trip Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {middleCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => navigate(card.path)}
              className={`bg-white rounded-xl p-4 shadow-sm border border-gray-150/60 hover:shadow-md ${card.hoverShadow} ${card.borderColor} hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex items-center justify-between`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <h4 className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">{card.title}</h4>
                  <p className="text-lg font-black text-gray-900 tracking-tight mt-0.5">{card.value}</p>
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Recent Bookings Table & Recommended Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-150/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Quick view of your latest 5 reservations.</p>
            </div>
            <button
              onClick={() => navigate('/guest/bookings')}
              className="px-4 py-2 border border-gray-250/70 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none shadow-sm flex items-center gap-1 group"
            >
              <span>View All</span>
              <FiChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {bookingsLoading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : bookingsData?.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4 font-bold">Property</th>
                    <th className="px-6 py-4 font-bold">Dates</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 divide-y divide-gray-100/70">
                  {bookingsData.map((booking, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td 
                        className="px-6 py-4 font-semibold text-primary-600 max-w-[200px] truncate cursor-pointer hover:underline"
                        onClick={() => navigate(`/guest/bookings/${booking.id}`)}
                      >
                        {sanitizeText(booking.property_title)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(booking.check_in_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(booking.check_out_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        BDT {parseFloat(booking.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900">No bookings yet</h3>
                <p className="text-xs text-gray-400 mt-1">When you make a booking, it will show up here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Section (Premium Styling) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150/70 overflow-hidden p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended for You</h3>
          <div className="space-y-4">
            {recommendedData.slice(0, 3).map((property, index) => (
              <div 
                key={index} 
                className="flex gap-4 cursor-pointer hover:bg-gray-50/80 p-2.5 rounded-xl border border-transparent hover:border-gray-150 transition-all duration-300 group" 
                onClick={() => navigate(`/property/${property.slug || property.id}`)}
              >
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={getImageUrl(property.main_image?.image_url) || '/images/placeholder.svg'} 
                    alt={property.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-600 transition-colors">{sanitizeText(property.title)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sanitizeText(property.city)}</p>
                  <p className="text-xs font-extrabold text-rose-600 mt-1.5">BDT {parseFloat(property.base_price || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {recommendedData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400">No recommendations available at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
