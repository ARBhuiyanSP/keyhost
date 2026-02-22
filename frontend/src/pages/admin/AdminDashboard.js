import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  FiUsers, FiHome, FiCalendar, FiCheckCircle, FiClock,
  FiLogIn, FiLogOut, FiMoon, FiGrid, FiTrendingUp, FiDollarSign, FiActivity
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <FiActivity className="w-12 h-12 mb-2 opacity-20" />
        <p>No chart data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.bookings), 1);
  const chartHeight = 200;
  const barWidth = 40;
  const gap = 20;

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" height={chartHeight + 50} viewBox={`0 0 ${data.length * (barWidth + gap)} ${chartHeight + 50}`} className="overflow-visible">
        {data.map((d, i) => {
          const barHeight = (d.bookings / maxVal) * chartHeight;
          const x = i * (barWidth + gap);
          const y = chartHeight - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="url(#barGradient)"
                rx="4"
                className="transition-all duration-500 hover:opacity-80"
              />
              <text
                x={x + barWidth / 2}
                y={y - 10}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {d.bookings > 0 ? d.bookings : ''}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

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
  const chartData = dashboardData?.chartData || [];

  // Prepare chart data (ensure last 7 days are represented even if 0)
  const processedChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = chartData.find(c => c.date.startsWith(dateStr));
      days.push({
        date: dateStr,
        bookings: found ? found.bookings : 0
      });
    }
    return days;
  }, [chartData]);

  const topCards = [
    {
      title: 'Total Revenue',
      value: `৳${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-50 to-white'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: FiUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      gradient: 'from-blue-50 to-white'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: FiCalendar,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      gradient: 'from-violet-50 to-white'
    },
    {
      title: 'Active Properties',
      value: stats.totalProperties || 0,
      icon: FiHome,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      gradient: 'from-amber-50 to-white'
    }
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/bookings')}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            View All Bookings
          </button>
        </div>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topCards.map((card, index) => (
          <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow`}>
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500`}></div>

            <div className="relative z-10">
              <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
              <div className="flex items-center mt-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                <FiTrendingUp className="mr-1" />
                <span>+0.0%</span>
              </div>
            </div>
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center relative z-10 shadow-sm`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Booking Analytics</h3>
              <p className="text-sm text-gray-500">Daily bookings over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Bookings
              </div>
            </div>
          </div>
          <div className="relative w-full h-64 md:h-72 flex items-end justify-center">
            <SimpleBarChart data={processedChartData} />
          </div>
        </div>

        {/* Recent Activity / Pending Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Reviews</h3>
          {dashboardData?.pendingReviews?.length > 0 ? (
            <div className="space-y-4 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
              {dashboardData.pendingReviews.map((review) => (
                <div key={review.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/admin/reviews')}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {review.rating}/5
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{review.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    for <span className="font-medium text-gray-800">{review.property_title}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {review.first_name} {review.last_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <FiCheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-900 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">No pending reviews to moderate.</p>
            </div>
          )}
          <button onClick={() => navigate('/admin/reviews')} className="w-full mt-auto pt-4 text-center text-sm text-blue-600 font-medium hover:text-blue-700">
            View All Reviews
          </button>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
            <p className="text-sm text-gray-500">Latest reservations from guests</p>
          </div>
          <button onClick={() => navigate('/admin/bookings')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <FiLogOut className="w-4 h-4 transform rotate-180" /> {/* Using LogOut icon rotated as 'External Link' metaphor if ExternalLink not available, or just arrow */}
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentBookings.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {booking.booking_reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2 uppercase">
                          {booking.first_name?.[0]}{booking.last_name?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{booking.first_name} {booking.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 line-clamp-1 max-w-[200px]" title={booking.property_title}>
                        {booking.property_title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ৳{Number(booking.total_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <FiClock className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No recent bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
