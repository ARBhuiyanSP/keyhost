import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiPrinter, FiActivity } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const PropertyPerformance = ({ userRole }) => {
    // For Property Performance, we can use analytics endpoints
    const endpoint = userRole === 'admin' ? '/admin/dashboard' : '/property-owner/analytics?days=365';
    
    const { data, isLoading } = useQuery(
        [`${userRole}-performance-reports`],
        () => api.get(endpoint).then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => window.print();

    // Map stats appropriately
    const properties = userRole === 'admin' ? [] : (data?.topProperties || []);
    // Note: If admin lacks a direct "topProperties" array, we mock or map what's available just for interface demonstration 
    // unless there is a specific endpoint provided.

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Property Performance</h1>
                        <p className="text-gray-500 mt-2 text-sm">See how many days properties were booked.</p>
                    </div>
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2"><FiPrinter/> Print Report</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Property Performance Log</h1>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Property Name</th>
                                    <th className="px-6 py-4">Total Bookings</th>
                                    <th className="px-6 py-4 text-right">Yield Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {properties.length > 0 ? properties.map((p, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4 font-bold text-gray-900">{p.title}</td>
                                        <td className="px-6 py-4 text-gray-600">{p.bookings} confirmed bookings</td>
                                        <td className="px-6 py-4 text-right font-medium text-green-600">${parseFloat(p.revenue||0).toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-400">Detailed property performance records will generate here.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyPerformance;
