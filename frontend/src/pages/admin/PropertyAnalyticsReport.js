import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiHome, FiPrinter, FiArrowLeft, FiActivity, 
  FiStar, FiMapPin, FiLayers, FiList 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/textUtils';

const TakaIcon = ({ className = "w-4 h-4" }) => (
  <span className={`${className} font-bold font-sans flex items-center justify-center select-none leading-none`} style={{ fontSize: '1.2em' }}>
    ৳
  </span>
);

const PropertyAnalyticsReport = ({ userRole = 'admin' }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'booked-directory', 'earning-directory', 'reviewed-directory'
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const endpoint = userRole === 'admin' ? '/admin/reports/properties/analytics' : '/property-owner/reports/properties/analytics';

  const { data, isLoading, error } = useQuery(
    [`${userRole}-property-analytics`],
    () => api.get(endpoint).then(res => res.data.data),
    { refetchOnWindowFocus: false }
  );

  const handlePrint = () => {
    window.print();
  };

  const changeViewMode = (mode) => {
    setSearchQuery('');
    setCityFilter('All');
    setTypeFilter('All');
    setViewMode(mode);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-bold">
        Failed to load property analytics report: {error.message}
      </div>
    );
  }

  const topBooked = data?.topBooked || [];
  const topEarning = data?.topEarning || [];
  const topReviewed = data?.topReviewed || [];

  // Compute Unique Cities & Property Types dynamically for filtering
  const cities = Array.from(new Set([
    ...topBooked.map(p => p.city),
    ...topEarning.map(p => p.city),
    ...topReviewed.map(p => p.city)
  ].filter(Boolean))).sort();

  const propertyTypes = Array.from(new Set([
    ...topBooked.map(p => p.property_type),
    ...topEarning.map(p => p.property_type),
    ...topReviewed.map(p => p.property_type)
  ].filter(Boolean))).sort();

  // Compute summary values for KPI cards
  const propertiesWithBookings = topBooked.filter(p => p.bookings_count > 0).length;
  const totalEarningsAll = topEarning.reduce((acc, curr) => acc + parseFloat(curr.total_earnings || 0), 0);
  const totalReviewsCount = topReviewed.reduce((acc, curr) => acc + parseInt(curr.reviews_count || 0), 0);
  const avgRatingAll = topReviewed.length > 0 
    ? (topReviewed.reduce((acc, curr) => acc + parseFloat(curr.avg_rating || 0), 0) / topReviewed.length).toFixed(1)
    : '0.0';

  // Filters logic
  const filterProperty = (p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'All' || p.city === cityFilter;
    const matchesType = typeFilter === 'All' || p.property_type === typeFilter;
    return matchesSearch && matchesCity && matchesType;
  };

  const filteredBooked = topBooked.filter(filterProperty);
  const filteredEarning = topEarning.filter(filterProperty);
  const filteredReviewed = topReviewed.filter(filterProperty);

  // Dynamic header titles
  const getHeaderTitle = () => {
    if (viewMode === 'booked-directory') return 'Properties Bookings Directory';
    if (viewMode === 'earning-directory') return 'Properties Earnings Directory';
    if (viewMode === 'reviewed-directory') return 'Properties Reviews & Ratings';
    return 'Property Analytics Report';
  };

  const getHeaderDesc = () => {
    if (viewMode === 'booked-directory') return 'Detailed ranking list of listed properties based on reservation counts.';
    if (viewMode === 'earning-directory') return 'Detailed ranking list of listed properties based on gross financial earnings.';
    if (viewMode === 'reviewed-directory') return 'Detailed ranking list of listed properties based on review score and feedback counts.';
    return 'Review and analyze performance analytics across all listed properties.';
  };

  const getPrintHeaderTitle = () => {
    if (viewMode === 'booked-directory') return 'Property Bookings Performance Directory';
    if (viewMode === 'earning-directory') return 'Property Financial Earnings Directory';
    if (viewMode === 'reviewed-directory') return 'Property Ratings & Reviews Directory';
    return 'Property Performance & Analytics Executive Report';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 print:bg-white print:p-0 font-sans">
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          .print-full-width { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          body { color: #000 !important; background: #fff !important; }
          .print-border { border: 1px solid #e5e7eb !important; }
          tr { break-inside: avoid !important; }
        }
      `}</style>

      {/* Header Area */}
      <div className="bg-white px-8 py-6 border-b border-gray-200 print-hide">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {viewMode !== 'dashboard' && (
              <button 
                onClick={() => changeViewMode('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft size={20} className="text-gray-650" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <FiHome className="text-[#004e59]" /> {getHeaderTitle()}
              </h1>
              <p className="text-gray-555 mt-1 text-xs">{getHeaderDesc()}</p>
            </div>
          </div>
          <button 
            onClick={handlePrint} 
            className="bg-[#004e59] hover:bg-[#003b43] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm"
          >
            <FiPrinter className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 print-full-width print:px-0 print:py-4 space-y-8">
        
        {/* Printable Executive Header */}
        <div className="hidden print:block border-b-2 border-gray-250 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-black uppercase tracking-wider">{getPrintHeaderTitle()}</h1>
          <div className="flex justify-between text-xs text-gray-555 mt-2">
            <span>Generated By: Keyhost Homes Admin</span>
            <span>Date Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {viewMode === 'dashboard' && (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Booked Listings</p>
                <h3 className="text-2xl font-black text-gray-950">{propertiesWithBookings}</h3>
                <span className="text-[10px] text-gray-400 font-medium">Active listings with stays</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Gross Earnings</p>
                <h3 className="text-2xl font-black text-gray-950">BDT {formatPrice(totalEarningsAll)}</h3>
                <span className="text-[10px] text-gray-400 font-medium">Gross paid booking revenue</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Total Reviews</p>
                <h3 className="text-2xl font-black text-gray-950">{totalReviewsCount}</h3>
                <span className="text-[10px] text-gray-400 font-medium">Approved reviews count</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Average Rating</p>
                <h3 className="text-2xl font-black text-gray-950">{avgRatingAll} / 5.0</h3>
                <span className="text-[10px] text-gray-400 font-medium">Platform review score average</span>
              </div>
            </div>

            {/* Performance Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
              {/* Top Booked Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FiActivity className="text-[#004e59]" /> Top Booked Listings
                    </h2>
                    <button
                      onClick={() => changeViewMode('booked-directory')}
                      className="text-xs text-[#004e59] hover:text-[#003b43] font-bold transition-all hover:underline print-hide"
                    >
                      View All Directory &rarr;
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-3 w-16 text-center">Rank</th>
                          <th className="px-6 py-3">Property Title</th>
                          <th className="px-6 py-3">City</th>
                          <th className="px-6 py-3 text-right">Bookings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {topBooked.slice(0, 10).map((prop, idx) => (
                          <tr key={prop.id || idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3.5 text-center font-bold text-gray-400">{idx + 1}</td>
                            <td className="px-6 py-3.5 font-semibold text-gray-900 truncate max-w-[180px]" title={prop.title}>{prop.title}</td>
                            <td className="px-6 py-3.5 text-gray-500">{prop.city || '—'}</td>
                            <td className="px-6 py-3.5 text-right font-black text-[#004e59]">
                              {prop.bookings_count} stays
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Earning Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <TakaIcon className="text-[#004e59]" /> Top Earning Listings
                    </h2>
                    <button
                      onClick={() => changeViewMode('earning-directory')}
                      className="text-xs text-[#004e59] hover:text-[#003b43] font-bold transition-all hover:underline print-hide"
                    >
                      View All Directory &rarr;
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-3 w-16 text-center">Rank</th>
                          <th className="px-6 py-3">Property Title</th>
                          <th className="px-6 py-3">City</th>
                          <th className="px-6 py-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {topEarning.slice(0, 10).map((prop, idx) => (
                          <tr key={prop.id || idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3.5 text-center font-bold text-gray-400">{idx + 1}</td>
                            <td className="px-6 py-3.5 font-semibold text-gray-900 truncate max-w-[180px]" title={prop.title}>{prop.title}</td>
                            <td className="px-6 py-3.5 text-gray-500">{prop.city || '—'}</td>
                            <td className="px-6 py-3.5 text-right font-black text-emerald-700">
                              BDT {formatPrice(prop.total_earnings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings & Reviews full-width card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FiStar className="text-[#004e59]" /> Top Reviewed & Rated Listings
                </h2>
                <button
                  onClick={() => changeViewMode('reviewed-directory')}
                  className="text-xs text-[#004e59] hover:text-[#003b43] font-bold transition-all hover:underline print-hide"
                >
                  View All Directory &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3 w-16 text-center">Rank</th>
                      <th className="px-6 py-3">Property Title</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Property Type</th>
                      <th className="px-6 py-3 text-center">Reviews Count</th>
                      <th className="px-6 py-3 text-right">Average Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {topReviewed.slice(0, 10).map((prop, idx) => (
                      <tr key={prop.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-center font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-900">{prop.title}</td>
                        <td className="px-6 py-3.5 text-gray-500">{prop.city}</td>
                        <td className="px-6 py-3.5 text-gray-550 capitalize">{prop.property_type?.replace('_', ' ')}</td>
                        <td className="px-6 py-3.5 text-center text-gray-550 font-bold">{prop.reviews_count} reviews</td>
                        <td className="px-6 py-3.5 text-right font-black text-amber-600 pr-8">
                          <div className="flex items-center justify-end gap-1">
                            <FiStar className="fill-current text-amber-500" size={13} />
                            <span>{parseFloat(prop.avg_rating || 0).toFixed(1)} / 5.0</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Directory View Modes */}
        {viewMode === 'booked-directory' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Bookings Performance Directory ({filteredBooked.length})
              </h2>
              <p className="text-xxs text-gray-400 mt-0.5">Ranking list of listed properties based on confirmed and checked-out reservations.</p>
            </div>
            <div className="p-6">
              {/* Filters block */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 print-hide">
                <input
                  type="text"
                  placeholder="Search by property title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800 placeholder-gray-400"
                />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800"
                >
                  <option value="All">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800 capitalize"
                >
                  <option value="All">All Property Types</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3 w-16 text-center">Rank</th>
                      <th className="px-6 py-3">Property Title</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Property Type</th>
                      <th className="px-6 py-3 text-right">Bookings Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {filteredBooked.length > 0 ? filteredBooked.map((prop, idx) => (
                      <tr key={prop.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center font-bold text-gray-450">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{prop.title}</td>
                        <td className="px-6 py-4 text-gray-500 flex items-center gap-1.5"><FiMapPin className="text-gray-400" size={11} /><span>{prop.city}</span></td>
                        <td className="px-6 py-4 text-gray-550 capitalize flex items-center gap-1.5"><FiLayers className="text-gray-400" size={11} /><span>{prop.property_type?.replace('_', ' ')}</span></td>
                        <td className="px-6 py-4 text-right font-black text-[#004e59] print:text-black">
                          {prop.bookings_count} bookings
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No property matches found for current filter selections.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'earning-directory' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Financial Earnings Directory ({filteredEarning.length})
              </h2>
              <p className="text-xxs text-gray-400 mt-0.5">Ranking list of listed properties based on gross financial earnings from reservations.</p>
            </div>
            <div className="p-6">
              {/* Filters block */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 print-hide">
                <input
                  type="text"
                  placeholder="Search by property title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800 placeholder-gray-400"
                />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800"
                >
                  <option value="All">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800 capitalize"
                >
                  <option value="All">All Property Types</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3 w-16 text-center">Rank</th>
                      <th className="px-6 py-3">Property Title</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Property Type</th>
                      <th className="px-6 py-3 text-right">Total Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {filteredEarning.length > 0 ? filteredEarning.map((prop, idx) => (
                      <tr key={prop.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center font-bold text-gray-450">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{prop.title}</td>
                        <td className="px-6 py-4 text-gray-500 flex items-center gap-1.5"><FiMapPin className="text-gray-400" size={11} /><span>{prop.city}</span></td>
                        <td className="px-6 py-4 text-gray-550 capitalize flex items-center gap-1.5"><FiLayers className="text-gray-400" size={11} /><span>{prop.property_type?.replace('_', ' ')}</span></td>
                        <td className="px-6 py-4 text-right font-black text-emerald-700 print:text-black">
                          BDT {formatPrice(prop.total_earnings)}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No property matches found for current filter selections.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'reviewed-directory' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Ratings & Reviews Performance Directory ({filteredReviewed.length})
              </h2>
              <p className="text-xxs text-gray-400 mt-0.5">Ranking list of listed properties based on user ratings and review volume feedback.</p>
            </div>
            <div className="p-6">
              {/* Filters block */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 print-hide">
                <input
                  type="text"
                  placeholder="Search by property title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800 placeholder-gray-400"
                />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800"
                >
                  <option value="All">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-800 capitalize"
                >
                  <option value="All">All Property Types</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3 w-16 text-center">Rank</th>
                      <th className="px-6 py-3">Property Title</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3 text-center">Reviews Count</th>
                      <th className="px-6 py-3 text-right">Average Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {filteredReviewed.length > 0 ? filteredReviewed.map((prop, idx) => (
                      <tr key={prop.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-center font-bold text-gray-450">{idx + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{prop.title}</td>
                        <td className="px-6 py-4 text-gray-500 flex items-center gap-1.5"><FiMapPin className="text-gray-400" size={11} /><span>{prop.city}</span></td>
                        <td className="px-6 py-4 text-center text-gray-550 font-bold">{prop.reviews_count} reviews</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 font-black text-amber-605 print:text-black">
                            <FiStar className="fill-current text-amber-500" size={13} />
                            <span>{parseFloat(prop.avg_rating || 0).toFixed(1)} / 5.0</span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No property matches found for current filter selections.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PropertyAnalyticsReport;
