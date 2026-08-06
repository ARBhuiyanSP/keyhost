import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiPieChart, FiPlus, FiList } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { useQuery } from 'react-query';

const AccountsDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Fetch properties
    const { data: properties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    // Property selection is handled by state initialization to '' (All Properties)
    
    useEffect(() => {
        if (selectedPropertyId !== undefined) {
            fetchSummary();
        }
    }, [dateRange, selectedPropertyId]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await api.get('/hms/accounts/reports/summary', { 
                params: { ...dateRange, property_id: selectedPropertyId } 
            });
            if (res.data.success) {
                setSummary(res.data.data);
            }
        } catch (error) {
            showError('Failed to load accounts summary');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !summary) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-gray-100 pb-5 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Accounts Overview</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Financial performance and statements summary.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedPropertyId || ''}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm w-full sm:w-[240px] truncate"
                    >
                        <option value="">All Properties</option>
                        {properties?.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input 
                            type="date" 
                            value={dateRange.startDate} 
                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm w-full"
                        />
                        <span className="text-gray-400 font-bold text-xs">to</span>
                        <input 
                            type="date" 
                            value={dateRange.endDate} 
                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                            className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Income</p>
                            <h3 className="text-3xl font-bold text-emerald-600 mt-1">
                                {summary?.totalIncome?.toLocaleString()} BDT
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Expense</p>
                            <h3 className="text-3xl font-bold text-rose-600 mt-1">
                                {summary?.totalExpense?.toLocaleString()} BDT
                            </h3>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                            <FiTrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Net Profit/Loss</p>
                            <h3 className={`text-3xl font-bold mt-1 ${summary?.netProfit >= 0 ? 'text-blue-600' : 'text-rose-700'}`}>
                                {summary?.netProfit?.toLocaleString()} BDT
                            </h3>
                        </div>
                        <div className={`p-3 rounded-lg ${summary?.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-700'}`}>
                            <span className="w-6 h-6 flex items-center justify-center font-black text-xl select-none leading-none">৳</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <FiTrendingUp className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Income Sources</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">REVENUE</span>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {summary?.incomeBreakdown?.length > 0 ? (
                                summary.incomeBreakdown.map((item, idx) => (
                                    <div key={idx} className="group flex justify-between items-center p-4 rounded-xl border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></div>
                                            <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-900">৳ {parseFloat(item.amount).toLocaleString()}</span>
                                            <div className="text-[10px] text-gray-400 font-medium">Total Earned</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                        <FiTrendingUp size={24} />
                                    </div>
                                    <p className="text-sm text-gray-400">No income records available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                <FiTrendingDown className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Expense Categories</h4>
                        </div>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">OUTFLOW</span>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {summary?.expenseBreakdown?.length > 0 ? (
                                summary.expenseBreakdown.map((item, idx) => (
                                    <div key={idx} className="group flex justify-between items-center p-4 rounded-xl border border-gray-50 hover:border-rose-100 hover:bg-rose-50/30 transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-400 group-hover:scale-125 transition-transform"></div>
                                            <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-900">৳ {parseFloat(item.amount).toLocaleString()}</span>
                                            <div className="text-[10px] text-gray-400 font-medium">Total Spent</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                        <FiTrendingDown size={24} />
                                    </div>
                                    <p className="text-sm text-gray-400">No expense records available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FiPlus className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Accounting Operations</h4>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link 
                        to="/property-owner/hms/accounts/vouchers" 
                        state={{ type: 'receipt' }}
                        className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <FiPlus className="w-6 h-6 text-emerald-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">Record Income</span>
                        <p className="text-[10px] text-gray-400 mt-1">Add receipt voucher</p>
                    </Link>
                    <Link 
                        to="/property-owner/hms/accounts/vouchers" 
                        state={{ type: 'payment' }}
                        className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                            <FiPlus className="w-6 h-6 text-rose-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-rose-700">Record Expense</span>
                        <p className="text-[10px] text-gray-400 mt-1">Add payment voucher</p>
                    </Link>
                    <Link 
                        to="/property-owner/hms/accounts/transactions" 
                        className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <FiList className="w-6 h-6 text-blue-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700">Ledger Book</span>
                        <p className="text-[10px] text-gray-400 mt-1">View all transactions</p>
                    </Link>
                    <button className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <FiPieChart className="w-6 h-6 text-indigo-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-700">Trial Balance</span>
                        <p className="text-[10px] text-gray-400 mt-1">Financial statements</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountsDashboard;
