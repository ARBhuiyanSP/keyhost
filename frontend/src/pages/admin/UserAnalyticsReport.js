import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiUsers, FiPrinter, FiArrowLeft, FiUser, FiActivity, 
  FiChevronDown, FiChevronUp, FiCalendar, FiHome, FiMail, 
  FiPhone, FiMapPin, FiShield 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/textUtils';
import HMSGuests from '../property-owner/HMSGuests';
import HMSGuestAnalytics from '../property-owner/HMSGuestAnalytics';

const UserAnalyticsReport = ({ userRole = 'admin' }) => {
  const navigate = useNavigate();
  const [expandedGuests, setExpandedGuests] = useState({});
  const [expandedLocations, setExpandedLocations] = useState({});
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'repeated-guests', 'gender-directory', 'age-directory', 'location-directory'
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [locationSearch, setLocationSearch] = useState('');
  const [activeSection, setActiveSection] = useState('demographics'); // 'demographics', 'directory', 'analytics'

  const endpoint = userRole === 'admin' ? '/admin/reports/users/analytics' : '/property-owner/reports/users/analytics';

  const { data, isLoading, error } = useQuery(
    [`${userRole}-user-analytics`],
    () => api.get(endpoint).then(res => res.data.data),
    { refetchOnWindowFocus: false }
  );

  const handlePrint = () => {
    window.print();
  };

  const typeCounts = data?.typeCounts || [];
  const genderCounts = data?.genderCounts || [];
  const ageCounts = data?.ageCounts || [];
  const repeatedGuests = data?.repeatedGuests || [];
  const repeatedGuestsBookings = data?.repeatedGuestsBookings || [];
  const users = data?.users || [];

  const totalUsers = typeCounts.reduce((acc, curr) => acc + parseInt(curr.count || 0), 0);

  const getPercentage = (count) => {
    if (!totalUsers) return '0%';
    return `${((count / totalUsers) * 100).toFixed(1)}%`;
  };

  const fmtStayDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleGuestExpansion = (guestId) => {
    setExpandedGuests(prev => ({
      ...prev,
      [guestId]: !prev[guestId]
    }));
  };

  const toggleLocationExpansion = (locName) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locName]: !prev[locName]
    }));
  };

  const getStaysByGuestAndProperty = (guestId) => {
    const guestBookings = repeatedGuestsBookings.filter(b => b.guest_id === guestId);
    const grouped = {};
    guestBookings.forEach(b => {
      if (!grouped[b.property_title]) {
        grouped[b.property_title] = [];
      }
      grouped[b.property_title].push(b);
    });
    return grouped;
  };

  // Age calculation helpers
  const getAge = (dob) => {
    if (!dob) return '—';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getUserAgeGroup = (dob) => {
    if (!dob) return 'Unspecified';
    const age = getAge(dob);
    if (age === '—') return 'Unspecified';
    if (age < 18) return 'Under 18';
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    if (age >= 36 && age <= 50) return '36-50';
    return '51+';
  };

  // Color mapping helpers
  const getGenderColor = (gender) => {
    const g = (gender || '').toLowerCase();
    if (g === 'male') return '#004e59';
    if (g === 'female') return '#E41D57';
    if (g === 'unspecified') return '#94a3b8';
    return '#cbd5e1';
  };

  const getAgeColor = (ageGroup) => {
    const a = (ageGroup || '').toLowerCase();
    if (a.includes('under 18')) return '#38bdf8';
    if (a.includes('18-25')) return '#f43f5e';
    if (a.includes('26-35')) return '#004e59';
    if (a.includes('36-50')) return '#fbbf24';
    if (a.includes('51') || a.includes('over 50')) return '#8b5cf6';
    return '#94a3b8';
  };

  const genderCountsWithColors = genderCounts.map(g => ({
    ...g,
    color: getGenderColor(g.gender)
  }));

  const ageCountsWithColors = ageCounts.map(a => ({
    ...a,
    color: getAgeColor(a.age_group)
  }));

  // Geographic calculations
  const getLocationAnalytics = () => {
    const locationsMap = {};
    users.forEach(u => {
      let loc = (u.city || u.country || 'Unspecified').trim();
      if (!loc) loc = 'Unspecified';
      
      // Standardize capitalization
      loc = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      if (!locationsMap[loc]) {
        locationsMap[loc] = {
          location: loc,
          guest: 0,
          property_owner: 0,
          staff: 0,
          admin: 0,
          total: 0
        };
      }
      const type = u.user_type || 'guest';
      if (locationsMap[loc].hasOwnProperty(type)) {
        locationsMap[loc][type] += 1;
      } else {
        locationsMap[loc].guest += 1;
      }
      locationsMap[loc].total += 1;
    });
    return Object.values(locationsMap).sort((a, b) => b.total - a.total);
  };

  const locationAnalytics = getLocationAnalytics();

  // Filtering users lists
  const filteredUsersForGender = users.filter(u => {
    if (genderFilter === 'All') return true;
    const g = (u.gender || 'unspecified').toLowerCase();
    return g === genderFilter.toLowerCase();
  });

  const filteredUsersForAge = users.filter(u => {
    if (ageFilter === 'All') return true;
    return getUserAgeGroup(u.date_of_birth) === ageFilter;
  });

  // SVG Donut Chart Renderer
  const renderDonutChart = (chartData) => {
    const total = chartData.reduce((acc, item) => acc + parseInt(item.count || 0), 0);
    if (total === 0) return null;

    let accumulatedPercent = 0;
    return (
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0 print:border print:border-gray-100 print:rounded-full">
        <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
          {chartData.map((item, idx) => {
            const count = parseInt(item.count || 0);
            if (count === 0) return null;
            const percent = (count / total) * 100;
            const strokeDash = `${percent} ${100 - percent}`;
            const strokeOffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;
            return (
              <circle
                key={idx}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={item.color}
                strokeWidth="4.2"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-sm font-extrabold text-gray-900 leading-none">{total}</span>
          <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Total</span>
        </div>
      </div>
    );
  };

  // Directories config
  const gendersList = ['All', 'Male', 'Female', 'Unspecified'];
  const ageGroupsList = ['All', 'Under 18', '18-25', '26-35', '36-50', '51+', 'Unspecified'];

  // Dynamic header strings
  const getHeaderTitle = () => {
    if (userRole === 'property_owner') {
      if (activeSection === 'demographics') return 'Registered Users & Loyalty';
      if (activeSection === 'directory') return 'HMS Guest Directory';
      if (activeSection === 'analytics') return 'HMS Guest Analytics';
    }
    if (viewMode === 'repeated-guests') return 'Repeated Guests Directory';
    if (viewMode === 'gender-directory') return 'Gender Demographics Directory';
    if (viewMode === 'age-directory') return 'Age Brackets Directory';
    if (viewMode === 'location-directory') return 'Location & Role Directory';
    return 'User Analytics Report';
  };

  const getHeaderDesc = () => {
    if (userRole === 'property_owner') {
      if (activeSection === 'demographics') return 'Analyze registered user base demographics, account profiles, and loyalty metrics';
      if (activeSection === 'directory') return 'Manage unique guest profiles, search by phone, and view verification documents';
      if (activeSection === 'analytics') return 'Interactive occupancy, stay duration, and geographic guest metrics';
    }
    if (viewMode === 'repeated-guests') return 'Detailed stays and property-wise booking frequencies of loyal guests.';
    if (viewMode === 'gender-directory') return 'Detailed directory of registered accounts categorized by gender.';
    if (viewMode === 'age-directory') return 'Detailed directory of registered accounts categorized by age brackets.';
    if (viewMode === 'location-directory') return 'Detailed directory of registered accounts grouped by location and user type.';
    return 'Analyze user base demographics, registrations, and booking frequencies.';
  };

  const getPrintHeaderTitle = () => {
    if (viewMode === 'repeated-guests') return 'Repeated Guests Stay Directory';
    if (viewMode === 'gender-directory') return 'Gender Demographics Stay Directory';
    if (viewMode === 'age-directory') return 'Age Brackets Stay Directory';
    if (viewMode === 'location-directory') return 'Location & User Type Stay Directory';
    return 'User Demographics & Loyalty Report';
  };

  // Only show top 10 on dashboard view
  const guestsToDisplay = viewMode === 'repeated-guests' ? repeatedGuests : repeatedGuests.slice(0, 10);

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {viewMode !== 'dashboard' && activeSection === 'demographics' && (
              <button 
                onClick={() => setViewMode('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft size={20} className="text-gray-650" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <FiUsers className="text-[#004e59]" /> {getHeaderTitle()}
              </h1>
              <p className="text-gray-555 mt-1 text-xs">{getHeaderDesc()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Tabs for Property Owners */}
            {userRole === 'property_owner' && (
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveSection('demographics');
                    setViewMode('dashboard');
                  }}
                  className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'demographics' ? 'bg-white text-[#004e59] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Registered Users & Loyalty
                </button>
                <button
                  onClick={() => setActiveSection('directory')}
                  className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'directory' ? 'bg-white text-[#004e59] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  HMS Guest Directory
                </button>
                <button
                  onClick={() => setActiveSection('analytics')}
                  className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'analytics' ? 'bg-white text-[#004e59] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  HMS Guest Analytics
                </button>
              </div>
            )}

            {/* Print button */}
            <button 
              onClick={handlePrint} 
              className="bg-[#004e59] hover:bg-[#003b43] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm sm:ml-auto"
            >
              <FiPrinter className="w-4 h-4" /> Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 print-full-width print:px-0 print:py-4 space-y-8">
        
        {activeSection === 'demographics' && (
          isLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 font-bold">
              Failed to load user analytics report: {error.message}
            </div>
          ) : (
            <>
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
                <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Total Registered Users</p>
                <h3 className="text-2xl font-black text-gray-950">{totalUsers}</h3>
                <span className="text-[10px] text-gray-400 font-medium">Unified userbase accounts</span>
              </div>

              {['guest', 'property_owner', 'staff'].map(type => {
                const match = typeCounts.find(t => t.user_type === type);
                const count = match ? parseInt(match.count || 0) : 0;
                const label = type === 'property_owner' ? 'Hosts/Owners' : type === 'guest' ? 'Guests' : 'Staff Members';
                return (
                  <div key={type} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                    <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">{label}</p>
                    <h3 className="text-2xl font-black text-gray-950">{count}</h3>
                    <span className="text-[10px] text-gray-400 font-medium">{getPercentage(count)} of total base</span>
                  </div>
                );
              })}
            </div>

            {/* Demographics Charts/Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {/* Gender distribution */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print-border">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FiUser className="text-[#004e59]" /> Gender Distribution
                  </h2>
                  <button
                    onClick={() => setViewMode('gender-directory')}
                    className="text-xs text-[#004e59] hover:text-[#003b43] font-bold transition-all hover:underline print-hide"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                  {renderDonutChart(genderCountsWithColors)}
                  <div className="flex-1 space-y-3.5 w-full">
                    {genderCounts.length > 0 ? genderCounts.map(g => {
                      const color = getGenderColor(g.gender);
                      return (
                        <div key={g.gender}>
                          <div className="flex justify-between text-xs font-bold text-gray-700 mb-1 capitalize">
                            <span>{g.gender}</span>
                            <span className="text-gray-500">{g.count} users ({getPercentage(g.count)})</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500" 
                              style={{ width: getPercentage(g.count), backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-gray-400 italic">No gender records available.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Age Distribution */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print-border">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FiActivity className="text-[#004e59]" /> Age Brackets
                  </h2>
                  <button
                    onClick={() => setViewMode('age-directory')}
                    className="text-xs text-[#004e59] hover:text-[#003b43] font-bold transition-all hover:underline print-hide"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                  {renderDonutChart(ageCountsWithColors)}
                  <div className="flex-1 space-y-3.5 w-full">
                    {ageCounts.length > 0 ? ageCounts.map(a => {
                      const color = getAgeColor(a.age_group);
                      return (
                        <div key={a.age_group}>
                          <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>{a.age_group}</span>
                            <span className="text-gray-500">{a.count} users ({getPercentage(a.count)})</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500" 
                              style={{ width: getPercentage(a.count), backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-gray-400 italic">No birth date records available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Role distribution card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FiMapPin className="text-[#004e59]" /> Location & Role Distribution
                  </h2>
                  <p className="text-xxs text-gray-400 mt-0.5">Top registered user concentrations by city/country and account type.</p>
                </div>
                <button
                  onClick={() => setViewMode('location-directory')}
                  className="text-xs text-[#004e59] hover:text-[#003b43] font-bold transition-all hover:underline print-hide"
                >
                  View All Directory &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Location (City / Country)</th>
                      <th className="px-6 py-3 text-center">Guests</th>
                      <th className="px-6 py-3 text-center">Hosts / Owners</th>
                      <th className="px-6 py-3 text-center">Staff Members</th>
                      <th className="px-6 py-3 text-right">Total Accounts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {locationAnalytics.slice(0, 5).map((loc, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-950 flex items-center gap-2">
                          <FiMapPin className="text-gray-400" size={13} />
                          <span>{loc.location}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {loc.guest > 0 ? (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xxs font-bold">
                              {loc.guest}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {loc.property_owner > 0 ? (
                            <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded text-xxs font-bold">
                              {loc.property_owner}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {loc.staff > 0 ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-xxs font-bold">
                              {loc.staff}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-gray-900 pr-8">
                          {loc.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {viewMode === 'gender-directory' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  All Users Gender Directory ({filteredUsersForGender.length})
                </h2>
                <p className="text-xxs text-gray-400 mt-0.5">Filter and list registered users based on their gender demographics.</p>
              </div>
            </div>
            <div className="p-6">
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 print-hide">
                {gendersList.map(g => {
                  const isSelected = genderFilter === g;
                  const count = g === 'All' ? users.length : users.filter(u => (u.gender || 'unspecified').toLowerCase() === g.toLowerCase()).length;
                  return (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1.5 rounded-lg text-xxs font-bold transition-all border whitespace-nowrap ${
                        isSelected 
                          ? 'bg-[#004e59] border-[#004e59] text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-50'
                      }`}
                    >
                      {g} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Email & Phone</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Gender</th>
                      <th className="px-6 py-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {filteredUsersForGender.length > 0 ? filteredUsersForGender.map((u, idx) => (
                      <tr key={u.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {u.first_name} {u.last_name}
                          <span className="text-[10px] text-gray-400 font-normal block mt-0.5">ID: {u.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5"><FiMail className="text-gray-400" size={11} /><span>{u.email}</span></div>
                          {u.phone && <div className="flex items-center gap-1.5 text-xxs text-gray-400 mt-0.5"><FiPhone className="text-gray-400" size={11} /><span>{u.phone}</span></div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                            u.user_type === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                            u.user_type === 'property_owner' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                            u.user_type === 'staff' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {u.user_type === 'property_owner' ? 'Host/Owner' : u.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold capitalize text-gray-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getGenderColor(u.gender) }}></span>
                          <span>{u.gender || 'Unspecified'}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-550">
                          {u.city || u.country ? `${u.city || '—'}, ${u.country || '—'}` : '—'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No user accounts found matching this gender filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'age-directory' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  All Users Age Directory ({filteredUsersForAge.length})
                </h2>
                <p className="text-xxs text-gray-400 mt-0.5">Filter and list registered users based on their age brackets.</p>
              </div>
            </div>
            <div className="p-6">
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 print-hide">
                {ageGroupsList.map(a => {
                  const isSelected = ageFilter === a;
                  const count = a === 'All' ? users.length : users.filter(u => getUserAgeGroup(u.date_of_birth) === a).length;
                  return (
                    <button
                      key={a}
                      onClick={() => setAgeFilter(a)}
                      className={`px-3 py-1.5 rounded-lg text-xxs font-bold transition-all border whitespace-nowrap ${
                        isSelected 
                          ? 'bg-[#004e59] border-[#004e59] text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-655 hover:bg-gray-50'
                      }`}
                    >
                      {a} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Email & Phone</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3 text-center">Birth Date</th>
                      <th className="px-6 py-3 text-center">Age</th>
                      <th className="px-6 py-3 text-center">Age Bracket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {filteredUsersForAge.length > 0 ? filteredUsersForAge.map((u, idx) => {
                      const age = getAge(u.date_of_birth);
                      const bracket = getUserAgeGroup(u.date_of_birth);
                      return (
                        <tr key={u.id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {u.first_name} {u.last_name}
                            <span className="text-[10px] text-gray-400 font-normal block mt-0.5">ID: {u.id} | {u.city || '—'}, {u.country || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5"><FiMail className="text-gray-400" size={11} /><span>{u.email}</span></div>
                            {u.phone && <div className="flex items-center gap-1.5 text-xxs text-gray-400 mt-0.5"><FiPhone className="text-gray-400" size={11} /><span>{u.phone}</span></div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                              u.user_type === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                              u.user_type === 'property_owner' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                              u.user_type === 'staff' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {u.user_type === 'property_owner' ? 'Host/Owner' : u.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 font-medium">
                            {u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">
                            {age !== '—' ? `${age} yrs` : '—'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="flex items-center justify-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getAgeColor(bracket) }}></span>
                              <span className="font-semibold text-gray-800">{bracket}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No user accounts found matching this age bracket filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'location-directory' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  All Locations Distribution ({locationAnalytics.length})
                </h2>
                <p className="text-xxs text-gray-400 mt-0.5">Filter and view users grouped by geographic distribution and roles.</p>
              </div>
            </div>
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6 print-hide max-w-sm">
                <input
                  type="text"
                  placeholder="Search by city or country..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#004e59] shadow-sm text-gray-855 placeholder-gray-400"
                />
              </div>

              <div className="space-y-4">
                {locationAnalytics
                  .filter(loc => loc.location.toLowerCase().includes(locationSearch.toLowerCase()))
                  .map((loc, idx) => {
                    const isExpanded = !!expandedLocations[loc.location];
                    const usersInLoc = users.filter(u => {
                      let uLoc = (u.city || u.country || 'Unspecified').trim();
                      uLoc = uLoc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      return uLoc === loc.location;
                    });

                    return (
                      <div key={idx} className="border border-gray-150 rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow print:shadow-none print:border-gray-200 bg-white">
                        {/* Location Summary Header Row */}
                        <div 
                          onClick={() => toggleLocationExpansion(loc.location)}
                          className="px-6 py-4 bg-gray-50/20 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="print-hide text-gray-400">
                              {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                            </span>
                            <div className="flex items-center gap-2">
                              <FiMapPin className="text-[#004e59] shrink-0" size={16} />
                              <span className="font-extrabold text-sm text-gray-900">{loc.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xxs font-bold">
                              {loc.guest > 0 && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">Guests: {loc.guest}</span>}
                              {loc.property_owner > 0 && <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded">Hosts: {loc.property_owner}</span>}
                              {loc.staff > 0 && <span className="bg-amber-50 text-amber-700 border-amber-200 px-2 py-0.5 rounded">Staff: {loc.staff}</span>}
                            </div>
                            <span className="font-black text-xs text-gray-900 border-l border-gray-200 pl-3">
                              Total: {loc.total}
                            </span>
                          </div>
                        </div>

                        {/* Expandable nested table of users */}
                        <div className={`${isExpanded ? '' : 'hidden print:block'} border-t border-gray-100 bg-white`}>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xxs">
                              <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-wider">
                                  <th className="px-6 py-2.5">User Name</th>
                                  <th className="px-6 py-2.5">Email & Phone</th>
                                  <th className="px-6 py-2.5">Role</th>
                                  <th className="px-6 py-2.5">Gender</th>
                                  <th className="px-6 py-2.5">Date of Birth</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                {usersInLoc.map((u, uIdx) => (
                                  <tr key={u.id || uIdx} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-3 font-semibold text-gray-900">
                                      {u.first_name} {u.last_name}
                                      <span className="text-[9px] text-gray-400 font-normal block mt-0.5">ID: {u.id}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                      <div className="flex items-center gap-1.5"><FiMail className="text-gray-400" size={10} /><span>{u.email}</span></div>
                                      {u.phone && <div className="flex items-center gap-1.5 text-gray-400 mt-0.5"><FiPhone className="text-gray-400" size={10} /><span>{u.phone}</span></div>}
                                    </td>
                                    <td className="px-6 py-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border capitalize ${
                                        u.user_type === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                                        u.user_type === 'property_owner' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                        u.user_type === 'staff' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}>
                                        {u.user_type === 'property_owner' ? 'Host/Owner' : u.user_type}
                                      </span>
                                    </td>
                                    <td className="px-6 py-3 capitalize text-gray-800">
                                      {u.gender || '—'}
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">
                                      {u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {(viewMode === 'dashboard' || viewMode === 'repeated-guests') && (
          /* Top Repeated Guests Table */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-border animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {viewMode === 'repeated-guests' ? `All Repeated Guests (${repeatedGuests.length})` : 'Top Repeated Guests'}
                </h2>
                <p className="text-xxs text-gray-400 mt-0.5">Guests with multiple bookings completed or checked out.</p>
              </div>
              <div className="print-hide">
                {viewMode !== 'repeated-guests' && repeatedGuests.length > 0 && (
                  <button
                    onClick={() => setViewMode('repeated-guests')}
                    className="bg-[#004e59] hover:bg-[#003b43] text-white text-xxs font-bold px-3.5 py-2 rounded-lg transition-all"
                  >
                    View All Directory &rarr;
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Guest Name</th>
                    <th className="px-6 py-3">Email & Phone</th>
                    <th className="px-6 py-3">Booked Properties & Frequencies</th>
                    <th className="px-6 py-3 text-center">Bookings Count</th>
                    <th className="px-6 py-3 text-right">Total spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {guestsToDisplay.length > 0 ? guestsToDisplay.map((guest, idx) => {
                    const isExpanded = !!expandedGuests[guest.id];
                    const staysGrouped = getStaysByGuestAndProperty(guest.id);
                    return (
                      <React.Fragment key={guest.id || idx}>
                        <tr 
                          onClick={() => toggleGuestExpansion(guest.id)} 
                          className="hover:bg-gray-50/50 cursor-pointer transition-colors select-none"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <span className="print-hide text-gray-450">
                                {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                              </span>
                              <span>{guest.first_name} {guest.last_name}</span>
                            </div>
                            <span className="text-[10px] font-normal text-gray-400 block mt-0.5 ml-0 md:ml-5">{guest.city || '—'}, {guest.country || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>{guest.email}</div>
                            <div className="text-xxs text-gray-400">{guest.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-605 max-w-sm">
                            <span className="line-clamp-2" title={guest.repeated_properties}>
                              {guest.repeated_properties || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">
                            {guest.bookings_count}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-[#004e59] print:text-black">
                            BDT {formatPrice(guest.total_spent)}
                          </td>
                        </tr>
                        {/* Expansion Row - Shown when isExpanded is true or inside Print Layout */}
                        <tr className={`${isExpanded ? '' : 'hidden print:table-row'} bg-gray-50/30`}>
                          <td colSpan="5" className="px-6 py-4 border-t border-gray-150">
                            <div className="pl-0 md:pl-5 space-y-5">
                              <div className="flex items-center gap-2 border-b border-gray-200 pb-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#004e59] shrink-0"></span>
                                <h4 className="text-xxs font-extrabold text-gray-800 uppercase tracking-wider">Detailed Stay History (Grouped by Property)</h4>
                              </div>
                              <div className="space-y-4">
                                {Object.keys(staysGrouped).map(propTitle => (
                                  <div key={propTitle} className="border-l-2 border-[#004e59] pl-4 py-0.5">
                                    <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5 mb-2.5">
                                      <FiHome className="text-[#004e59] shrink-0" size={13} />
                                      <span>{propTitle}</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 w-full bg-white border border-gray-150 rounded-lg overflow-hidden shadow-sm print:shadow-none print:border-gray-200">
                                      {staysGrouped[propTitle].map(b => {
                                        const nights = Math.max(1, Math.round((new Date(b.check_out_date) - new Date(b.check_in_date)) / (1000 * 60 * 60 * 24)));
                                        return (
                                          <div key={b.booking_id} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2 text-xxs text-gray-655 hover:bg-gray-50/50">
                                            {/* Stay date range */}
                                            <span className="flex items-center gap-2 font-mono font-medium">
                                              <FiCalendar className="text-gray-400 shrink-0" size={12} />
                                              <span>{fmtStayDate(b.check_in_date)}</span>
                                              <span className="text-gray-400 font-sans">➔</span>
                                              <span>{fmtStayDate(b.check_out_date)}</span>
                                            </span>
                                            {/* Nights, Amount & Status */}
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                              <span className="text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 shrink-0">
                                                {nights} {nights === 1 ? 'night' : 'nights'}
                                              </span>
                                              <span className="font-bold text-gray-900 min-w-[75px] text-right shrink-0">
                                                BDT {formatPrice(b.total_amount)}
                                              </span>
                                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize shrink-0 ${
                                                b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                b.status === 'checked_in' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                b.status === 'checked_out' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-gray-50 text-gray-650 border-gray-200'
                                              }`}>
                                                {b.status?.replace('_', ' ')}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                        No repeated guest accounts found with successful booking records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
            </>
          )
        )}

        {activeSection === 'directory' && (
          <HMSGuests hideHeader={true} />
        )}

        {activeSection === 'analytics' && (
          <HMSGuestAnalytics hideHeader={true} />
        )}

      </div>
    </div>
  );
};

export default UserAnalyticsReport;
