import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiPrinter, FiDollarSign } from 'react-icons/fi';
import api from '../../../utils/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const PayoutReports = () => {
    // Admin Only endpoint for owner payouts records
    const { data: payouts, isLoading } = useQuery(
        ['admin-payout-reports'],
        () => api.get('/admin/owner-payouts/balances').then(res => res.data.data),
        { refetchOnWindowFocus: false }
    );

    const handlePrint = () => window.print();

    // Map through the payload (since owner-payouts/balances returns a list of owners with balances)
    const owners = payouts?.owners || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
            <div className="bg-white px-8 py-8 border-b border-gray-200 print-hide">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payout History</h1>
                        <p className="text-gray-500 mt-2 text-sm">Monitor cleared and pending properties owner payouts.</p>
                    </div>
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2"><FiPrinter/> Print Statement</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8 print:px-0 print:py-0">
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider">Payout Reconciliation Report</h1>
                    <p className="text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-6 py-4">Owner Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Total Earned</th>
                                    <th className="px-6 py-4 text-right">Current Balance Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {owners.length > 0 ? owners.map((o, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4 font-bold text-gray-900">{o.first_name} {o.last_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{o.email}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-emerald-600">${parseFloat(o.total_earned||0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 print-text-black">${parseFloat(o.balance||0).toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No owner payout records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayoutReports;
