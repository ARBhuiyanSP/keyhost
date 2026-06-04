import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiPrinter, FiDownload, FiXCircle } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const CancellationReports = ({ userRole }) => {
    // Specifically fetch cancelled bookings
    const [filters, setFilters] = useState({
        status: 'cancelled',
        search: '',
        dateRange: 'all',
        page: 1, limit: 100
    });

    const endpoint = userRole === 'admin' ? '/admin/bookings' : '/property-owner/bookings';

    const { data, isLoading } = useQuery(
        [`${userRole}-cancellation-reports`, filters],
        () => api.get(`${endpoint}?${new URLSearchParams(filters).toString()}`).then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cancellation Reports</h1>
                        <p className="text-gray-500 mt-2 text-sm">Review rejected and cancelled bookings with reasons.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Cancellation & Rejection Log</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 print-hide">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiFilter /> Report Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Search reference or guest..." className="input-field" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
                        <select className="input-field" value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                            <option value="all">All Time</option>
                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                        </select>
                        <button onClick={handlePrint} className="btn-primary flex justify-center items-center gap-2"><FiPrinter/> Print Report</button>
                    </div>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-red-50 border-b border-red-100 text-xs uppercase tracking-wider text-red-800">
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Guest</th>
                                    <th className="px-6 py-4">Reason / Status</th>
                                    <th className="px-6 py-4">Lost Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.bookings?.map(b => (
                                    <tr key={b.id}>
                                        <td className="px-6 py-4 font-bold text-gray-900">{b.booking_reference}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={b.property_title}>{b.property_title}</td>
                                        <td className="px-6 py-4">{b.guest_first_name} {b.guest_last_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-1 rounded">Cancelled</span>
                                            <p className="text-xs text-gray-400 mt-1">{b.cancellation_reason || 'No specific reason provided'}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-red-400 line-through">
                                            ${parseFloat(b.total_amount||0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.bookings || data.bookings.length === 0) && (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No cancellations found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CancellationReports;
