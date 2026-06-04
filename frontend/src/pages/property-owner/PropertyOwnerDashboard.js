import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FiHome, 
  FiCalendar, 
  FiDollarSign, 
  FiStar, 
  FiLogIn, 
  FiLogOut, 
  FiMoon, 
  FiGrid,
  FiChevronRight
} from 'react-icons/fi';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';
import { sanitizeText } from '../../utils/textUtils';

const PropertyOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();

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
    'owner-bookings-recent',
    () => api.get('/property-owner/bookings?limit=5'),
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

  const topCards = [
    {
      title: 'Total Properties',
      value: propertiesData?.pagination?.totalItems || 0,
      icon: FiHome,
      color: 'text-blue-600',
      bg: 'bg-blue-50/50',
      borderColor: 'hover:border-blue-200',
      hoverShadow: 'hover:shadow-blue-100/50',
      path: '/property-owner/properties'
    },
    {
      title: 'Active Bookings',
      value: bookingsData?.bookings?.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length || 0,
      icon: FiCalendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      borderColor: 'hover:border-emerald-200',
      hoverShadow: 'hover:shadow-emerald-100/50',
      path: '/property-owner/bookings'
    },
    {
      title: 'Total Revenue',
      value: `BDT ${(analyticsData?.totalRevenue || 0).toLocaleString()}`,
      subValue: `Pending: BDT ${(analyticsData?.pendingRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50/55',
      borderColor: 'hover:border-amber-200',
      hoverShadow: 'hover:shadow-amber-100/50',
      path: '/property-owner/earnings'
    },
    {
      title: 'Average Rating',
      value: analyticsData?.averageRating || '0.0',
      icon: FiStar,
      color: 'text-purple-600',
      bg: 'bg-purple-50/50',
      borderColor: 'hover:border-purple-200',
      hoverShadow: 'hover:shadow-purple-100/50',
      path: '/property-owner/analytics'
    }
  ];

  const middleCards = [
    {
      title: 'Arrives Today',
      value: analyticsData?.arrivesToday || 0,
      icon: FiLogIn,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50/50',
      borderColor: 'hover:border-cyan-200',
      hoverShadow: 'hover:shadow-cyan-100/50',
      path: '/property-owner/bookings'
    },
    {
      title: 'Departs Today',
      value: analyticsData?.departsToday || 0,
      icon: FiLogOut,
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
      borderColor: 'hover:border-rose-200',
      hoverShadow: 'hover:shadow-rose-100/50',
      path: '/property-owner/bookings'
    },
    {
      title: 'Stays Today',
      value: analyticsData?.staysToday || 0,
      icon: FiMoon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/50',
      borderColor: 'hover:border-indigo-200',
      hoverShadow: 'hover:shadow-indigo-100/50',
      path: '/property-owner/bookings'
    }
  ];

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 py-2">
      {/* Personalized Welcome Header */}
      <div className="bg-gradient-to-r from-navy-900 to-primary-900 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {getGreeting()}, {user?.first_name || 'Host'}! 👋
          </h2>
          <p className="text-blue-100 text-sm mt-1.5 opacity-90 max-w-xl">
            Here's the latest performance update for your properties. Monitor bookings, track guest arrivals, and check earnings.
          </p>
        </div>
        <button 
          onClick={() => navigate('/property-owner/properties/new')} 
          className="px-5 py-3 bg-white text-navy-900 font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
        >
          Add New Property
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
                  {card.subValue && (
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{card.subValue}</p>
                  )}
                </div>
              </div>
              <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Middle Cards Row */}
      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 font-bold">Today's Schedule</h3>
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

      {/* Recent Bookings Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150/70 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Quick view of the latest 5 reservations on your properties.</p>
          </div>
          <button
            onClick={() => navigate('/property-owner/bookings')}
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
          ) : bookingsData?.bookings?.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4 font-bold">Property</th>
                  <th className="px-6 py-4 font-bold">Guest</th>
                  <th className="px-6 py-4 font-bold">Dates</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 divide-y divide-gray-100/70">
                {bookingsData.bookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-primary-600 max-w-[240px] truncate">
                      {sanitizeText(booking.property_title)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {booking.guest_name || `${booking.guest_first_name || ''} ${booking.guest_last_name || ''}`.trim() || 'Guest'}
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
              <h3 className="text-sm font-bold text-gray-900">No recent bookings</h3>
              <p className="text-xs text-gray-400 mt-1">When guest reservation requests arrive, they will show up here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
