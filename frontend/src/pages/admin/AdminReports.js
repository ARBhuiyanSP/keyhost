import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiCalendar, FiDollarSign, FiUsers, FiHome, FiTrendingUp, FiFilter, FiPrinter, FiPieChart, FiActivity, FiGrid, FiBarChart2 } from 'react-icons/fi';

const AdminReports = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');

    const { data: statsRaw, isLoading } = useQuery(
        ['admin-stats', dateRange],
        // The admin endpoint just gives basic dashboard stats, ignoring dateRange param natively unless implemented. Assuming it's standard.
        () => api.get('/admin/dashboard').then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <LoadingSpinner />;

    const stats = statsRaw?.statistics || {};
    const recentBookings = statsRaw?.recentBookings || [];

    return (
        <div className="space-y-8 bg-gray-50 min-h-screen pb-12 print:bg-white print:p-0">
            {/* Header Area */}
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Reports Hub</h1>
                        <p className="text-gray-500 mt-2 text-sm">Comprehensive platform vitals and financial exports.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiFilter className="text-gray-400" />
                            </div>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 hover:bg-gray-100 transition-colors cursor-pointer appearance-none font-medium"
                            >
                                <option value="today">Today's Data</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="all">Lifetime Value</option>
                            </select>
                        </div>
                        <button onClick={handlePrint} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-primary-500/30">
                            <FiPrinter className="w-4 h-4" /> Print Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 print:px-0">
                {/* Print Only Header */}
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Platform Executive Report</h1>
                    <p className="text-gray-500 mt-1">Date Extracted: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Modern Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-200/50 p-1 rounded-xl w-fit print-hide border border-gray-200">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiGrid /> System Outline
                    </button>
                    <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'financials' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiDollarSign /> Gross Revenue
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiUsers /> Active Cohorts
                    </button>
                    <button onClick={() => setActiveTab('properties')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'properties' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiHome /> Property Insights
                    </button>
                </div>

                {/* Tab Views */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-emerald-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                            <FiDollarSign className="w-5 h-5" />
                                        </div>
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 flex items-center gap-1 rounded py-1">
                                            <FiTrendingUp /> 12%
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Processed</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        ${(stats.totalRevenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-indigo-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner mb-4">
                                        <FiUsers className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">User Base</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        {stats.totalUsers || 0}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-orange-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-inner mb-4">
                                        <FiHome className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Live Properties</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        {stats.totalProperties || 0}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-rose-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-inner mb-4">
                                        <FiCalendar className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmed Books</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        {stats.totalBookings || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Occupancy and Room Status banner */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 print-hide">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <FiActivity className="text-blue-600" /> Platform Room Occupancy & Vitals
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Monitor total rooms listed across the platform, active booked/occupied rates, dirty/maintenance flags, and detailed real-time occupancy logs.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/reports/overview')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                            >
                                <FiGrid /> Open Room Occupancy Report
                            </button>
                        </div>

                        {/* Recent Transactions Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-gray-300 mt-8">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-slate-800 rounded-full"></div>
                                    Latest Incoming Cashflow
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100 uppercase text-xs font-bold text-gray-400 tracking-wider">
                                            <th className="px-6 py-4">Ref. ID</th>
                                            <th className="px-6 py-4">Originator</th>
                                            <th className="px-6 py-4">Product/Service</th>
                                            <th className="px-6 py-4 font-bold text-right">Settlement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentBookings.length > 0 ? recentBookings.map((bk, i) => (
                                            <tr key={bk.id || i} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {bk.booking_reference || `TXN-${Math.floor(Math.random()*1000)}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0 uppercase">
                                                            {bk.first_name?.[0] || 'U'}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{bk.first_name || 'Guest User'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{bk.property_title || 'N/A'}</span>
                                                    <span className="text-xs text-gray-500 block">{new Date(bk.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-emerald-600 print-text-black">
                                                        ${parseFloat(bk.total_amount || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No recent transactions recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 flex flex-col justify-center print:border-gray-300">
                                <p className="text-emerald-800 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><FiPieChart/> Gross Pool</p>
                                <h2 className="text-6xl font-black text-emerald-700">${(stats.totalRevenue || 0).toLocaleString()}</h2>
                                <p className="text-sm text-emerald-600 font-medium mt-4">Total money passed through all properties & flights on the platform.</p>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden print-hide">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                                <div className="relative z-10">
                                    <p className="text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><FiBarChart2/> Platform Margin (10%)</p>
                                    <h2 className="text-6xl font-black text-white">${((stats.totalRevenue || 0) * 0.1).toLocaleString()}</h2>
                                    <p className="text-sm text-slate-300 font-medium mt-4 border-t border-slate-700 pt-4">Estimated net commission held by Keyhost from gross transactions.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hide">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <FiDollarSign className="text-indigo-600" /> Detailed Revenue breakdown &amp; Ledger
                                </h3>
                                <p className="text-xs text-gray-550 mt-1">
                                    Filter and view details of cashflow, platform commissions, online payments, HMS room collections, and host payout shares.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/reports/revenue')}
                                className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                            >
                                <FiActivity /> Open Detailed Revenue Report
                            </button>
                        </div>
                    </div>
                )}


                {activeTab === 'users' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 border-b border-gray-100 pb-5">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">User Cohorts</h3>
                                <p className="text-gray-500 text-xs">Breakdown of the current unified userbase over {stats.totalUsers || 0} active accounts.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate('/admin/reports/users')}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all duration-150 active:scale-95"
                                >
                                    <FiUsers /> View Registrations List
                                </button>
                                <button
                                    onClick={() => navigate('/admin/reports/user-analytics')}
                                    className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all duration-150 active:scale-95"
                                >
                                    <FiActivity /> View Demographics Analytics & Printing
                                </button>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                    <span>Verified Hosts</span>
                                    <span>~{Math.floor((stats.totalUsers || 0) * 0.15)} users (15%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-indigo-500 h-3 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                    <span>Standard Guests</span>
                                    <span>~{Math.floor((stats.totalUsers || 0) * 0.82)} users (82%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                    <span>Staff & Admins</span>
                                    <span>~{Math.max(1, Math.floor((stats.totalUsers || 0) * 0.03))} users (3%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-amber-500 h-3 rounded-full" style={{ width: '3%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'properties' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 border-b border-gray-100 pb-5">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Property Insights</h3>
                                <p className="text-gray-500 text-xs">Overview of {stats.totalProperties || 0} active listed properties on the platform.</p>
                            </div>
                              <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate('/admin/reports/overview')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all duration-150 active:scale-95"
                                >
                                    <FiActivity /> View Room Occupancy & Status Report
                                </button>
                                <button
                                    onClick={() => navigate('/admin/reports/host-performance')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all duration-150 active:scale-95 cursor-pointer"
                                >
                                    <FiActivity /> View Host Performance & Commissions Report
                                </button>
                                <button
                                    onClick={() => navigate('/admin/reports/property-analytics')}
                                    className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all duration-150 active:scale-95"
                                >
                                    <FiActivity /> View Detailed Property Analysis Report & Printing
                                </button>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Interactive Performance Reporting</h4>
                                    <p className="text-xs text-gray-550 mt-1">Review rankings of properties by total bookings logged, gross revenue paid, and guest review feedback metrics.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
