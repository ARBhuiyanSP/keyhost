import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiPrinter, FiDownload, FiDollarSign } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const FinancialReports = ({ userRole }) => {
    const [filters, setFilters] = useState({ dateRange: 'this_month' });

    // Assuming we fetch from analytics or specific financial endpoint
    const endpoint = userRole === 'admin' ? '/admin/dashboard' : '/property-owner/analytics?days=30';

    const { data, isLoading } = useQuery(
        [`${userRole}-financial-reports`, filters],
        () => api.get(endpoint).then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => window.print();

    // Map stats appropriately based on what endpoint responds with
    const stats = userRole === 'admin' ? data?.statistics : data;
    const gross = stats?.totalRevenue || stats?.totalEarnings || 0;
    const expense = gross * (userRole === 'admin' ? 0.05 : 0.10); // Simulated expenses/charges
    const net = gross - expense;

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
                        <p className="text-gray-500 mt-2 text-sm">Income, expenses, and service charge records.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Financial Statement</h1>
                    <p className="text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 print-hide flex gap-4">
                    <select className="input-field max-w-xs" value={filters.dateRange} onChange={(e) => setFilters({dateRange: e.target.value})}>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_year">This Year</option>
                    </select>
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2"><FiPrinter/> Print Report</button>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 print:border-gray-300">
                                <p className="text-sm font-bold text-emerald-800 uppercase">Gross Income</p>
                                <h3 className="text-4xl font-black text-emerald-900 mt-2">${gross.toLocaleString()}</h3>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl border border-red-100 print:border-gray-300">
                                <p className="text-sm font-bold text-red-800 uppercase">Service Charges (EST.)</p>
                                <h3 className="text-4xl font-black text-red-900 mt-2">-${expense.toLocaleString()}</h3>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 print:border-gray-300">
                                <p className="text-sm font-bold text-blue-800 uppercase">Net Income</p>
                                <h3 className="text-4xl font-black text-blue-900 mt-2">${net.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Ledger Summary</h3></div>
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-gray-50">
                                    <tr><td className="px-6 py-4 font-medium">Total Bookings Recorded</td><td className="px-6 py-4 text-right font-bold">{stats?.totalBookings || 0}</td></tr>
                                    <tr><td className="px-6 py-4 font-medium">Platform Processed (Gross)</td><td className="px-6 py-4 text-right font-bold text-emerald-600">${gross.toLocaleString()}</td></tr>
                                    <tr><td className="px-6 py-4 font-medium">Operational/Service Fee Deductions</td><td className="px-6 py-4 text-right font-bold text-red-500">-${expense.toLocaleString()}</td></tr>
                                    <tr className="bg-gray-50"><td className="px-6 py-4 font-bold uppercase text-gray-900">Final Settled (Net)</td><td className="px-6 py-4 text-right font-black text-blue-600 text-xl">${net.toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReports;
