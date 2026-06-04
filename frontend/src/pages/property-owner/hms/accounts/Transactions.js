import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiArrowUpRight, FiArrowDownLeft, FiSearch } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { useQuery } from 'react-query';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch properties
    const { data: properties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    useEffect(() => {
        if (properties?.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(properties[0].id);
        }
    }, [properties]);

    useEffect(() => {
        fetchTransactions();
    }, [selectedPropertyId]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/hms/accounts/vouchers', {
                params: { property_id: selectedPropertyId }
            });
            if (res.data.success) {
                setTransactions(res.data.data.vouchers);
            }
        } catch (error) {
            showError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => 
        t.voucher_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
                    <p className="text-sm text-gray-500">View all income and expense vouchers</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedPropertyId || ''}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white font-bold outline-none"
                    >
                        <option value="">All Properties</option>
                        {properties?.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200">
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by voucher no or remarks..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Voucher No</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Remarks</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-blue-600">{t.voucher_no}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            t.type === 'receipt' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {t.type === 'receipt' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                                            {t.type === 'receipt' ? 'Income' : 'Expense'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 italic">
                                        {t.remarks || '---'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-800">
                                        {t.total_amount.toLocaleString()} BDT
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredTransactions.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-medium">No transactions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
