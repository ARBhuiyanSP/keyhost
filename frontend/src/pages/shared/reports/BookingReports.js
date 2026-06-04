import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiPrinter, FiDownload, FiCalendar } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const BookingReports = ({ userRole }) => {
    // Shared component for Admin and Property Owner
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        dateRange: 'all',
        page: 1, limit: 100
    });

    const endpoint = userRole === 'admin' ? '/admin/bookings' : '/property-owner/bookings';

    const { data, isLoading } = useQuery(
        [`${userRole}-booking-reports`, filters],
        () => api.get(`${endpoint}?${new URLSearchParams(filters).toString()}`).then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => window.print();

    // Export simplified CSV
    const exportCSV = () => {
        if (!data?.bookings) return;
        const headers = ['Ref', 'Property', 'Guest', 'Check In', 'Check Out', 'Amount', 'Status'];
        const csvRows = [headers.join(',')];
        
        data.bookings.forEach(b => {
            const row = [
                b.booking_reference, 
                `"${b.property_title || ''}"`, 
                `"${b.guest_first_name || ''} ${b.guest_last_name || ''}"`,
                b.check_in_date?.split('T')[0],
                b.check_out_date?.split('T')[0],
                b.total_amount,
                b.status
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Booking_Report.csv';
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Reports</h1>
                        <p className="text-gray-500 mt-2 text-sm">Detailed list of all reservations and guest activity.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Booking Activity Report</h1>
                    <p className="text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 print-hide">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiFilter /> Report Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" placeholder="Search reference or guest..." className="input-field" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
                        <select className="input-field" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                            <option value="">All Statuses</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                        <select className="input-field" value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                            <option value="all">All Time</option>
                            <option value="this_month">This Month</option>
                            <option value="last_month">Last Month</option>
                        </select>
                        <div className="flex gap-2">
                            <button onClick={handlePrint} className="flex-1 btn-primary flex items-center justify-center gap-2"><FiPrinter/> Print</button>
                            <button onClick={exportCSV} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"><FiDownload/> CSV</button>
                        </div>
                    </div>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Guest</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.bookings?.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.booking_reference}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={b.property_title}>{b.property_title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{b.guest_first_name} {b.guest_last_name}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {b.check_in_date?.split('T')[0]} <br/>to {b.check_out_date?.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">{b.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right print-text-black">
                                            ${parseFloat(b.total_amount || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.bookings || data.bookings.length === 0) && (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No bookings match the filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingReports;
