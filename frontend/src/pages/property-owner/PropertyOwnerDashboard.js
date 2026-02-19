import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiHome, FiCalendar, FiDollarSign, FiStar, FiLogIn, FiLogOut, FiMoon, FiGrid } from 'react-icons/fi';
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

  const topCards = [
    {
      title: 'Total Properties',
      value: propertiesData?.pagination?.totalItems || 0,
      icon: FiHome,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Bookings',
      value: bookingsData?.bookings?.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length || 0,
      icon: FiCalendar,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      title: 'Total Revenue',
      value: `BDT ${analyticsData?.totalRevenue || 0}`,
      icon: FiDollarSign,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      title: 'Average Rating',
      value: analyticsData?.averageRating || '0.0',
      icon: FiStar,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  const middleCards = [
    {
      title: 'Arrives Today',
      value: 0,
      icon: FiLogIn,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50'
    },
    {
      title: 'Departs Today',
      value: 0,
      icon: FiLogOut,
      color: 'text-rose-500',
      bg: 'bg-rose-50'
    },
    {
      title: 'Stays Today',
      value: 0,
      icon: FiMoon,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Owner Dashboard</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate('/property-owner/properties/new')} className="px-4 py-2 bg-[#0F2936] text-white rounded-md text-sm hover:bg-[#1A3A4A]">Add Property</button>
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

      {/* Booking Statistics/Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded bg-gray-100 hover:bg-gray-200"><FiGrid className="w-4 h-4" /></button>
            <span className="text-sm font-medium text-gray-600">Latest</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {bookingsLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : bookingsData?.bookings?.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-3 font-semibold border-b">Property</th>
                  <th className="p-3 font-semibold border-b">Guest</th>
                  <th className="p-3 font-semibold border-b">Dates</th>
                  <th className="p-3 font-semibold border-b">Amount</th>
                  <th className="p-3 font-semibold border-b">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {bookingsData.bookings.map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-blue-600">{sanitizeText(booking.property_title)}</td>
                    <td className="p-3">{booking.guest_first_name} {booking.guest_last_name}</td>
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
            <div className="text-center py-8 text-gray-500">No bookings found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
