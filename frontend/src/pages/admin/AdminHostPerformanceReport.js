import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiPrinter, FiCalendar, FiHome, FiGrid, 
  FiChevronDown, FiChevronUp, FiDollarSign, FiPercent, FiActivity, FiFileText
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const TakaIcon = ({ className = "w-4 h-4" }) => (
  <span className={`${className} font-bold font-sans flex items-center justify-center select-none leading-none`} style={{ fontSize: '1.2em' }}>
    ৳
  </span>
);

const AdminHostPerformanceReport = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [selectedHostId, setSelectedHostId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1); // Start of current month
  });
  const [endDate, setEndDate] = useState(new Date()); // Today
  
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const startRef = useRef(null);
  const endRef = useRef(null);

  const [expandedHosts, setExpandedHosts] = useState({});
  const [reportViewMode, setReportViewMode] = useState('details'); // 'summary' or 'details'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close datepickers & dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startRef.current && !startRef.current.contains(event.target)) {
        setIsStartOpen(false);
      }
      if (endRef.current && !endRef.current.contains(event.target)) {
        setIsEndOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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

  // Fetch host performance report data with auto background polling (every 15 seconds)
  const { data: reportData, isLoading } = useQuery(
    ['admin-host-performance', selectedHostId, formatDateLocal(startDate), formatDateLocal(endDate)],
    async () => {
      const startStr = formatDateLocal(startDate);
      const endStr = formatDateLocal(endDate);
      const response = await api.get(`/admin/reports/host-performance?host_id=${selectedHostId}&start_date=${startStr}&end_date=${endStr}`);
      return response.data?.data || null;
    },
    {
      refetchOnWindowFocus: true,
      refetchInterval: 15000, // Automatically sync background real-time updates every 15s
      onError: () => showError('Failed to load host performance report data')
    }
  );

  // Extract unique hosts for dropdown list from the report data (when unfiltered)
  const [availableHosts, setAvailableHosts] = useState([]);
  useEffect(() => {
    if (reportData?.hosts && selectedHostId === '') {
      const hostList = reportData.hosts.map(h => ({
        id: h.host_id,
        name: h.host_name
      }));
      setAvailableHosts(hostList);
    }
  }, [reportData, selectedHostId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const hosts = reportData?.hosts || [];
    if (hosts.length === 0) {
      showError('No records to export');
      return;
    }

    const csvLines = [];
    // Add Headers
    csvLines.push('Host Name,Host Email,Host Phone,Registered Rooms,Capacity Room-Nights,Booked Room-Nights,Empty Room-Nights,Occupancy Rate,Gross Collection (BDT),Platform Commission (BDT)');

    hosts.forEach(h => {
      const occRate = h.total_capacity_nights > 0 ? Math.round((h.booked_nights / h.total_capacity_nights) * 100) : 0;
      csvLines.push([
        `"${h.host_name?.replace(/"/g, '""') || ''}"`,
        `"${h.host_email || ''}"`,
        `"${h.host_phone || ''}"`,
        h.rooms_registered,
        h.total_capacity_nights,
        h.booked_nights,
        h.empty_nights,
        `${occRate}%`,
        h.gross_collection,
        h.commission
      ].join(','));

      // Add Room Details for this host
      if (h.rooms && h.rooms.length > 0) {
        csvLines.push('  ↳ Room Number,Property Title,Room Type,Floor,Times Booked,Booked Nights,Empty Nights,Collection,Commission');
        h.rooms.forEach(r => {
          csvLines.push([
            `  - "${r.room_number || ''}"`,
            `"${r.property_title?.replace(/"/g, '""') || ''}"`,
            `"${r.room_type || ''}"`,
            `"${r.floor || ''}"`,
            r.times_booked,
            r.booked_nights,
            r.empty_nights,
            r.collection,
            r.commission
          ].join(','));
        });
      }
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `host_performance_report_${formatDateLocal(startDate)}_to_${formatDateLocal(endDate)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleHostExpand = (hostId) => {
    setExpandedHosts(prev => ({
      ...prev,
      [hostId]: !prev[hostId]
    }));
  };

  const summary = reportData?.summary || {};
  const hosts = reportData?.hosts || [];

  // Filter hosts list inside the selectbox popover
  const filteredDropdownHosts = useMemo(() => {
    if (!searchQuery) return availableHosts;
    return availableHosts.filter(h => 
      h.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableHosts, searchQuery]);

  // Display value for the input field
  const selectedHostName = useMemo(() => {
    if (!selectedHostId) return 'All Registered Hosts';
    const host = availableHosts.find(h => String(h.id) === String(selectedHostId));
    return host ? host.name : 'All Registered Hosts';
  }, [selectedHostId, availableHosts]);

  return (
    <div className="space-y-6 pb-12 bg-gray-50 min-h-screen print:bg-white print:p-0 font-sans print-full-width">
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          .print-full-width { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          body { color: #000 !important; background: #fff !important; }
          .print-border { border: 1px solid #e5e7eb !important; }
          tr { break-inside: avoid !important; }
          .print-expand { display: table-row !important; }
        }
      `}</style>
      
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
                <FiActivity className="text-[#004e59]" /> Host Performance & Commission Report
              </h1>
              <p className="text-xs text-gray-400 mt-1">Host-wise registered rooms, date-wise capacity room-nights occupancy, and platform earnings.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 mr-1">
              <button
                onClick={() => setReportViewMode('summary')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider transition-all duration-150 ${
                  reportViewMode === 'summary'
                    ? 'bg-white text-[#004e59] shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Summary View
              </button>
              <button
                onClick={() => setReportViewMode('details')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider transition-all duration-150 ${
                  reportViewMode === 'details'
                    ? 'bg-white text-[#004e59] shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Details View
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={isLoading || hosts.length === 0}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiFileText size={14} /> Export CSV
            </button>
            <button 
              onClick={handlePrint}
              disabled={isLoading}
              className="bg-[#004e59] hover:bg-[#003c45] text-white px-4 py-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
            >
              <FiPrinter size={14} /> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 print:px-0 space-y-6">
        
        {/* Printable Header (Only visible on print) */}
        <div className="hidden print:block border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-black text-gray-900 uppercase">Host Performance & Commission Report</h1>
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-650">
            <div>
              <p><strong>Run Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Period Range:</strong> {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
              <p><strong>Host Filter:</strong> {selectedHostId ? availableHosts.find(h => String(h.id) === String(selectedHostId))?.name || 'Selected Host' : 'All Hosts'}</p>
            </div>
            <div className="text-right">
              <p><strong>Platform:</strong> Keyhost Management Hub</p>
              <p><strong>Capacity Room-Nights:</strong> {summary.totalCapacityNights || 0} nights</p>
              <p><strong>Occupancy Rate:</strong> {summary.occupancyRate || 0}%</p>
            </div>
          </div>
        </div>

        {/* Filter Section (Hidden on print) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          
          {/* Host / Property Owner Searchable Selectbox */}
          <div className="flex flex-col gap-1.5" ref={dropdownRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Host / Property Owner</label>
            <div className="relative">
              <input
                type="text"
                value={isDropdownOpen ? searchQuery : selectedHostName}
                onChange={(e) => {
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  setIsDropdownOpen(true);
                  setSearchQuery(''); // Clear query on focus so they can see all options
                }}
                placeholder="Search host..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-[38px] bg-white cursor-pointer font-semibold text-gray-700 placeholder-gray-400 pr-8"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {selectedHostId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHostId('');
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="text-gray-400 hover:text-gray-650 cursor-pointer font-bold text-sm bg-transparent border-none outline-none mr-1"
                  >
                    ×
                  </button>
                )}
                <FiChevronDown className="text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Dropdown Options List */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar py-1">
                  <div
                    onClick={() => {
                      setSelectedHostId('');
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className={`px-3 py-2 text-xs font-semibold hover:bg-gray-50 cursor-pointer ${!selectedHostId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    All Registered Hosts
                  </div>
                  {filteredDropdownHosts.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">No hosts found</div>
                  ) : (
                    filteredDropdownHosts.map(h => (
                      <div
                        key={h.id}
                        onClick={() => {
                          setSelectedHostId(h.id);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`px-3 py-2 text-xs font-semibold hover:bg-gray-50 cursor-pointer ${String(selectedHostId) === String(h.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      >
                        {h.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date Picker Start */}
          <div className="flex flex-col gap-1.5" ref={startRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Start Date</label>
            <div className="relative">
              <div 
                onClick={() => setIsStartOpen(!isStartOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 cursor-pointer select-none h-[38px] font-semibold"
              >
                <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                <FiCalendar className="text-gray-400" size={14} />
              </div>
              {isStartOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 top-full left-0">
                  <DatePicker
                    selected={startDate}
                    onChange={date => {
                      setStartDate(date);
                      setIsStartOpen(false);
                    }}
                    inline
                  />
                </div>
              )}
            </div>
          </div>

          {/* Date Picker End */}
          <div className="flex flex-col gap-1.5" ref={endRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">End Date</label>
            <div className="relative">
              <div 
                onClick={() => setIsEndOpen(!isEndOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 cursor-pointer select-none h-[38px] font-semibold"
              >
                <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                <FiCalendar className="text-gray-400" size={14} />
              </div>
              {isEndOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 top-full left-0">
                  <DatePicker
                    selected={endDate}
                    onChange={date => {
                      setEndDate(date);
                      setIsEndOpen(false);
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                  <FiHome size={14} />
                </div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Registered Rooms</span>
                <span className="text-xl font-black text-gray-900 block mt-1">{summary.totalRooms || 0}</span>
                <span className="text-[9px] text-gray-400 font-bold block mt-1">Platform capacity count</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative">
                <div className="absolute right-4 top-4">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-black uppercase">
                    {summary.occupancyRate}% Rate
                  </span>
                </div>
                <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-2">
                  <FiPercent size={14} />
                </div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Booked Room-Nights</span>
                <span className="text-xl font-black text-gray-900 block mt-1">{summary.totalBookedNights || 0}</span>
                <span className="text-[9px] text-gray-400 font-bold block mt-1">Total occupied nights</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-2">
                  <FiGrid size={14} />
                </div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Empty Room-Nights</span>
                <span className="text-xl font-black text-gray-900 block mt-1">{summary.totalEmptyNights || 0}</span>
                <span className="text-[9px] text-gray-400 font-bold block mt-1">Total empty capacity nights</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
                  <TakaIcon className="text-emerald-600 w-4 h-4" />
                </div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Gross Collection</span>
                <span className="text-xl font-black text-emerald-600 block mt-1">৳{parseFloat(summary.totalCollection || 0).toLocaleString()}</span>
                <span className="text-[9px] text-gray-400 font-bold block mt-1">Total platform gross bookings</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-650 mb-2">
                  <TakaIcon className="text-indigo-600 w-4 h-4" />
                </div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">Platform Commission</span>
                <span className="text-xl font-black text-indigo-600 block mt-1">৳{parseFloat(summary.totalCommission || 0).toLocaleString()}</span>
                <span className="text-[9px] text-gray-400 font-bold block mt-1">Platform commission margin</span>
              </div>

            </div>

            {/* Detailed Table Section */}
            <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden print:border-none print:shadow-none">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:px-0">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                  <FiFileText className="text-[#004e59]" /> Host-Wise Registered Room Performance & Commissions
                </h3>
              </div>

              {hosts.length === 0 ? (
                <div className="text-center py-16 text-gray-400 italic text-xs">
                  No hosts found in the selected context.
                </div>
              ) : reportViewMode === 'summary' ? (
                // Summary View: Single row consolidated overview
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse print:text-[10px]">
                    <thead>
                      <tr className="bg-gray-100/50 border-b border-gray-200 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="px-6 py-4">Report Period</th>
                        <th className="px-6 py-4 text-center">Total Hosts</th>
                        <th className="px-6 py-4 text-center">Total Rooms</th>
                        <th className="px-6 py-4 text-center">Booked Nights</th>
                        <th className="px-6 py-4 text-center">Empty Nights</th>
                        <th className="px-6 py-4 text-center">Average Occupancy</th>
                        <th className="px-6 py-4 text-right">Total Gross Collection</th>
                        <th className="px-6 py-4 text-right">Total Commission</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 font-semibold">
                      <tr className="bg-white hover:bg-slate-50/40 font-bold">
                        <td className="px-6 py-4 text-gray-900">
                          {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{summary.totalHosts || 0} hosts</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{summary.totalRooms || 0} rooms</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-800">{summary.totalBookedNights || 0} nights</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-650">{summary.totalEmptyNights || 0} nights</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-black uppercase">
                            {summary.occupancyRate || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 text-sm">৳{parseFloat(summary.totalCollection || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-[#004e59] text-sm">৳{parseFloat(summary.totalCommission || 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                // Details view (original list of hosts with expandable chevrons)
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse print:text-[10px]">
                    <thead>
                      <tr className="bg-gray-100/50 border-b border-gray-200 text-gray-400 uppercase font-bold tracking-wider">
                        {reportViewMode === 'details' && <th className="px-6 py-4 w-[60px] print:hidden" />}
                        <th className="px-6 py-4">Host Name / Contact</th>
                        <th className="px-6 py-4 text-center">Rooms</th>
                        <th className="px-6 py-4 text-center">Booked Nights</th>
                        <th className="px-6 py-4 text-center">Empty Nights</th>
                        <th className="px-6 py-4 text-center">Occupancy Rate</th>
                        <th className="px-6 py-4 text-right">Gross Collection</th>
                        <th className="px-6 py-4 text-right">Platform Commission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                      {hosts.map((host) => {
                        const isExpanded = reportViewMode === 'details' && !!expandedHosts[host.host_id];
                        const occRate = host.total_capacity_nights > 0 ? Math.round((host.booked_nights / host.total_capacity_nights) * 100) : 0;

                        return (
                          <React.Fragment key={host.host_id}>
                            <tr className="hover:bg-slate-50/40 transition-all select-none">
                              {reportViewMode === 'details' && (
                                <td className="px-6 py-4 text-center print:hidden">
                                  <button
                                    onClick={() => toggleHostExpand(host.host_id)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                  </button>
                                </td>
                              )}
                              <td className="px-6 py-4">
                                <span className="text-gray-900 font-bold text-sm print:text-xs block">{host.host_name}</span>
                                <span className="text-[10px] text-gray-400 block font-medium mt-0.5">{host.host_email} • {host.host_phone}</span>
                              </td>
                              <td className="px-6 py-4 text-center text-sm print:text-xs font-bold text-gray-800">{host.rooms_registered} rooms</td>
                              <td className="px-6 py-4 text-center font-bold text-gray-800">{host.booked_nights} nights</td>
                              <td className="px-6 py-4 text-center font-bold text-gray-600">{host.empty_nights} nights</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  occRate >= 70 ? 'bg-emerald-50 text-emerald-700' : occRate >= 30 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {occRate}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-black text-gray-900 text-sm print:text-xs">৳{parseFloat(host.gross_collection || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 text-right font-black text-[#004e59] text-sm print:text-xs">৳{parseFloat(host.commission || 0).toLocaleString()}</td>
                            </tr>
                            
                            {/* Expanded Rooms List Sub-Table */}
                            {reportViewMode === 'details' && (
                              <tr className={isExpanded ? "" : "hidden print:table-row"}>
                                <td colSpan={8} className="bg-slate-50/50 px-8 py-4 border-y border-slate-100 print:bg-white print:px-2">
                                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white print:shadow-none print:border-slate-350">
                                    <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 font-black text-[10px] text-gray-500 uppercase tracking-widest">
                                      Room-by-Room Occupancy Breakdown ({host.rooms.length} registered rooms)
                                    </div>
                                    <table className="w-full text-[11px] text-left">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-gray-400 uppercase font-bold">
                                          <th className="px-4 py-2.5">Room Number</th>
                                          <th className="px-4 py-2.5">Property Title</th>
                                          <th className="px-4 py-2.5">Room Type</th>
                                          <th className="px-4 py-2.5">Floor</th>
                                          <th className="px-4 py-2.5 text-center">Times Booked</th>
                                          <th className="px-4 py-2.5 text-center">Booked Nights</th>
                                          <th className="px-4 py-2.5 text-center">Empty Nights</th>
                                          <th className="px-4 py-2.5 text-right">Room Earnings</th>
                                          <th className="px-4 py-2.5 text-right">Commission</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-gray-650 font-semibold">
                                        {host.rooms.map((room) => (
                                          <tr key={room.room_id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2.5 font-bold text-gray-900">Room {room.room_number}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">{room.property_title}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-500">{room.room_type}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{room.floor}</td>
                                            <td className="px-4 py-2.5 text-center font-bold text-gray-800">{room.times_booked} times</td>
                                            <td className="px-4 py-2.5 text-center font-bold text-gray-800">{room.booked_nights} nights</td>
                                            <td className="px-4 py-2.5 text-center font-bold text-gray-600">{room.empty_nights} nights</td>
                                            <td className="px-4 py-2.5 text-right font-bold text-gray-900">৳{parseFloat(room.collection || 0).toLocaleString()}</td>
                                            <td className="px-4 py-2.5 text-right font-bold text-[#004e59]">৳{parseFloat(room.commission || 0).toLocaleString()}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-bold border-t-2 border-gray-300 print:text-[10px]">
                        {reportViewMode === 'details' && <td className="px-6 py-4 text-center print:hidden">Total</td>}
                        <td className="px-6 py-4 text-gray-900 font-extrabold"><span className="hidden print:inline-block mr-1">Total:</span>All Hosts ({summary.totalHosts})</td>
                        <td className="px-6 py-4 text-center text-gray-900 font-extrabold">{summary.totalRooms} rooms</td>
                        <td className="px-6 py-4 text-center text-gray-900 font-extrabold">{summary.totalBookedNights} nights</td>
                        <td className="px-6 py-4 text-center text-gray-900 font-extrabold">{summary.totalEmptyNights} nights</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-black uppercase">
                            {summary.occupancyRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 font-extrabold text-sm">৳{parseFloat(summary.totalCollection || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-[#004e59] font-black text-sm">৳{parseFloat(summary.totalCommission || 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
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

export default AdminHostPerformanceReport;
