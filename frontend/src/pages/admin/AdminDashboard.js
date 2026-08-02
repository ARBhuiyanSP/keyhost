import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  FiUsers, FiHome, FiCalendar, FiCheckCircle, FiClock,
  FiLogOut, FiTrendingUp, FiDollarSign, FiActivity,
  FiStar, FiChevronRight, FiFileText, FiDollarSign as FiPayout, FiSettings
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <FiActivity className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm font-medium">No chart data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.bookings), 1);
  const chartHeight = 200;
  const barWidth = 32;
  const gap = 24;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pt-6">
      <svg 
        width="100%" 
        height={chartHeight + 60} 
        viewBox={`0 0 ${totalWidth + 40} ${chartHeight + 60}`} 
        className="overflow-visible mx-auto"
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4F46E5" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight * (1 - ratio) + 10;
          return (
            <line
              key={index}
              x1="0"
              y1={y}
              x2={totalWidth + 20}
              y2={y}
              stroke="#F3F4F6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          );
        })}

        {data.map((d, i) => {
          const barHeight = (d.bookings / maxVal) * chartHeight;
          const x = i * (barWidth + gap) + 10;
          const y = chartHeight - barHeight + 10;

          return (
            <g key={i} className="group cursor-pointer">
              {/* Tooltip Background (Hover indicator) */}
              <rect
                x={x - 6}
                y={0}
                width={barWidth + 12}
                height={chartHeight + 20}
                fill="#EEF2F6"
                rx="8"
                className="opacity-0 group-hover:opacity-40 transition-opacity duration-200"
              />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 6)}
                fill="url(#barGradient)"
                rx="6"
                filter="url(#shadow)"
                className="transition-all duration-300 transform group-hover:scale-y-105 origin-bottom"
              />

              {/* Tooltip Value */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs font-bold fill-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-250 font-sans"
              >
                {d.bookings}
              </text>

              {/* Static Value Above Bar when not hovered */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-500 group-hover:opacity-0 transition-opacity duration-150 font-sans"
              >
                {d.bookings > 0 ? d.bookings : ''}
              </text>

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-[11px] font-semibold fill-gray-400 group-hover:fill-gray-700 transition-colors font-sans"
              >
                {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
const TakaIcon = ({ className }) => (
  <span className={`${className} font-black font-sans flex items-center justify-center select-none`} style={{ fontSize: '20px', lineHeight: 1 }}>
    ৳
  </span>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading } = useQuery(
    'admin-dashboard',
    () => api.get('/admin/dashboard').then(res => res.data?.data || {}),
    { refetchOnWindowFocus: false }
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
      value: `৳${stats.totalRevenue?.toLocaleString('en-IN') || 0}`,
      icon: TakaIcon,
      color: 'text-emerald-600 border-emerald-100 bg-emerald-50/50',
      trend: '+12.4%',
      trendColor: 'text-emerald-700 bg-emerald-100/70',
      description: 'Gross platform earnings'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: FiUsers,
      color: 'text-blue-600 border-blue-100 bg-blue-50/50',
      trend: '+8.2%',
      trendColor: 'text-blue-700 bg-blue-100/70',
      description: 'Active guests & owners'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: FiCalendar,
      color: 'text-indigo-600 border-indigo-100 bg-indigo-50/50',
      trend: '+18.7%',
      trendColor: 'text-indigo-700 bg-indigo-100/70',
      description: 'Reservations logged'
    },
    {
      title: 'Active Properties',
      value: stats.totalProperties || 0,
      icon: FiHome,
      color: 'text-amber-600 border-amber-100 bg-amber-50/50',
      trend: '+4.1%',
      trendColor: 'text-amber-700 bg-amber-100/70',
      description: 'Online vacation rentals'
    }
  ];

  const quickActions = [
    {
      title: 'Property Manager',
      description: 'Add or modify listed properties',
      icon: FiHome,
      path: '/admin/properties',
      color: 'hover:border-amber-200 hover:bg-amber-50/10 text-amber-600 bg-amber-50'
    },
    {
      title: 'Financial Reports',
      description: 'View commission & stay statements',
      icon: FiFileText,
      path: '/admin/reports/financials',
      color: 'hover:border-emerald-200 hover:bg-emerald-50/10 text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Payout Reconciliation',
      description: 'Process owner payouts & dues',
      icon: TakaIcon,
      path: '/admin/reports/payouts',
      color: 'hover:border-indigo-200 hover:bg-indigo-50/10 text-indigo-600 bg-indigo-50'
    },
    {
      title: 'System Settings',
      description: 'Configure commission & APIs',
      icon: FiSettings,
      path: '/admin/settings',
      color: 'hover:border-rose-200 hover:bg-rose-50/10 text-rose-600 bg-rose-50'
    }
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-12">
      

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150 flex items-start justify-between hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
          >
            <div className="space-y-2">
              <span className="text-gray-400 text-xs font-extrabold uppercase tracking-wider block">{card.title}</span>
              <h3 className="text-lg md:text-xl font-black text-gray-900 font-sans tracking-tight">{card.value}</h3>
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${card.trendColor}`}>
                  <FiTrendingUp size={10} />
                  <span>{card.trend}</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{card.description}</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
              <card.icon className="w-5.5 h-5.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Administrative Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Quick Actions Console</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color.split(' ')[2]} border border-transparent group-hover:scale-105 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm tracking-wide">{action.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{action.description}</p>
                </div>
              </div>
              <FiChevronRight className="text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" size={18} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Booking Analytics Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Booking Velocity</h3>
            <p className="text-sm text-gray-500">Daily reservation counts over the last 7 days</p>
          </div>
          <div className="h-68 flex items-end">
            <SimpleBarChart data={processedChartData} />
          </div>
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Graph shows daily booking frequency</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block"></span>
              <span className="font-semibold text-gray-600">Confirmed Bookings</span>
            </span>
          </div>
        </div>

        {/* Pending Reviews Moderation Console */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Pending Reviews</h3>
              <p className="text-xs text-gray-500">Needs moderation approval</p>
            </div>
            {dashboardData?.pendingReviews?.length > 0 && (
              <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-rose-100">
                {dashboardData.pendingReviews.length} ACTION REQUIRED
              </span>
            )}
          </div>
          
          {dashboardData?.pendingReviews?.length > 0 ? (
            <div className="space-y-4 overflow-y-auto pr-1 max-h-[260px] custom-scrollbar flex-1">
              {dashboardData.pendingReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-150 hover:border-gray-200 transition-all cursor-pointer group" 
                  onClick={() => navigate('/admin/reviews')}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-0.5">
                      <FiStar size={10} className="fill-amber-600 text-amber-600" />
                      <span>{review.rating}.0</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{review.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    Property: <span className="font-semibold text-gray-700">{review.property_title}</span>
                  </p>
                  <div className="mt-2 flex justify-between items-center text-[10px] text-gray-400 font-medium border-t border-gray-200/50 pt-2">
                    <span>By {review.first_name} {review.last_name}</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-0.5 group-hover:underline">
                      <span>Moderate</span>
                      <FiChevronRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 py-12">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 border border-emerald-100">
                <FiCheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-gray-900 font-bold text-sm">All Reviews Moderated</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">No pending reviews require your attention right now.</p>
            </div>
          )}
          
          <button 
            onClick={() => navigate('/admin/reviews')} 
            className="w-full mt-5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl py-2.5 text-xs font-bold transition"
          >
            Manage Review Board
          </button>
        </div>
      </div>

      {/* Recent Bookings Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Reservations</h3>
            <p className="text-sm text-gray-500 font-medium">Overview of the latest stays and status logs</p>
          </div>
          <button 
            onClick={() => navigate('/admin/bookings')} 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 hover:underline"
          >
            <span>View Reservation Panel</span>
            <FiChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
          {recentBookings.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 py-3.5">Reference</th>
                  <th className="px-4 py-3.5">Guest Info</th>
                  <th className="px-4 py-3.5">Property / Unit</th>
                  <th className="px-4 py-3.5">Booked On</th>
                  <th className="px-4 py-3.5 text-right">Amount (৳)</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200">
                        {booking.booking_reference}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black mr-3 uppercase">
                          {booking.first_name?.[0] || 'G'}{booking.last_name?.[0] || 'U'}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 block">{booking.first_name} {booking.last_name}</span>
                          <span className="text-[10px] text-gray-400 font-medium block">Guest Customer</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-gray-700 line-clamp-1 max-w-[220px]" title={booking.property_title}>
                        {booking.property_title}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-gray-500 font-mono">
                      {new Date(booking.created_at).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right font-mono">
                      {Number(booking.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border
                        ${booking.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                          booking.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            booking.status === 'cancelled' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
                            'bg-gray-50 border-gray-200 text-gray-700'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FiClock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="font-bold text-sm">No Recent Bookings Found</p>
              <p className="text-xs text-gray-400 mt-1">There are no reservation logs recorded in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
