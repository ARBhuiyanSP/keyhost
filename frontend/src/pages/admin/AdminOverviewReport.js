import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiPrinter, FiCalendar, FiHome, FiGrid, 
  FiCheckCircle, FiAlertCircle, FiSettings, FiActivity, FiSearch, FiFileText, FiRefreshCw, FiChevronDown
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminOverviewReport = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const propertyDropdownRef = useRef(null);

  const [targetDate, setTargetDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target)) {
        setIsPropertyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateLocal = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // 1. Fetch properties for filter dropdown
  const { data: properties } = useQuery(
    ['admin-assignment-properties-all'],
    () => api.get('/admin/properties/all?status=active').then(res => res.data?.data?.properties || []),
    { refetchOnWindowFocus: false }
  );

  // 2. Fetch occupancy statistics and list with auto background polling (every 15 seconds)
  const { data: statsData, isLoading } = useQuery(
    ['admin-overview-occupancy', selectedPropertyId, formatDateLocal(targetDate)],
    async () => {
      const dateStr = formatDateLocal(targetDate);
      const response = await api.get(`/admin/reports/overview-occupancy?property_id=${selectedPropertyId}&date=${dateStr}`);
      return response.data?.data || null;
    },
    {
      refetchOnWindowFocus: true,
      refetchInterval: 15000, // Automatically sync background real-time updates every 15s
      onError: () => showError('Failed to load occupancy report data')
    }
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const list = statsData?.occupancyList || [];
    if (list.length === 0) {
      showError('No records to export');
      return;
    }

    const headers = ['SL', 'Property Name', 'Room No', 'Floor', 'Room Type', 'Guest Name', 'Guest Phone', 'Check In', 'Check Out', 'Booking Status'];
    const csvContent = [
      headers.join(','),
      ...list.map((item, idx) => [
        idx + 1,
        `"${item.property_title?.replace(/"/g, '""') || ''}"`,
        `"${item.room_number || ''}"`,
        `"${item.floor || ''}"`,
        `"${item.room_type || ''}"`,
        `"${item.guest_name?.replace(/"/g, '""') || ''}"`,
        `"${item.guest_phone || ''}"`,
        item.check_in_date ? formatDateLocal(new Date(item.check_in_date)) : '',
        item.check_out_date ? formatDateLocal(new Date(item.check_out_date)) : '',
        item.booking_status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_occupancy_report_${formatDateLocal(targetDate)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = statsData?.summary || {};
  const occupancyList = statsData?.occupancyList || [];
  const statusCounts = summary.statusCounts || { available: 0, occupied: 0, dirty: 0, maintenance: 0 };
  const additional = summary.additional || { totalConfirmedBookings: 0, totalRevenuePaid: 0 };

  const getStatusColorBadge = (status) => {
    const map = {
      available: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      occupied: 'bg-blue-50 text-blue-700 border-blue-100',
      dirty: 'bg-amber-50 text-amber-700 border-amber-100',
      maintenance: 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-150';
  };

  return (
    <div className="space-y-6 pb-12 bg-gray-50 min-h-screen print:bg-white print:p-0">
      
      {/* Top Header Row (Hidden on print) */}
      <div className="bg-white px-6 py-6 border-b border-gray-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/reports')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
              title="Back to Reports"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <FiActivity className="text-blue-600" /> Occupancy Report
              </h1>
              <p className="text-xs text-gray-400 mt-1">Cross-platform property and occupancy outline with real-time room status.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={isLoading || occupancyList.length === 0}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiFileText size={14} /> Export CSV
            </button>
            <button 
              onClick={handlePrint}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <FiPrinter size={14} /> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 print:px-0 space-y-6">
        
        {/* Printable Header (Only visible on print) */}
        <div className="hidden print:block border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-black text-gray-900 uppercase">Occupancy Report</h1>
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-650">
            <div>
              <p><strong>Run Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Target Occupancy Date:</strong> {targetDate.toLocaleDateString()}</p>
              <p><strong>Property Context:</strong> {selectedPropertyId ? properties?.find(p => String(p.id) === String(selectedPropertyId))?.title || 'Selected Property' : 'All Listed Properties'}</p>
            </div>
            <div className="text-right">
              <p><strong>Platform:</strong> Keyhost Management Hub</p>
              <p><strong>Active Properties:</strong> {summary.totalProperties || 0}</p>
              <p><strong>Active Rooms count:</strong> {summary.totalRooms || 0}</p>
            </div>
          </div>
        </div>

        {/* Filter Section (Hidden on print) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Searchable Property Selector */}
            <div className="flex flex-col gap-1.5" ref={propertyDropdownRef}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Property</label>
              <div className="relative">
                <div 
                  onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 cursor-pointer select-none h-[38px] font-semibold hover:border-blue-400 transition-colors"
                >
                  <span className="truncate">
                    {selectedPropertyId 
                      ? properties?.find(p => String(p.id) === String(selectedPropertyId))?.title || 'Selected Property'
                      : 'All Listed Properties'}
                  </span>
                  <FiChevronDown className="text-gray-400 shrink-0" size={14} />
                </div>

                {isPropertyDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl p-2 top-full left-0 animate-fadeIn">
                    <div className="relative mb-2">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Type to search property..."
                        value={propertySearchQuery}
                        onChange={(e) => setPropertySearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                      <div 
                        onClick={() => {
                          setSelectedPropertyId('');
                          setIsPropertyDropdownOpen(false);
                          setPropertySearchQuery('');
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                          !selectedPropertyId ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>All Listed Properties</span>
                        {!selectedPropertyId && <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-bold">Selected</span>}
                      </div>

                      {(properties || [])
                        .filter(p => p.title.toLowerCase().includes(propertySearchQuery.toLowerCase()))
                        .map(p => {
                          const isSelected = String(p.id) === String(selectedPropertyId);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPropertyId(p.id);
                                setIsPropertyDropdownOpen(false);
                                setPropertySearchQuery('');
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                                isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span className="truncate">{p.title}</span>
                              {isSelected && <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-bold">Selected</span>}
                            </div>
                          );
                        })}

                      {(properties || []).filter(p => p.title.toLowerCase().includes(propertySearchQuery.toLowerCase())).length === 0 && (
                        <div className="py-3 text-center text-xs text-gray-400 font-medium">No matching properties found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-1.5" ref={datePickerRef}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Date</label>
              <div className="relative">
                <div 
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 cursor-pointer select-none h-[38px] font-semibold"
                >
                  <span>{targetDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                  <FiCalendar className="text-gray-400" size={14} />
                </div>
                {isDatePickerOpen && (
                  <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 top-full left-0">
                    <DatePicker
                      selected={targetDate}
                      onChange={date => {
                        setTargetDate(date);
                        setIsDatePickerOpen(false);
                      }}
                      inline
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3 shadow-inner">
                  <FiHome size={16} />
                </div>
                <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-wider block">Properties</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">{summary.totalProperties || 0}</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-1.5">Listed Active Properties</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-3 shadow-inner">
                  <FiGrid size={16} />
                </div>
                <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-wider block">Total Rooms</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">{summary.totalRooms || 0}</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-1.5">Listed Active Rooms</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
                <div className="absolute right-4 top-4">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-black uppercase">
                    {summary.occupancyRate}% Occupied
                  </span>
                </div>
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-3 shadow-inner">
                  <FiCheckCircle size={16} />
                </div>
                <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-wider block">Booked / Occupied</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">{summary.bookedRooms || 0}</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-1.5">Rooms currently Booked</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                  <FiAlertCircle size={16} />
                </div>
                <span className="text-[10px] text-gray-455 font-extrabold uppercase tracking-wider block">Available Rooms</span>
                <span className="text-2xl font-black text-gray-900 block mt-1">{summary.availableRooms || 0}</span>
                <span className="text-[10px] text-gray-400 font-bold block mt-1.5">Free rooms ready for stay</span>
              </div>

            </div>

            {/* Room Status Meter & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Room Status Breakdown Bar */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs md:col-span-2 space-y-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <FiActivity className="text-blue-500" /> Room Status Distribution
                </h3>
                
                {/* Horizontal Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                  {summary.totalRooms > 0 ? (
                    <>
                      <div 
                        className="bg-emerald-500 h-full hover:opacity-90 transition-all" 
                        style={{ width: `${(statusCounts.available / summary.totalRooms) * 100}%` }}
                        title={`Available: ${statusCounts.available}`}
                      />
                      <div 
                        className="bg-blue-500 h-full hover:opacity-90 transition-all" 
                        style={{ width: `${(statusCounts.occupied / summary.totalRooms) * 100}%` }}
                        title={`Occupied: ${statusCounts.occupied}`}
                      />
                      <div 
                        className="bg-amber-500 h-full hover:opacity-90 transition-all" 
                        style={{ width: `${(statusCounts.dirty / summary.totalRooms) * 100}%` }}
                        title={`Dirty: ${statusCounts.dirty}`}
                      />
                      <div 
                        className="bg-rose-500 h-full hover:opacity-90 transition-all" 
                        style={{ width: `${(statusCounts.maintenance / summary.totalRooms) * 100}%` }}
                        title={`Maintenance: ${statusCounts.maintenance}`}
                      />
                    </>
                  ) : (
                    <div className="w-full bg-gray-200 h-full" />
                  )}
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full block shrink-0" />
                    <span className="text-gray-700">Available: <strong className="text-gray-900">{statusCounts.available}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full block shrink-0" />
                    <span className="text-gray-700">Occupied: <strong className="text-gray-900">{statusCounts.occupied}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full block shrink-0" />
                    <span className="text-gray-700">Dirty: <strong className="text-gray-900">{statusCounts.dirty}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-rose-500 rounded-full block shrink-0" />
                    <span className="text-gray-700">Maintenance: <strong className="text-gray-900">{statusCounts.maintenance}</strong></span>
                  </div>
                </div>
              </div>

              {/* Extra Platform Metrics */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5">
                    <FiSettings className="text-purple-500" /> Platform Insights
                  </h3>
                  <div className="space-y-2.5 mt-3 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Bookings (Paid & Pending):</span>
                      <span className="text-gray-800 font-bold">{additional.totalConfirmedBookings} stays</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Paid Revenue:</span>
                      <span className="text-emerald-600 font-extrabold">৳{parseFloat(additional.totalRevenuePaid || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 font-semibold italic border-t border-gray-50 pt-2 text-center">
                  Occupancy lists filter confirmed check-ins active for {targetDate.toLocaleDateString()}
                </div>
              </div>

            </div>

            {/* Detailed Occupied Rooms Table */}
            <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden print:border-none print:shadow-none">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:px-0">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                  <FiFileText className="text-blue-500" /> Active Occupancy Logs ({occupancyList.length} Rooms Booked)
                </h3>
              </div>

              {occupancyList.length === 0 ? (
                <div className="text-center py-16 text-gray-400 italic text-xs bg-slate-50/50">
                  No rooms are currently occupied/booked for this target date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100/50 border-b border-gray-200 text-gray-450 uppercase font-bold tracking-wider">
                        <th className="px-5 py-3.5">SL</th>
                        <th className="px-5 py-3.5">Property</th>
                        <th className="px-5 py-3.5">Room</th>
                        <th className="px-5 py-3.5">Floor &amp; Type</th>
                        <th className="px-5 py-3.5">Guest Info</th>
                        <th className="px-5 py-3.5 text-center">Stay Dates</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                      {occupancyList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition-all">
                          <td className="px-5 py-3.5 text-gray-400">{idx + 1}</td>
                          <td className="px-5 py-3.5 text-gray-850 font-bold max-w-xs truncate" title={item.property_title}>{item.property_title}</td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">Room {item.room_number}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-gray-500">{item.room_type || 'Standard'}</span>
                            {item.floor && <span className="text-[10px] text-gray-400 block font-medium">Floor: {item.floor}</span>}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-gray-900 font-bold block">{item.guest_name || 'Guest'}</span>
                            {item.guest_phone && <span className="text-[10px] text-gray-450 font-medium">{item.guest_phone}</span>}
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <div className="font-bold text-gray-800">
                              {new Date(item.check_in_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })} - {new Date(item.check_out_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })}
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                              {Math.round((new Date(item.check_out_date) - new Date(item.check_in_date)) / (1000 * 60 * 60 * 24))} nights
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-block border px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColorBadge(item.room_status)}`}>
                              {item.room_status || 'Occupied'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border font-bold">
                              {item.booking_reference}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default AdminOverviewReport;
