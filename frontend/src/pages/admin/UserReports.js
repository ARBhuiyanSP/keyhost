import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiUsers, FiSearch, FiFilter, FiPrinter, FiXCircle, FiInfo, FiFileText } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserReports = () => {
    const [filters, setFilters] = useState({
        userType: '',
        city: '',
        country: '',
        dateRange: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        userType: '',
        city: '',
        country: '',
        dateRange: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });

    const [searchInput, setSearchInput] = useState('');

    // Compute exact dates to pass to the backend API
    const getQueryParams = () => {
        const params = {};
        if (appliedFilters.userType) params.user_type = appliedFilters.userType;
        if (appliedFilters.city) params.city = appliedFilters.city;
        if (appliedFilters.country) params.country = appliedFilters.country;
        if (appliedFilters.search) params.search = appliedFilters.search;

        const today = new Date();
        if (appliedFilters.dateRange === 'this_month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            params.startDate = start.toISOString().split('T')[0];
            params.endDate = end.toISOString().split('T')[0];
        } else if (appliedFilters.dateRange === 'last_month') {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            params.startDate = start.toISOString().split('T')[0];
            params.endDate = end.toISOString().split('T')[0];
        } else if (appliedFilters.dateRange === 'custom') {
            if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
            if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
        }

        return params;
    };

    const { data, isLoading, isFetching } = useQuery(
        ['admin-user-demographics-report', appliedFilters],
        () => {
            const params = getQueryParams();
            return api.get(`/admin/reports/users?${new URLSearchParams(params).toString()}`).then(res => res.data.data);
        },
        { refetchOnWindowFocus: false, keepPreviousData: true }
    );

    const users = data?.users || [];
    const cities = data?.cities || [];
    const countries = data?.countries || [];

    const handleSearch = () => {
        setAppliedFilters({
            ...filters,
            search: searchInput
        });
    };

    const handleReset = () => {
        setSearchInput('');
        const freshFilters = {
            userType: '',
            city: '',
            country: '',
            dateRange: 'all',
            startDate: '',
            endDate: '',
            search: ''
        };
        setFilters(freshFilters);
        setAppliedFilters(freshFilters);
    };

    const handlePrint = () => window.print();

    const handleExportCSV = () => {
        if (users.length === 0) return;
        const headers = ['SL', 'Name', 'Email', 'Phone', 'User Type', 'City', 'Country', 'Registration Date', 'Status'];
        const csvRows = [headers.join(',')];

        users.forEach((u, idx) => {
            const row = [
                idx + 1,
                `"${u.first_name || ''} ${u.last_name || ''}"`,
                `"${u.email || ''}"`,
                `"${u.phone || ''}"`,
                `"${u.user_type || ''}"`,
                `"${u.city || ''}"`,
                `"${u.country || ''}"`,
                `"${u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}"`,
                `"${u.is_active ? 'Active' : 'Blocked'}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `User_Registration_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTypeName = (type) => {
        switch (type?.toLowerCase()) {
            case 'guest': return 'Guest';
            case 'property_owner': return 'Host/Owner';
            case 'admin': return 'Admin';
            case 'staff': return 'Staff';
            default: return type || '—';
        }
    };

    const fmtDate = (dStr) => {
        if (!dStr) return '';
        const d = new Date(dStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 print:bg-white print:p-0 font-sans">
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .print-hide { display: none !important; }
                    .print-text-black { color: #000000 !important; }
                    tr { break-inside: avoid !important; }
                }
            `}} />            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hide">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <FiUsers className="text-blue-600" /> User Demographics Report
                    </h1>
                    <p className="text-xs text-gray-500 mt-1.5">Search and filter active users by type, location, and registration dates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={users.length === 0}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <FiFileText size={14} /> Export CSV
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-150 shadow-sm active:scale-95 shadow-blue-500/10"
                    >
                        <FiPrinter size={14} /> Print Report
                    </button>
                </div>
            </div>

            {/* Print Title (Only visible in Print) */}
            <div className="hidden print:block border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-2xl font-black text-gray-900 uppercase">User Demographics Report</h1>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-600">
                    <div>
                        <p><strong>Filters:</strong> Type: {getTypeName(appliedFilters.userType) || 'All'} | City: {appliedFilters.city || 'All'} | Country: {appliedFilters.country || 'All'}</p>
                        <p><strong>Registration Period:</strong> {appliedFilters.startDate ? fmtDate(appliedFilters.startDate) : 'Lifetime'} {appliedFilters.endDate ? `to ${fmtDate(appliedFilters.endDate)}` : ''}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Match Count:</strong> {users.length} users</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                {/* Glassmorphic Report Filters Console */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/80 p-6 mb-8 print-hide transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm tracking-wide uppercase">
                            <FiFilter className="text-blue-500" />
                            <span>Report Filters</span>
                        </h3>
                        {isFetching && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 animate-pulse">
                                Updating Grid...
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Search input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search Name/Email/Phone</label>
                            <div className="relative">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search details..." 
                                    className="w-full pl-10 pr-9 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                    value={searchInput} 
                                    onChange={(e) => setSearchInput(e.target.value)} 
                                />
                                {searchInput && (
                                    <button 
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FiXCircle />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* User Type select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">User Type</label>
                            <select 
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs cursor-pointer h-[34px]"
                                value={filters.userType} 
                                onChange={(e) => setFilters({...filters, userType: e.target.value})}
                            >
                                <option value="">All Types</option>
                                <option value="guest">Guest</option>
                                <option value="property_owner">Host/Owner</option>
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>

                        {/* City select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">City</label>
                            <select 
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs cursor-pointer h-[34px]"
                                value={filters.city} 
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                            >
                                <option value="">All Cities</option>
                                {cities.map((city, idx) => (
                                    <option key={idx} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Country select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Country</label>
                            <select 
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs cursor-pointer h-[34px]"
                                value={filters.country} 
                                onChange={(e) => setFilters({...filters, country: e.target.value})}
                            >
                                <option value="">All Countries</option>
                                {countries.map((country, idx) => (
                                    <option key={idx} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Preset */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reg Date Period</label>
                            <select 
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs cursor-pointer h-[34px]"
                                value={filters.dateRange} 
                                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                            >
                                <option value="all">Lifetime</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {/* Filter buttons */}
                        <div className="lg:col-span-3 flex items-center gap-3">
                            <button
                                onClick={handleSearch}
                                className="flex-1 bg-[#004e59] hover:bg-[#003d46] text-white py-2 px-6 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-2 px-6 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Picker inputs */}
                    {filters.dateRange === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-4 animate-fade-in">
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">From:</span>
                                <input 
                                    type="date" 
                                    className="w-full pl-16 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs h-[34px]"
                                    value={filters.startDate || ''} 
                                    onChange={(e) => setFilters({...filters, startDate: e.target.value})} 
                                />
                            </div>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">To:</span>
                                <input 
                                    type="date" 
                                    className="w-full pl-16 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs h-[34px]"
                                    value={filters.endDate || ''} 
                                    onChange={(e) => setFilters({...filters, endDate: e.target.value})} 
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* User List Table */}
                {isLoading && !data ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"><LoadingSpinner /></div>
                ) : (
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-250 overflow-hidden print:border-none print:shadow-none transition-opacity duration-200 ${isFetching ? 'opacity-65' : 'opacity-100'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-blue-50/30 border-b border-blue-100/50 text-[10px] uppercase tracking-wider text-blue-900 font-extrabold">
                                        <th className="px-6 py-4 text-center w-16">SL</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">User Type</th>
                                        <th className="px-6 py-4">City</th>
                                        <th className="px-6 py-4">Country</th>
                                        <th className="px-6 py-4">Reg Date</th>
                                        <th className="px-6 py-4 text-center w-28">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150/60 text-xs">
                                    {users.map((u, idx) => (
                                        <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-3.5 text-center text-gray-500 font-bold">{idx + 1}</td>
                                            <td className="px-6 py-3.5 font-bold text-gray-900">{u.first_name} {u.last_name}</td>
                                            <td className="px-6 py-3.5 text-gray-700 font-medium">{u.email}</td>
                                            <td className="px-6 py-3.5 text-gray-600 font-mono">{u.phone || '—'}</td>
                                            <td className="px-6 py-3.5 font-semibold">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    u.user_type === 'guest' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                                                    u.user_type === 'property_owner' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                                    'bg-purple-50 text-purple-800 border border-purple-100'
                                                }`}>
                                                    {getTypeName(u.user_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-gray-700 font-medium">{u.city || '—'}</td>
                                            <td className="px-6 py-3.5 text-gray-700 font-medium">{u.country || '—'}</td>
                                            <td className="px-6 py-3.5 text-gray-500 font-medium font-mono">{fmtDate(u.created_at)}</td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                    u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {u.is_active ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {users.length > 0 && (
                                        <tr className="bg-blue-50/10 font-bold border-t-2 border-blue-200">
                                            <td colSpan="8" className="px-6 py-4 text-sm text-right text-blue-900">Total Matched Users</td>
                                            <td className="px-6 py-4 text-center text-sm font-black text-blue-950 font-mono">
                                                {users.length}
                                            </td>
                                        </tr>
                                    )}

                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <FiInfo className="text-3xl text-gray-300" />
                                                    <span className="text-sm font-medium">No users found matching your filters.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReports;
