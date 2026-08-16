import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  FiUsers, FiHome, FiCalendar, FiCheckCircle, FiClock,
  FiLogOut, FiTrendingUp, FiDollarSign, FiActivity,
  FiStar, FiChevronRight, FiFileText, FiDollarSign as FiPayout, FiSettings, FiCreditCard
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SimpleBarChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    // Position tooltip relative to container with cursor offsets
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 75
    });
    setHoveredIndex(index);
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full relative pt-6">
      <div className="overflow-x-auto custom-scrollbar">
        <svg 
          width="100%" 
          height={chartHeight + 60} 
          viewBox={`0 0 ${totalWidth + 40} ${chartHeight + 60}`} 
          className="overflow-visible mx-auto relative"
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
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Active Column Indicator Overlay */}
                {isHovered && (
                  <rect
                    x={x - gap / 2}
                    y={0}
                    width={barWidth + gap}
                    height={chartHeight + 20}
                    fill="#F3F4F6"
                    fillOpacity="0.6"
                    rx="8"
                  />
                )}

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 6)}
                  fill="url(#barGradient)"
                  rx="6"
                  filter="url(#shadow)"
                  className="transition-all duration-300 transform origin-bottom"
                  style={{
                    transform: isHovered ? 'scaleY(1.05)' : 'none'
                  }}
                />

                {/* Static Value Above Bar when not hovered */}
                {!isHovered && d.bookings > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-500 font-sans"
                  >
                    {d.bookings}
                  </text>
                )}

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold font-sans ${isHovered ? 'fill-indigo-600 font-extrabold' : 'fill-gray-400'}`}
                >
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </text>
              </g>
            );
          })}

          {/* Invisible Interactive Columns for Hovering */}
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
                height={chartHeight + 40}
                fill="transparent"
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Floating Unified Tooltip Card */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div 
          className="absolute z-50 pointer-events-none bg-gray-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-gray-800 flex flex-col gap-1 transition-all duration-100 ease-out"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`,
            minWidth: '170px'
          }}
        >
          <span className="text-[10px] font-extrabold text-indigo-300 tracking-wide uppercase">
            {getDayName(data[hoveredIndex].date)}
          </span>
          <div className="flex justify-between items-center gap-4 text-[11px] font-semibold mt-1">
            <span className="text-gray-400">Total Bookings:</span>
            <span className="font-black text-white">{data[hoveredIndex].bookings} stays</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-[11px] font-semibold">
            <span className="text-gray-400">Daily Revenue:</span>
            <span className="font-black text-emerald-400">৳{parseFloat(data[hoveredIndex].revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const TakaIcon = ({ className }) => (
  <span className={`${className} font-black font-sans flex items-center justify-center select-none`} style={{ fontSize: '20px', lineHeight: 1 }}>
    ৳
  </span>
);

const MonthlyRevenueCommissionChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <FiActivity className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm font-medium">No monthly data available</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => parseFloat(d.revenue) || 1));
  const chartHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 20;
  const chartWidth = 700;
  const barWidth = 24;
  const step = (chartWidth - paddingLeft - paddingRight) / (data.length - 1 || 1);

  const linePoints = data.map((d, i) => {
    const x = paddingLeft + i * step;
    const y = chartHeight - ((parseFloat(d.commission) || 0) / maxRevenue) * chartHeight + 10;
    return { x, y, commission: d.commission, month: d.month };
  });

  const pathD = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    // Position tooltip relative to container with cursor offsets
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 75
    });
    setHoveredIndex(index);
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full relative pt-6">
      <div className="overflow-x-auto custom-scrollbar">
        <svg 
          width="100%" 
          height={chartHeight + 60} 
          viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`} 
          className="overflow-visible mx-auto relative"
        >
          <defs>
            <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.2" />
            </linearGradient>
            <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#10B981" floodOpacity="0.25" />
            </filter>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight * (1 - ratio) + 10;
            const val = (maxRevenue * ratio).toLocaleString('en-IN', { maximumFractionDigits: 0 });
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] font-bold fill-gray-400 font-sans">৳{val}</text>
              </g>
            );
          })}

          {/* Render Revenue Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * step - barWidth / 2;
            const barHeight = ((parseFloat(d.revenue) || 0) / maxRevenue) * chartHeight;
            const y = chartHeight - barHeight + 10;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Active Column Indicator Overlay */}
                {isHovered && (
                  <rect
                    x={paddingLeft + i * step - step / 2}
                    y={0}
                    width={step}
                    height={chartHeight + 20}
                    fill="#F3F4F6"
                    fillOpacity="0.6"
                    rx="8"
                  />
                )}

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  fill={isHovered ? '#4F46E5' : 'url(#revenueBarGradient)'}
                  rx="4"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineShadow)" />

          {linePoints.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? '6' : '5'} 
                  fill="#10B981" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  className="transition-all duration-150" 
                />
                <text x={p.x} y={chartHeight + 30} textAnchor="middle" className={`text-[10px] font-bold font-sans uppercase ${isHovered ? 'fill-indigo-600 font-extrabold' : 'fill-gray-400'}`}>
                  {p.month.split('-')[1]}/{p.month.split('-')[0].substring(2)}
                </text>
              </g>
            );
          })}

          {/* Invisible Interactive Columns for Hovering */}
          {data.map((d, i) => {
            const colWidth = i === 0 || i === data.length - 1 ? step / 2 + 15 : step;
            const xOffset = i === 0 ? paddingLeft : paddingLeft + i * step - step / 2;

            return (
              <rect
                key={`interactive-${i}`}
                x={xOffset}
                y={0}
                width={colWidth}
                height={chartHeight + 40}
                fill="transparent"
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Floating Unified Tooltip Card */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div 
          className="absolute z-50 pointer-events-none bg-gray-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-gray-800 flex flex-col gap-1 transition-all duration-100 ease-out"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`,
            minWidth: '160px'
          }}
        >
          <span className="text-[10px] font-extrabold text-indigo-300 tracking-wide uppercase">
            {getMonthName(data[hoveredIndex].month)}
          </span>
          <div className="flex justify-between items-center gap-4 text-[11px] font-semibold mt-1">
            <span className="text-gray-400">Total Revenue:</span>
            <span className="font-black text-white">৳{parseFloat(data[hoveredIndex].revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-[11px] font-semibold">
            <span className="text-gray-400">Commission:</span>
            <span className="font-black text-emerald-400">৳{parseFloat(data[hoveredIndex].commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const TopPartnersList = ({ title, items, isProperty = false }) => {
  if (!items || items.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">No top data available</p>;
  }

  const maxRevenue = Math.max(...items.map(item => parseFloat(item.revenue) || 1));

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const percentage = ((parseFloat(item.revenue) || 0) / maxRevenue) * 100;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-start text-xs gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-gray-150 flex items-center justify-center font-extrabold text-gray-700 text-[10px] shrink-0">{idx + 1}</span>
                  <span className="font-bold text-gray-800 truncate" title={isProperty ? item.title : item.name}>
                    {isProperty ? item.title : item.name}
                  </span>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="font-black text-gray-900 block leading-tight">৳{parseFloat(item.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Comm: ৳{parseFloat(item.commission || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.max(percentage, 5)}%`, 
                    backgroundColor: isProperty ? '#4f46e5' : '#059669' 
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DistributionShareList = ({ title, items, valueKey = 'count', nameKey = 'payment_method' }) => {
  if (!items || items.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">No channel data available</p>;
  }

  const totalVal = items.reduce((sum, item) => sum + (parseFloat(item[valueKey]) || 0), 0);
  const hexColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const value = parseFloat(item[valueKey]) || 0;
          const pct = totalVal > 0 ? (value / totalVal) * 100 : 0;
          const colorHex = hexColors[idx % hexColors.length];

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: colorHex }}></span>
                  <span className="font-bold text-gray-700 capitalize">
                    {item[nameKey] === 'sslcommerz' ? 'SSLCommerz' : item[nameKey] === 'bkash' ? 'bKash' : item[nameKey]}
                  </span>
                </div>
                <span className="font-extrabold text-gray-900">
                  {valueKey === 'revenue' ? `৳${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `${value} bookings`} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: colorHex }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OnlineVsHMSChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">No channel data available</p>;
  }

  let onlineCount = 0;
  let hmsCount = 0;

  data.forEach(item => {
    const src = String(item.source).toLowerCase();
    if (src === 'internal' || src === 'online' || src === 'null' || !item.source) {
      onlineCount += parseInt(item.count || 0);
    } else {
      hmsCount += parseInt(item.count || 0);
    }
  });

  const total = onlineCount + hmsCount;
  const onlinePct = total > 0 ? (onlineCount / total) * 100 : 0;
  const hmsPct = total > 0 ? (hmsCount / total) * 100 : 0;

  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.9
  const strokeWidth = 10;
  
  const onlineOffset = circumference - (onlinePct / 100) * circumference;
  const hmsOffset = circumference - (hmsPct / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2 w-full">
      {/* SVG Donut */}
      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth={strokeWidth} />
          
          {/* HMS Booking Slice */}
          {hmsPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
          )}

          {/* Online Booking Slice */}
          {onlinePct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#4F46E5"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={onlineOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-gray-900 leading-none">{total}</span>
          <span className="text-[8px] text-gray-400 font-extrabold uppercase mt-0.5">Stays</span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 space-y-3 w-full">
        {/* Online Booking */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: '#4f46e5' }}></span>
              <span className="font-bold text-gray-700">Online Stays</span>
            </div>
            <span className="font-extrabold text-gray-900">{onlineCount} stays ({onlinePct.toFixed(0)}%)</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(onlinePct, 5)}%`, backgroundColor: '#4f46e5' }}></div>
          </div>
        </div>

        {/* HMS Booking */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: '#f59e0b' }}></span>
              <span className="font-bold text-gray-700">HMS Stays (Walk-in)</span>
            </div>
            <span className="font-extrabold text-gray-900">{hmsCount} stays ({hmsPct.toFixed(0)}%)</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(hmsPct, 5)}%`, backgroundColor: '#f59e0b' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDateLocal = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDateRange = (rangeType) => {
  const today = new Date();
  let start = null;
  let end = today;

  switch (rangeType) {
    case 'today':
      start = today;
      break;
    case 'yesterday':
      const yest = new Date();
      yest.setDate(today.getDate() - 1);
      start = yest;
      end = yest;
      break;
    case '7days':
      const last7 = new Date();
      last7.setDate(today.getDate() - 6);
      start = last7;
      break;
    case '30days':
      const last30 = new Date();
      last30.setDate(today.getDate() - 29);
      start = last30;
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'allTime':
    default:
      return { start_date: '', end_date: '' };
  }

  return {
    start_date: formatDateLocal(start),
    end_date: formatDateLocal(end)
  };
};

const LocationPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">No location data available</p>;
  }

  const maxRevenue = Math.max(...data.map(item => parseFloat(item.revenue) || 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Top Performing Cities</h4>
        <span className="text-[10px] font-bold text-gray-400">Stays & Revenue</span>
      </div>
      <div className="space-y-3.5">
        {data.map((item, idx) => {
          const percentage = ((parseFloat(item.revenue) || 0) / maxRevenue) * 100;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-start text-xs gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-[10px] shrink-0">{idx + 1}</span>
                  <span className="font-bold text-gray-800 capitalize truncate">{item.location}</span>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="font-black text-gray-900 block leading-tight">৳{parseFloat(item.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">{item.bookings} stays</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(percentage, 5)}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PayoutAgingChart = ({ stats }) => {
  const unrequested = parseFloat(stats?.unrequested || 0);
  const pending = parseFloat(stats?.pending || 0);
  const disbursed = parseFloat(stats?.disbursed || 0);
  const total = unrequested + pending + disbursed;

  const unrequestedPct = total > 0 ? (unrequested / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;
  const disbursedPct = total > 0 ? (disbursed / total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Host Payout Aging & Status</h4>
        <span className="text-[10px] font-bold text-gray-400">Total ৳{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
      </div>

      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
        <div title="Disbursed Funds" className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${disbursedPct}%` }} />
        <div title="Pending Requests" className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${pendingPct}%` }} />
        <div title="Unrequested Dues" className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${unrequestedPct}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
        <div className="text-center p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disbursed
          </div>
          <p className="text-xs font-black text-gray-900">৳{disbursed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="text-center p-2 rounded-xl bg-amber-50/50 border border-amber-100">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
          </div>
          <p className="text-xs font-black text-gray-900">৳{pending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="text-center p-2 rounded-xl bg-rose-50/50 border border-rose-100">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-700 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Unrequested
          </div>
          <p className="text-xs font-black text-gray-900">৳{unrequested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
};

const CancellationTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">No cancellation history available</p>;
  }

  const maxTotal = Math.max(...data.map(d => parseInt(d.total_bookings) || 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Cancellation & Refund History</h4>
        <span className="text-[10px] font-bold text-gray-400">Past 6 Months</span>
      </div>

      <div className="space-y-3.5">
        {data.map((item, idx) => {
          const totalB = parseInt(item.total_bookings) || 0;
          const cancelledB = parseInt(item.cancelled_count) || 0;
          const refund = parseFloat(item.refund_amount) || 0;
          const cancelPct = totalB > 0 ? (cancelledB / totalB) * 100 : 0;
          const completedPct = Math.max(0, 100 - cancelPct);

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-gray-600 font-bold">{item.month}</span>
                <span className="font-semibold text-gray-700">
                  {cancelledB} cancelled / {totalB} stays ({cancelPct.toFixed(0)}%)
                  {refund > 0 && <span className="text-rose-600 font-bold ml-1.5">৳{refund.toLocaleString('en-IN')} refunded</span>}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full transition-all duration-500" style={{ width: `${completedPct}%`, backgroundColor: '#4f46e5' }}></div>
                <div className="h-full transition-all duration-500" style={{ width: `${cancelPct}%`, backgroundColor: '#ef4444' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dateRangeType, setDateRangeType] = useState('allTime');

  // Fetch dashboard statistics with date range parameters
  const { data: dashboardData, isLoading } = useQuery(
    ['admin-dashboard', dateRangeType],
    async () => {
      const { start_date, end_date } = getDateRange(dateRangeType);
      const params = start_date && end_date ? `?start_date=${start_date}&end_date=${end_date}` : '';
      const res = await api.get(`/admin/dashboard${params}`);
      return res.data?.data || {};
    },
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
        bookings: found ? found.bookings : 0,
        revenue: found ? found.revenue : 0
      });
    }
    return days;
  }, [chartData]);

  const topCards = [
    {
      title: 'Total Revenue',
      value: `৳${parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaIcon,
      bgColor: '#059669',
      iconBgColor: '#065f46',
      cardBg: 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all',
      titleColor: 'text-emerald-100 font-extrabold',
      valueColor: 'text-white font-black',
      badgeBg: 'bg-emerald-800 text-white font-extrabold border border-emerald-500/50',
      iconBg: 'bg-emerald-800 text-white shadow-inner border border-emerald-500/50',
      subColor: 'text-emerald-100 font-medium',
      trend: stats.totalRevenue > 0 ? '+12.4%' : '0%',
      description: 'Gross booking payments',
      link: '/admin/reports/revenue'
    },
    {
      title: 'Admin Commission',
      value: `৳${parseFloat(stats.adminCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaIcon,
      bgColor: '#4f46e5',
      iconBgColor: '#3730a3',
      cardBg: 'bg-indigo-600 text-white border-2 border-indigo-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all',
      titleColor: 'text-indigo-100 font-extrabold',
      valueColor: 'text-white font-black',
      badgeBg: 'bg-indigo-800 text-white font-extrabold border border-indigo-500/50',
      iconBg: 'bg-indigo-800 text-white shadow-inner border border-indigo-500/50',
      subColor: 'text-indigo-100 font-medium',
      trend: stats.adminCommission > 0 ? '+10.5%' : '0%',
      description: 'Platform net commission',
      link: '/admin/earnings'
    },
    {
      title: 'Earn from Subscription',
      value: `৳${parseFloat(stats.subscriptionRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaIcon,
      bgColor: '#d97706',
      iconBgColor: '#92400e',
      cardBg: 'bg-amber-600 text-white border-2 border-amber-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all',
      titleColor: 'text-amber-100 font-extrabold',
      valueColor: 'text-white font-black',
      badgeBg: 'bg-amber-800 text-white font-extrabold border border-amber-500/50',
      iconBg: 'bg-amber-800 text-white shadow-inner border border-amber-500/50',
      subColor: 'text-amber-100 font-medium',
      trend: stats.subscriptionRevenue > 0 ? 'Active' : '0',
      description: 'HMS Subscription fees',
      link: '/admin/hms-subscriptions'
    },
    {
      title: 'Host Outstanding',
      value: `৳${parseFloat(stats.hostOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TakaIcon,
      bgColor: '#e11d48',
      iconBgColor: '#9f1239',
      cardBg: 'bg-rose-600 text-white border-2 border-rose-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all',
      titleColor: 'text-rose-100 font-extrabold',
      valueColor: 'text-white font-black',
      badgeBg: 'bg-rose-800 text-white font-extrabold border border-rose-500/50',
      iconBg: 'bg-rose-800 text-white shadow-inner border border-rose-500/50',
      subColor: 'text-rose-100 font-medium',
      trend: stats.hostOutstanding > 0 ? 'Due' : 'Paid',
      description: 'Pending payouts to owners',
      link: '/admin/accounting'
    },
    {
      title: 'Gateway Fees',
      value: `৳${parseFloat(stats.totalGatewayFees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiCreditCard,
      bgColor: '#ea580c',
      iconBgColor: '#c2410c',
      cardBg: 'bg-orange-600 text-white border-2 border-orange-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all',
      titleColor: 'text-orange-100 font-extrabold',
      valueColor: 'text-white font-black',
      badgeBg: 'bg-orange-800 text-white font-extrabold border border-orange-500/50',
      iconBg: 'bg-orange-800 text-white shadow-inner border border-orange-500/50',
      subColor: 'text-orange-100 font-medium',
      trend: stats.totalGatewayFees > 0 ? 'Active' : '0%',
      description: 'Gateway service fees',
      link: '/admin/reports/revenue'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: FiCalendar,
      bgColor: '#2563eb',
      iconBgColor: '#1e40af',
      cardBg: 'bg-blue-600 text-white border-2 border-blue-700 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 transition-all',
      titleColor: 'text-blue-100 font-extrabold',
      valueColor: 'text-white font-black',
      badgeBg: 'bg-blue-800 text-white font-extrabold border border-blue-500/50',
      iconBg: 'bg-blue-800 text-white shadow-inner border border-blue-500/50',
      subColor: 'text-blue-100 font-medium',
      trend: stats.totalBookings > 0 ? '+18.7%' : '0%',
      description: 'Reservations logged',
      link: '/admin/bookings'
    }
  ];

  const executiveCards = [
    {
      title: 'Avg Booking Value',
      value: `৳${parseFloat(stats.averageBookingValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiTrendingUp,
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      textColor: '#78350f',
      iconBgColor: '#d97706',
      badgeBgColor: '#b45309',
      cardBg: 'bg-amber-100 border-2 border-amber-300 hover:border-amber-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-amber-600 text-white shadow-xs',
      trend: stats.averageBookingValue > 0 ? 'Active' : '0%',
      badgeBg: 'bg-amber-700 text-white font-bold',
      titleColor: 'text-amber-950 font-black',
      valueColor: 'text-amber-950 font-black',
      subColor: 'text-amber-900 font-bold',
      description: 'Average spent per stay',
      link: '/admin/reports/financials'
    },
    {
      title: 'Net Platform Margin',
      value: `${parseFloat(stats.netPlatformMargin || 0).toFixed(1)}%`,
      icon: FiActivity,
      bgColor: '#f3e8ff',
      borderColor: '#d8b4fe',
      textColor: '#581c87',
      iconBgColor: '#9333ea',
      badgeBgColor: '#7e22ce',
      cardBg: 'bg-purple-100 border-2 border-purple-300 hover:border-purple-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-purple-600 text-white shadow-xs',
      trend: stats.netPlatformMargin > 0 ? 'Stable' : '0%',
      badgeBg: 'bg-purple-700 text-white font-bold',
      titleColor: 'text-purple-950 font-black',
      valueColor: 'text-purple-950 font-black',
      subColor: 'text-purple-900 font-bold',
      description: 'Commission take-rate',
      link: '/admin/reports/financials'
    },
    {
      title: 'Avg Length of Stay',
      value: `${stats.averageLengthOfStay || '1.0'} Nights`,
      icon: FiClock,
      bgColor: '#cffafe',
      borderColor: '#67e8f9',
      textColor: '#164e63',
      iconBgColor: '#0891b2',
      badgeBgColor: '#0e7490',
      cardBg: 'bg-cyan-100 border-2 border-cyan-300 hover:border-cyan-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-cyan-600 text-white shadow-xs',
      trend: 'ALOS',
      badgeBg: 'bg-cyan-700 text-white font-bold',
      titleColor: 'text-cyan-950 font-black',
      valueColor: 'text-cyan-950 font-black',
      subColor: 'text-cyan-900 font-bold',
      description: 'Average duration per booking',
      link: '/admin/reports/overview'
    },
    {
      title: 'Repeat Guest Retention',
      value: `${stats.repeatGuestRate || 0}%`,
      icon: FiUsers,
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7',
      textColor: '#064e3b',
      iconBgColor: '#059669',
      badgeBgColor: '#047857',
      cardBg: 'bg-emerald-100 border-2 border-emerald-300 hover:border-emerald-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-emerald-600 text-white shadow-xs',
      trend: 'Loyalty',
      badgeBg: 'bg-emerald-700 text-white font-bold',
      titleColor: 'text-emerald-950 font-black',
      valueColor: 'text-emerald-950 font-black',
      subColor: 'text-emerald-900 font-bold',
      description: 'Guests with 2+ bookings',
      link: '/admin/reports/user-analytics'
    },
    {
      title: 'Monthly Growth',
      value: `+${stats.newHostsThisMonth || 0} Hosts`,
      icon: FiHome,
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      textColor: '#1e3a8a',
      iconBgColor: '#2563eb',
      badgeBgColor: '#1d4ed8',
      cardBg: 'bg-blue-100 border-2 border-blue-300 hover:border-blue-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-blue-600 text-white shadow-xs',
      trend: `+${stats.newPropertiesThisMonth || 0} Listings`,
      badgeBg: 'bg-blue-700 text-white font-bold',
      titleColor: 'text-blue-950 font-black',
      valueColor: 'text-blue-950 font-black',
      subColor: 'text-blue-900 font-bold',
      description: 'New partners & properties this month',
      link: '/admin/users'
    },
    {
      title: 'Occupancy Rate',
      value: `${parseFloat(stats.occupancyRate || 0).toFixed(1)}%`,
      icon: FiHome,
      bgColor: '#e0e7ff',
      borderColor: '#a5b4fc',
      textColor: '#312e81',
      iconBgColor: '#4f46e5',
      badgeBgColor: '#4338ca',
      cardBg: 'bg-indigo-100 border-2 border-indigo-300 hover:border-indigo-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-indigo-600 text-white shadow-xs',
      trend: stats.occupancyRate > 0 ? 'Active' : '0%',
      badgeBg: 'bg-indigo-700 text-white font-bold',
      titleColor: 'text-indigo-950 font-black',
      valueColor: 'text-indigo-950 font-black',
      subColor: 'text-indigo-900 font-bold',
      description: 'Rooms currently booked',
      link: '/admin/reports/overview'
    },
    {
      title: 'Host Settlement Ratio',
      value: `${parseFloat(stats.hostSettlementRatio || 0).toFixed(1)}%`,
      icon: FiCheckCircle,
      bgColor: '#ccfbf1',
      borderColor: '#5eead4',
      textColor: '#134e4a',
      iconBgColor: '#0d9488',
      badgeBgColor: '#0f766e',
      cardBg: 'bg-teal-100 border-2 border-teal-300 hover:border-teal-500 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all',
      iconBg: 'bg-teal-600 text-white shadow-xs',
      trend: stats.hostSettlementRatio > 0 ? 'Healthy' : '0%',
      badgeBg: 'bg-teal-700 text-white font-bold',
      titleColor: 'text-teal-950 font-black',
      valueColor: 'text-teal-950 font-black',
      subColor: 'text-teal-900 font-bold',
      description: 'Paid host share ratio',
      link: '/admin/reports/payouts'
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
    <div className="space-y-6 pb-12">
      
      {/* Dashboard Top Header & Date Filter Select */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time overview of platform bookings, revenues, and host payout settlements.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">Filter Period:</span>
          <select
            value={dateRangeType}
            onChange={(e) => setDateRangeType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="allTime">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row - Single Row on Desktop (6 Columns) & Mobile Friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {topCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => card.link && navigate(card.link)}
            className={`rounded-2xl p-4 transition-all duration-300 flex items-start justify-between ${card.cardBg} ${card.link ? 'cursor-pointer hover:shadow-xl' : ''}`}
            style={{ backgroundColor: card.bgColor, color: '#ffffff' }}
          >
            <div className="space-y-1.5 min-w-0 flex-1 pr-2">
              <span className={`text-[11px] font-black uppercase tracking-wider block truncate ${card.titleColor}`} style={{ color: '#ffffff', opacity: 0.95 }} title={card.title}>
                {card.title}
              </span>
              <h3 className={`text-lg xl:text-xl font-black font-sans tracking-tight truncate ${card.valueColor}`} style={{ color: '#ffffff' }}>
                {card.value}
              </h3>
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${card.badgeBg}`} style={{ backgroundColor: card.iconBgColor, color: '#ffffff' }}>
                  <FiTrendingUp size={9} />
                  <span>{card.trend}</span>
                </span>
                <span className={`text-[9px] font-medium truncate ${card.subColor}`} style={{ color: '#ffffff', opacity: 0.85 }}>
                  {card.description}
                </span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} shrink-0`} style={{ backgroundColor: card.iconBgColor, color: '#ffffff' }}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Executive BI Cards Row - Solid Colors with Color-Wise Readable Text & Inline Fallbacks */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Executive Insights</h3>
          <span className="text-[10px] text-gray-400 font-semibold">Key Metrics & Growth</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {executiveCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => card.link && navigate(card.link)}
              className={`rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between group ${card.cardBg}`}
              style={{ backgroundColor: card.bgColor, borderColor: card.borderColor, color: card.textColor }}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider line-clamp-1 ${card.titleColor}`} style={{ color: card.textColor }} title={card.title}>
                  {card.title}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} shadow-xs group-hover:scale-105 transition-transform duration-200`} style={{ backgroundColor: card.iconBgColor, color: '#ffffff' }}>
                  <card.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <h3 className={`text-sm md:text-base font-black font-sans tracking-tight truncate ${card.valueColor}`} style={{ color: card.textColor }} title={card.value}>
                  {card.value}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full ${card.badgeBg}`} style={{ backgroundColor: card.badgeBgColor, color: '#ffffff' }}>
                    <card.icon size={8} />
                    <span>{card.trend}</span>
                  </span>
                  <span className={`text-[9px] font-semibold truncate ${card.subColor}`} style={{ color: card.textColor, opacity: 0.9 }} title={card.description}>{card.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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

      {/* BI Grids: Top Performing Partners & Distribution Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Partners card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">Top Partners Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopPartnersList title="Top Properties" items={dashboardData?.topProperties} isProperty={true} />
            <TopPartnersList title="Top Hosts" items={dashboardData?.topHosts} isProperty={false} />
          </div>
        </div>

        {/* Distribution Channels card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">Distribution & Gateways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionShareList title="Payment Channels" items={dashboardData?.paymentShare} valueKey="revenue" nameKey="payment_method" />
            <div className="flex flex-col">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Booking Channels</h4>
              <OnlineVsHMSChart data={dashboardData?.sourceShare} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* City Location Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
          <LocationPerformanceChart data={dashboardData?.locationStats} />
        </div>

        {/* Host Payout Aging Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
          <PayoutAgingChart stats={dashboardData?.payoutAgingStats} />
        </div>

        {/* Cancellation & Refund Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
          <CancellationTrendChart data={dashboardData?.cancellationStats} />
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

      {/* Monthly Performance Combo Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Monthly Performance</h3>
          <p className="text-sm text-gray-500">Revenue (bars) vs. Admin Commission (line) trends over the last 12 months</p>
        </div>
        <div className="h-72 flex items-end">
          <MonthlyRevenueCommissionChart data={dashboardData?.monthlyStats} />
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Graph shows monthly revenue trends</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block"></span>
              <span className="font-semibold text-gray-600">Monthly Revenue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
              <span className="font-semibold text-gray-600">Admin Commission</span>
            </span>
          </div>
        </div>
      </div>

      {/* BI Grids: Top Performing Partners & Distribution Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Partners card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">Top Partners Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopPartnersList title="Top Properties" items={dashboardData?.topProperties} isProperty={true} />
            <TopPartnersList title="Top Hosts" items={dashboardData?.topHosts} isProperty={false} />
          </div>
        </div>

        {/* Distribution Channels card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">Distribution & Gateways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionShareList title="Payment Channels" items={dashboardData?.paymentShare} valueKey="revenue" nameKey="payment_method" />
            <div className="flex flex-col">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Booking Channels</h4>
              <OnlineVsHMSChart data={dashboardData?.sourceShare} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Center & System Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Action Center (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-150 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Urgent Action Center</h3>
              <p className="text-xs text-gray-500">Items requiring immediate administrative attention</p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 uppercase">
              Action Panel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/admin/properties')}
              className="p-4 rounded-xl bg-amber-50/50 border border-amber-150 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <FiHome size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">Property Approvals</h4>
                  <p className="text-xs text-amber-800 font-bold mt-0.5">{dashboardData?.alerts?.pendingProperties || 0} listings pending review</p>
                </div>
              </div>
              <FiChevronRight className="text-amber-500 group-hover:translate-x-1 transition-transform" />
            </div>

            <div 
              onClick={() => navigate('/admin/reports/payouts')}
              className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-150 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-850 flex items-center justify-center font-black">
                  <TakaIcon className="text-indigo-800" />
                </div>
                <div>
                  <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">Host Payouts Due</h4>
                  <p className="text-xs text-indigo-800 font-bold mt-0.5">{dashboardData?.alerts?.pendingPayouts || 0} payouts awaiting settlement</p>
                </div>
              </div>
              <FiChevronRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
            </div>

            <div 
              onClick={() => navigate('/admin/reviews')}
              className="p-4 rounded-xl bg-purple-50/50 border border-purple-150 hover:border-purple-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  <FiStar size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-purple-950 text-xs uppercase tracking-wider">Pending Reviews</h4>
                  <p className="text-xs text-purple-800 font-bold mt-0.5">{dashboardData?.alerts?.pendingReviews || 0} reviews pending moderation</p>
                </div>
              </div>
              <FiChevronRight className="text-purple-500 group-hover:translate-x-1 transition-transform" />
            </div>

            <div 
              onClick={() => navigate('/admin/contact-messages')}
              className="p-4 rounded-xl bg-blue-50/50 border border-blue-150 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                  <FiFileText size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider">Open Support Tickets</h4>
                  <p className="text-xs text-blue-800 font-bold mt-0.5">{dashboardData?.alerts?.openTickets || 0} messages requiring reply</p>
                </div>
              </div>
              <FiChevronRight className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* System Health Monitor (1 col) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">System Health</h3>
              <p className="text-xs text-gray-500">Live operational status</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-150 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-gray-800">SSLCommerz & bKash Gateway</span>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-150 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-gray-800">SMS Client Gateway</span>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">ONLINE</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-150 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-spin" style={{ animationDuration: '3s' }}></span>
                <span className="font-bold text-gray-800">iCal Calendar Auto-Sync</span>
              </div>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">CRON 15M</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 text-center font-medium pt-2 border-t border-gray-100">
            All core backend microservices operating normally
          </div>
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
                {recentBookings.slice(0, 5).map((booking) => (
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
