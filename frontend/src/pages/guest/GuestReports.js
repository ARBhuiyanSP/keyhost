import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiCalendar, FiDollarSign, FiClock, FiFilter, FiPrinter, FiShoppingBag, FiCreditCard } from 'react-icons/fi';

const GuestReports = () => {
    const [dateRange, setDateRange] = useState('year');

    const { data: bookingsData, isLoading } = useQuery(
        ['guest-bookings-report', dateRange],
        () => api.get('/guest/bookings').then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <LoadingSpinner />;

    const bookings = bookingsData?.bookings || [];

    // Aggregate statistics
    const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'past').length;
    const upcomingBookings = bookings.filter(b => b.status === 'confirmed').length;

    return (
        <div className="space-y-8 bg-gray-50 min-h-screen pb-12 print:bg-white print:p-0">
            {/* Header Area */}
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Personal Spending Report</h1>
                        <p className="text-gray-500 mt-2 text-sm">Visualize your travel footprint and expenses.</p>
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
                                <option value="year">Current Year</option>
                                <option value="all">Lifetime Travel</option>
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
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Travel & Expense Log</h1>
                    <p className="text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Expense</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">৳{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            </div>
                            <div className="w-12 h-12 bg-rose-50 flex items-center justify-center rounded-xl text-rose-600">
                                <FiCreditCard className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Completed Trips</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">{completedBookings}</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600">
                                <FiShoppingBag className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Upcoming Plans</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">{upcomingBookings}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600">
                                <FiCalendar className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-6 bg-pink-500 rounded-full"></div>
                            Detailed Receipt Log
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 uppercase text-xs font-bold text-gray-400 tracking-wider">
                                    <th className="px-6 py-4">Destination / Property</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Billed Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.length > 0 ? bookings.map((b, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 line-clamp-1">{b.property_title || 'N/A'}</span>
                                            <span className="text-xs text-gray-500 mt-0.5 block font-mono">Ref: {b.booking_reference}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <FiClock className="w-4 h-4 text-gray-400" />
                                                <span>{new Date(b.check_in || b.created_at).toLocaleDateString()} &rarr; {b.check_out ? new Date(b.check_out).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                ${b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                b.status === 'completed' || b.status === 'past' ? 'bg-emerald-100 text-emerald-800' :
                                                b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {b.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-black text-gray-900 print-text-black text-lg">
                                                ৳{parseFloat(b.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-medium">No activity to report yet! Time to plan a trip.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestReports;
