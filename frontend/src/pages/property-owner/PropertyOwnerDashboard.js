import React, { useState } from 'react';
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
  FiChevronRight,
  FiTrendingUp,
  FiActivity,
  FiBookOpen,
  FiClock,
  FiAward
} from 'react-icons/fi';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';
import { sanitizeText } from '../../utils/textUtils';

const TakaIcon = ({ className }) => (
  <span className={`${className} font-black font-sans flex items-center justify-center select-none`} style={{ fontSize: '18px', lineHeight: 1 }}>
    ৳
  </span>
);

const SolidBarChart = ({ data, dataKey, valuePrefix = '', fillHex = '#3b82f6', label = 'Bookings' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400">
        <FiActivity className="w-10 h-10 mb-2 opacity-20" style={{ color: fillHex }} />
        <p className="text-xs font-semibold">No data available for this period</p>
      </div>
    );
  }

  const values = data.map(d => parseFloat(d[dataKey] || 0));
  const maxVal = Math.max(...values, 1);
  const chartHeight = 150;
  const barWidth = 24;
  const gap = 16;
  const totalWidth = data.length * (barWidth + gap) - gap;

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 70
    });
    setHoveredIndex(index);
  };

  return (
    <div className="w-full relative pt-4">
      <div className="overflow-x-auto custom-scrollbar">
        <svg 
          width="100%" 
          height={chartHeight + 50} 
          viewBox={`0 0 ${totalWidth + 40} ${chartHeight + 50}`} 
          className="overflow-visible mx-auto relative"
        >
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
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {data.map((d, i) => {
            const val = parseFloat(d[dataKey] || 0);
            const barHeight = (val / maxVal) * chartHeight;
            const x = i * (barWidth + gap) + 10;
            const y = chartHeight - barHeight + 10;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {isHovered && (
                  <rect
                    x={x - gap / 2}
                    y={0}
                    width={barWidth + gap}
                    height={chartHeight + 15}
                    fill="#F3F4F6"
                    fillOpacity="0.7"
                    rx="6"
                  />
                )}

                {/* Solid Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  fill={fillHex}
                  rx="4"
                  className="transition-all duration-300 transform origin-bottom"
                  style={{
                    transform: isHovered ? 'scaleY(1.05)' : 'none'
                  }}
                />

                {/* Value Above Bar */}
                {!isHovered && val > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="text-[9px] font-black fill-gray-500 font-sans"
                  >
                    {valuePrefix}{val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                )}

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  className={`text-[9px] font-bold font-sans ${isHovered ? 'font-extrabold' : 'fill-gray-400'}`}
                  style={{ fill: isHovered ? fillHex : undefined }}
                >
                  {d.date}
                </text>
              </g>
            );
          })}

          {/* Invisible Interactive Columns for Mouse Tracking */}
          {data.map((d, i) => {
            const x = i * (barWidth + gap) + 10;
            const xOffset = x - gap / 2;
            const colWidth = barWidth + gap;

            return (
              <rect
                key={`interactive-daily-${i}`}
                x={xOffset}
                y={0}
                width={colWidth}
                height={chartHeight + 30}
                fill="transparent"
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div 
          className="absolute z-50 pointer-events-none bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-gray-800 flex flex-col gap-0.5 transition-all duration-100 ease-out"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`,
            minWidth: '150px'
          }}
        >
          <span className="text-[9px] font-black text-gray-400 tracking-wide uppercase">
            {data[hoveredIndex].date}
          </span>
          <div className="flex justify-between items-center gap-3 text-[10px] font-bold mt-0.5">
            <span className="text-gray-300">{label}:</span>
            <span className="font-extrabold" style={{ color: fillHex }}>
              {valuePrefix}{parseFloat(data[hoveredIndex][dataKey] || 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch properties
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery(
    'owner-properties',
    () => api.get('/property-owner/properties'),
    {
      select: (response) => response.data?.data || { properties: [], pagination: {} },
    }
  );

  // Fetch bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery(
    'owner-bookings-recent',
    () => api.get('/property-owner/bookings?limit=5'),
    {
      select: (response) => response.data?.data || { bookings: [], pagination: {} },
    }
  );

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'owner-analytics',
    () => api.get('/property-owner/analytics'),
    {
      select: (response) => response.data?.data || {},
    }
  );

  const stats = analyticsData || {};

  const topCards = [
    {
      title: 'Total Properties',
      value: propertiesData?.pagination?.totalItems || 0,
      icon: FiHome,
      bgColor: '#4f46e5', // solid indigo
      iconBgColor: '#3730a3',
      badgeBgColor: '#4338ca',
      titleColor: 'text-indigo-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-indigo-100 font-medium',
      trend: propertiesData?.pagination?.totalItems > 0 ? 'Active' : '0',
      description: 'Listed units',
      path: '/property-owner/properties'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: FiCalendar,
      bgColor: '#2563eb', // solid blue
      iconBgColor: '#1e40af',
      badgeBgColor: '#1d4ed8',
      titleColor: 'text-blue-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-blue-100 font-medium',
      trend: stats.bookingsChange > 0 ? `+${stats.bookingsChange}%` : `${stats.bookingsChange || 0}%`,
      description: 'Reservations',
      path: '/property-owner/bookings'
    },
    {
      title: 'Total Revenue',
      value: `৳${parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaIcon,
      bgColor: '#059669', // solid emerald
      iconBgColor: '#065f46',
      badgeBgColor: '#047857',
      titleColor: 'text-emerald-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-emerald-100 font-medium',
      trend: stats.revenueChange > 0 ? `+${stats.revenueChange}%` : `${stats.revenueChange || 0}%`,
      description: 'Gross payments',
      path: '/property-owner/earnings'
    },
    {
      title: 'Total Earning (Host Share)',
      value: `৳${parseFloat(stats.hostTotalEarning || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      bgColor: '#0d9488', // solid teal
      iconBgColor: '#115e59',
      badgeBgColor: '#0f766e',
      titleColor: 'text-teal-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-teal-100 font-medium',
      trend: 'Host Net',
      description: 'Your share',
      path: '/property-owner/earnings'
    },
    {
      title: 'Available Payout Balance',
      value: `৳${parseFloat(stats.availablePayoutBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      bgColor: '#0284c7', // solid sky blue
      iconBgColor: '#0369a1',
      badgeBgColor: '#075985',
      titleColor: 'text-sky-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-sky-100 font-medium',
      trend: stats.activePayoutRequest ? 'Pending' : 'Request Payout',
      description: stats.activePayoutRequest 
        ? `Pending: ৳${parseFloat(stats.activePayoutRequest.net_payout || 0).toLocaleString()}`
        : 'Click to view & request',
      path: '/property-owner/earnings'
    },
    {
      title: 'Cash Payment',
      value: `৳${parseFloat(stats.cashPayment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiActivity,
      bgColor: '#d97706', // solid amber
      iconBgColor: '#92400e',
      badgeBgColor: '#b45309',
      titleColor: 'text-amber-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-amber-100 font-medium',
      trend: 'Direct Cash',
      description: 'Collected by you',
      path: '/property-owner/earnings'
    },
    {
      title: 'Online Payment',
      value: `৳${parseFloat(stats.onlinePayment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaIcon,
      bgColor: '#7e22ce', // solid purple
      iconBgColor: '#6b21a8',
      badgeBgColor: '#581c87',
      titleColor: 'text-purple-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-purple-100 font-medium',
      trend: 'Online Pay',
      description: 'Platform collected',
      path: '/property-owner/earnings'
    },
    {
      title: 'Commission Paid',
      value: `৳${parseFloat(stats.commissionPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiStar,
      bgColor: '#ea580c', // solid orange
      iconBgColor: '#9a3412',
      badgeBgColor: '#c2410c',
      titleColor: 'text-orange-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-orange-100 font-medium',
      trend: 'Commission',
      description: 'Paid to platform',
      path: '/property-owner/earnings'
    },
    {
      title: 'Gateway Fee',
      value: `৳${parseFloat(stats.gatewayFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiAward,
      bgColor: '#e11d48', // solid rose/red
      iconBgColor: '#9f1239',
      badgeBgColor: '#be123c',
      titleColor: 'text-rose-100 font-bold',
      valueColor: 'text-white font-black',
      subColor: 'text-rose-100 font-medium',
      trend: 'Gateway Charges',
      description: 'Payment gateway fees',
      path: '/property-owner/earnings'
    }
  ];

  const middleCards = [
    {
      title: 'Arrives Today',
      value: stats.arrivesToday || 0,
      icon: FiLogIn,
      bgColor: '#e0f7fa',
      borderColor: '#b2ebf2',
      textColor: '#006064',
      iconBgColor: '#00838f',
      badgeBgColor: '#0097a7',
      trend: 'Check-ins',
      description: 'Guests arriving today',
      path: '/property-owner/bookings'
    },
    {
      title: 'Departs Today',
      value: stats.departsToday || 0,
      icon: FiLogOut,
      bgColor: '#ffebee',
      borderColor: '#ffcdd2',
      textColor: '#b71c1c',
      iconBgColor: '#c62828',
      badgeBgColor: '#d32f2f',
      trend: 'Check-outs',
      description: 'Guests checking out today',
      path: '/property-owner/bookings'
    },
    {
      title: 'Stays Today',
      value: stats.staysToday || 0,
      icon: FiMoon,
      bgColor: '#e8eaf6',
      borderColor: '#c5cae9',
      textColor: '#1a237e',
      iconBgColor: '#283593',
      badgeBgColor: '#303f9f',
      trend: 'In-house',
      description: 'Active occupied nights',
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

  return (
    <div className="space-y-8 py-2">

      {/* Top KPI Cards Row - SOLID Backgrounds via style */}
      <div>
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Financial Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
          {topCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => navigate(card.path)}
              className="rounded-2xl p-4 transition-all duration-300 flex items-start justify-between cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ backgroundColor: card.bgColor, color: '#ffffff' }}
            >
              <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                <span className={`text-[11px] font-black uppercase tracking-wider block truncate ${card.titleColor}`} style={{ color: '#ffffff', opacity: 0.95 }} title={card.title}>
                  {card.title}
                </span>
                <h3 className={`text-base xl:text-lg font-black font-sans tracking-tight truncate ${card.valueColor}`} style={{ color: '#ffffff' }}>
                  {card.value}
                </h3>
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: card.badgeBgColor, color: '#ffffff' }}>
                    <FiTrendingUp size={9} />
                    <span>{card.trend}</span>
                  </span>
                  <span className={`text-[9px] font-medium truncate ${card.subColor}`} style={{ color: '#ffffff', opacity: 0.85 }}>
                    {card.description}
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.iconBgColor }}>
                <card.icon className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule Insights Grid - SOLID Pastel Backgrounds */}
      <div className="space-y-3 no-print">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-bold">Today's Schedule</h3>
          <span className="text-[10px] text-gray-400 font-semibold">Real-time Arrivals & Departures</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {middleCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => navigate(card.path)}
              className="rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between group cursor-pointer border hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: card.bgColor, borderColor: card.borderColor, color: card.textColor }}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider line-clamp-1" style={{ color: card.textColor }}>
                  {card.title}
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200" style={{ backgroundColor: card.iconBgColor }}>
                  <card.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-sm md:text-base font-black font-sans tracking-tight truncate" style={{ color: card.textColor }}>
                  {card.value}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full text-white" style={{ backgroundColor: card.badgeBgColor }}>
                    <span>{card.trend}</span>
                  </span>
                  <span className="text-[9px] font-semibold truncate opacity-90" style={{ color: card.textColor }}>
                    {card.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking & Revenue Trends - SOLID Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Revenue Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Revenue Trends</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily payouts/revenue received over the last 30 days.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full">
              <FiActivity className="w-3.5 h-3.5" />
              <span>30 Days</span>
            </div>
          </div>
          <div className="mt-4">
            <SolidBarChart 
              data={stats.revenueChart} 
              dataKey="amount" 
              valuePrefix="৳" 
              fillHex="#10b981" 
              label="Revenue" 
            />
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Booking Trends</h3>
              <p className="text-xs text-gray-400 mt-0.5">Reservations logged over the last 30 days.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-extrabold bg-blue-50 px-2.5 py-1 rounded-full">
              <FiCalendar className="w-3.5 h-3.5" />
              <span>30 Days</span>
            </div>
          </div>
          <div className="mt-4">
            <SolidBarChart 
              data={stats.bookingChart} 
              dataKey="count" 
              valuePrefix="" 
              fillHex="#3b82f6" 
              label="Bookings" 
            />
          </div>
        </div>
      </div>

      {/* Recent Bookings Table & Top Performing Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table Card (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-150/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Recent Bookings</h3>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
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
                      <td className="px-6 py-4 font-semibold text-emerald-600 max-w-[200px] truncate">
                        {sanitizeText(booking.property_title)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {booking.guest_name || `${booking.guest_first_name || ''} ${booking.guest_last_name || ''}`.trim() || 'Guest'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(booking.check_in_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(booking.check_out_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ৳{parseFloat(booking.total_amount || 0).toLocaleString()}
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

        {/* Top Performing Properties Ranking (1/3 width) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150/70 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Top Performing Properties</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your listings ranked by revenue in current period.</p>
          </div>

          <div className="space-y-4 mt-6 flex-1">
            {stats.topProperties?.length > 0 ? (
              stats.topProperties.map((prop, i) => (
                <div key={prop.id || i} className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[140px]">{prop.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{prop.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">৳{parseFloat(prop.revenue || 0).toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-semibold">{prop.bookings} Bookings</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center text-gray-400">
                <FiAward className="w-10 h-10 mb-2 opacity-30 text-gray-400" />
                <span className="text-xs">No listings performance data available.</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PropertyOwnerDashboard;
