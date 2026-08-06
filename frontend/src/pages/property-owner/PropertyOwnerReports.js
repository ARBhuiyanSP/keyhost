import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiCalendar, FiDollarSign, FiActivity, FiFilter, FiPrinter, FiGrid, FiBarChart2, FiPieChart } from 'react-icons/fi';

const PropertyOwnerReports = () => {
    const [dateRange, setDateRange] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');

    const { data: stats, isLoading } = useQuery(
        ['owner-stats', dateRange],
        () => api.get(`/property-owner/analytics?days=${dateRange === 'month' ? 30 : dateRange === 'year' ? 365 : 30}`).then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 bg-gray-50 min-h-screen pb-12 print:bg-white print:p-0">
            {/* Header Area */}
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Property Reports Center</h1>
                        <p className="text-gray-500 mt-2 text-sm">Advanced reporting & analytics for your properties.</p>
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
                                <option value="month">Last 30 Days</option>
                                <option value="year">Year to Date (365)</option>
                                <option value="all">All Time History</option>
                            </select>
                        </div>
                        <button onClick={handlePrint} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-primary-500/30">
                            <FiPrinter className="w-4 h-4" /> Print Document
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 print:px-0">
                {/* Print Only Header */}
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Financial Report</h1>
                    <p className="text-gray-500 mt-1">Date Range: {dateRange === 'month' ? 'Last 30 Days' : 'Last 365 Days'}</p>
                </div>

                {/* Modern Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-200/50 p-1 rounded-xl w-fit print-hide border border-gray-200">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiGrid /> Executive Summary
                    </button>
                    <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'financials' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiBarChart2 /> Deep Financials
                    </button>
                    <button onClick={() => setActiveTab('performance')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'performance' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <FiPieChart /> Property Yield
                    </button>
                </div>

                {/* Sub-Reports */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-green-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600 shadow-inner">
                                        <FiDollarSign className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        ${(stats?.totalRevenue || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                                        Pending: ${(stats?.pendingRevenue || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-blue-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 shadow-inner">
                                        <FiCalendar className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Bookings</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        {stats?.totalBookings || 0}
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-purple-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600 shadow-inner">
                                        <FiActivity className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Occupancy Rate</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        {stats?.occupancyRate || 0}%
                                    </h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-gray-300 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 bg-amber-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600 shadow-inner">
                                        <FiPieChart className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Average Rating</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 print-text-black">
                                        {stats?.averageRating || 'N/A'}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings Report Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-gray-300">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
                                    Latest Recorded Transactions
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100 uppercase text-xs font-bold text-gray-400 tracking-wider">
                                            <th className="px-6 py-4">Property</th>
                                            <th className="px-6 py-4">Guest</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 font-bold text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats?.recentBookings?.length > 0 ? stats.recentBookings.map((bk, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                        {bk.property_title || 'Private Property'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 uppercase">
                                                            {bk.guest_name?.[0] || 'G'}
                                                        </div>
                                                        <span className="text-sm text-gray-600">{bk.guest_name || 'Guest'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(bk.created_at || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-gray-900 print-text-black">
                                                        ${parseFloat(bk.amount || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No bookings found in this period.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1">Gross Earnings</p>
                                <h2 className="text-5xl font-black text-gray-900">${(stats?.totalRevenue || 0).toLocaleString()}</h2>
                                <p className="text-sm text-gray-400 font-semibold mt-1">
                                    Pending: ${(stats?.pendingRevenue || 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-green-600 font-bold mt-2 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">
                                    <FiActivity /> Generated in filtered period
                                </p>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-3 border-l pl-8 border-gray-100">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Platform Deductions</p>
                                    <p className="text-lg font-bold text-red-500">-${(stats?.totalRevenue * 0.1 || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">(Est. 10%)</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Projected Net Yield</p>
                                    <p className="text-2xl font-black text-green-600">${(stats?.totalRevenue * 0.9 || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                                Top Property Yields
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats?.topProperties?.length > 0 ? stats.topProperties.map((prop, idx) => (
                                <div key={idx} className="border border-gray-100 p-4 rounded-xl hover:shadow-md transition-shadow flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{prop.title}</h4>
                                            <p className="text-sm text-gray-500">{prop.bookings} total bookings</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-gray-900 print-text-black">${parseFloat(prop.revenue || 0).toLocaleString()}</p>
                                        <p className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Top Earner</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-10 text-gray-400">Not enough data to rank properties.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyOwnerReports;
