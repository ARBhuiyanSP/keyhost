import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiDollarSign, FiPlus, FiPrinter, FiCheckCircle, FiMinus, FiPlusCircle, FiX, FiLayers, FiCreditCard } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Payroll = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    const [formData, setFormData] = useState({
        employee_id: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        basic_salary: 0,
        total_allowance: 0,
        total_deduction: 0,
        net_salary: 0,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'pending'
    });

    const [bulkData, setBulkData] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        payment_date: new Date().toISOString().split('T')[0],
    });

    const [selectedAllowances, setSelectedAllowances] = useState([]);
    const [selectedDeductions, setSelectedDeductions] = useState([]);

    const { data: payrolls, isLoading } = useQuery('hms-payrolls', () => 
        api.get('/hms/hr/payrolls').then(res => res.data?.data?.payrolls || [])
    );

    const { data: employees } = useQuery('hms-employees', () => 
        api.get('/hms/hr/employees').then(res => res.data?.data?.employees || [])
    );

    const { data: allowances } = useQuery('hms-allowances', () => 
        api.get('/hms/hr/allowances').then(res => res.data?.data?.allowances || [])
    );

    const { data: deductions } = useQuery('hms-deductions', () => 
        api.get('/hms/hr/deductions').then(res => res.data?.data?.deductions || [])
    );

    useEffect(() => {
        const totalA = selectedAllowances.reduce((acc, curr) => {
            if (curr.amount_type === 'fixed') return acc + parseFloat(curr.amount || 0);
            return acc + (parseFloat(formData.basic_salary || 0) * parseFloat(curr.amount || 0) / 100);
        }, 0);

        const totalD = selectedDeductions.reduce((acc, curr) => {
            if (curr.amount_type === 'fixed') return acc + parseFloat(curr.amount || 0);
            return acc + (parseFloat(formData.basic_salary || 0) * parseFloat(curr.amount || 0) / 100);
        }, 0);

        setFormData(prev => ({
            ...prev,
            total_allowance: totalA,
            total_deduction: totalD,
            net_salary: parseFloat(prev.basic_salary || 0) + totalA - totalD
        }));
    }, [selectedAllowances, selectedDeductions, formData.basic_salary]);

    const handleEmployeeChange = (empId) => {
        const emp = employees.find(e => e.id === parseInt(empId));
        if (emp) {
            setFormData({
                ...formData,
                employee_id: empId,
                basic_salary: emp.salary,
            });
        }
    };

    const toggleAllowance = (allowance) => {
        if (selectedAllowances.find(a => a.id === allowance.id)) {
            setSelectedAllowances(selectedAllowances.filter(a => a.id !== allowance.id));
        } else {
            setSelectedAllowances([...selectedAllowances, allowance]);
        }
    };

    const toggleDeduction = (deduction) => {
        if (selectedDeductions.find(d => d.id === deduction.id)) {
            setSelectedDeductions(selectedDeductions.filter(d => d.id !== deduction.id));
        } else {
            setSelectedDeductions([...selectedDeductions, deduction]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.employee_id) return showError('Please select an employee');
        try {
            await api.post('/hms/hr/payrolls', {
                ...formData,
                allowances: selectedAllowances,
                deductions: selectedDeductions
            });
            showSuccess('Payroll generated successfully');
            setShowForm(false);
            resetForm();
            queryClient.invalidateQueries('hms-payrolls');
        } catch (error) {
            showError('Failed to generate payroll');
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hms/hr/payrolls/bulk', {
                ...bulkData,
                allowances: selectedAllowances,
                deductions: selectedDeductions
            });
            showSuccess('Bulk payroll generated successfully');
            setShowBulkModal(false);
            resetForm();
            queryClient.invalidateQueries('hms-payrolls');
        } catch (error) {
            showError('Bulk generation failed');
        }
    };

    const handlePaymentSubmit = async () => {
        try {
            await api.patch(`/hms/hr/payrolls/${selectedPayroll.id}/status`, { 
                status: 'paid',
                payment_date: new Date().toISOString().split('T')[0]
            });
            showSuccess('Payment recorded successfully');
            setShowPaymentModal(false);
            setSelectedPayroll(null);
            queryClient.invalidateQueries('hms-payrolls');
        } catch (error) {
            showError('Failed to update payment status');
        }
    };

    const resetForm = () => {
        setFormData({
            employee_id: '',
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear(),
            basic_salary: 0,
            total_allowance: 0,
            total_deduction: 0,
            net_salary: 0,
            payment_date: new Date().toISOString().split('T')[0],
            status: 'pending'
        });
        setSelectedAllowances([]);
        setSelectedDeductions([]);
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
                    <p className="text-sm text-gray-500">Generate and manage employee salaries</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { resetForm(); setShowBulkModal(true); }} className="btn-outline flex items-center gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                        <FiLayers /> Bulk Generate
                    </button>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 bg-[#004D40] hover:bg-[#003d33]">
                        <FiPlus /> Generate Payroll
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#CFD8DC] text-[#455A64] text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Month/Year</th>
                            <th className="px-6 py-4">Basic Salary</th>
                            <th className="px-6 py-4 text-emerald-600">Allowance</th>
                            <th className="px-6 py-4 text-red-600">Deduction</th>
                            <th className="px-6 py-4">Net Salary</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="8" className="py-10 text-center"><LoadingSpinner /></td></tr>
                        ) : payrolls?.length > 0 ? payrolls.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 text-sm">
                                <td className="px-6 py-4 font-semibold text-gray-800">{p.employee_name}</td>
                                <td className="px-6 py-4 text-gray-600">{p.month} {p.year}</td>
                                <td className="px-6 py-4 text-gray-600">৳{p.basic_salary?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-emerald-600">+৳{p.total_allowance?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-red-600">-৳{p.total_deduction?.toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">৳{p.net_salary?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {p.status === 'pending' ? (
                                        <button 
                                            onClick={() => { setSelectedPayroll(p); setShowPaymentModal(true); }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 mx-auto"
                                        >
                                            <FiCheckCircle size={14} /> Pay Now
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-[10px] text-gray-400">
                                            <FiCheckCircle className="text-emerald-500" size={16} />
                                            <span>Paid on {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="py-10 text-center text-gray-400">No payroll records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payment Confirmation Modal */}
            {showPaymentModal && selectedPayroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F0FDF4]">
                            <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                                <FiCreditCard className="text-emerald-600" /> Confirm Payment
                            </h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiDollarSign className="text-emerald-600 text-4xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedPayroll.employee_name}</h3>
                            <p className="text-sm text-gray-500 mb-6">Payroll for {selectedPayroll.month} {selectedPayroll.year}</p>
                            
                            <div className="bg-gray-50 rounded-xl p-4 mb-8">
                                <span className="text-xs uppercase text-gray-400 font-bold block mb-1">Total Payable Amount</span>
                                <span className="text-3xl font-black text-[#004D40]">৳{selectedPayroll.net_salary?.toLocaleString()}</span>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handlePaymentSubmit}
                                    className="flex-1 px-6 py-3 bg-[#004D40] text-white rounded-xl font-bold hover:bg-[#003d33] shadow-lg shadow-emerald-200 transition-all transform active:scale-95"
                                >
                                    Confirm & Pay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Generate Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC] sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiLayers className="text-emerald-600" /> Bulk Generate Payroll
                            </h2>
                            <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleBulkSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Select Month</label>
                                    <select 
                                        value={bulkData.month} 
                                        onChange={e => setBulkData({...bulkData, month: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                                    >
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Year</label>
                                    <input 
                                        type="number" 
                                        value={bulkData.year} 
                                        onChange={e => setBulkData({...bulkData, year: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Payment Date</label>
                                    <input 
                                        type="date" 
                                        value={bulkData.payment_date} 
                                        onChange={e => setBulkData({...bulkData, payment_date: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Allowances */}
                                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <FiPlusCircle /> Common Allowances
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {allowances?.map(a => (
                                            <div 
                                                key={a.id} 
                                                onClick={() => toggleAllowance(a)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedAllowances.find(sa => sa.id === a.id) ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-emerald-200 text-gray-700 hover:border-emerald-400'}`}
                                            >
                                                <span className="text-sm font-medium">{a.name}</span>
                                                <span className="text-xs font-bold">{a.amount_type === 'fixed' ? `৳${a.amount}` : `${a.amount}%`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                    <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                                        <FiMinus /> Common Deductions
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {deductions?.map(d => (
                                            <div 
                                                key={d.id} 
                                                onClick={() => toggleDeduction(d)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedDeductions.find(sd => sd.id === d.id) ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-md' : 'bg-white border-red-200 text-gray-700 hover:border-red-400'}`}
                                            >
                                                <span className="text-sm font-medium">{d.name}</span>
                                                <span className="text-xs font-bold">{d.amount_type === 'fixed' ? `৳${d.amount}` : `${d.amount}%`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-[#004D40] hover:bg-[#003d33] text-white py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98] text-lg uppercase tracking-wider">
                                    Generate for All Staff
                                </button>
                                <p className="text-center text-[11px] text-gray-400 mt-3 italic">
                                    * The selected allowances and deductions will be applied to all employees.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiDollarSign className="text-emerald-600" /> Process Payroll
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Select Employee</label>
                                    <select required value={formData.employee_id} onChange={e => handleEmployeeChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50">
                                        <option value="">Choose Employee...</option>
                                        {employees?.map(e => <option key={e.id} value={e.id}>{e.name} (৳{e.salary})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Month</label>
                                    <select value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">
                                        {months.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Year</label>
                                    <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Allowances */}
                                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <FiPlusCircle /> Allowances
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {allowances?.map(a => (
                                            <div 
                                                key={a.id} 
                                                onClick={() => toggleAllowance(a)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedAllowances.find(sa => sa.id === a.id) ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-emerald-200 text-gray-700 hover:border-emerald-400'}`}
                                            >
                                                <span className="text-sm font-medium">{a.name}</span>
                                                <span className="text-xs font-bold">{a.amount_type === 'fixed' ? `৳${a.amount}` : `${a.amount}%`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                    <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                                        <FiMinus /> Deductions
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {deductions?.map(d => (
                                            <div 
                                                key={d.id} 
                                                onClick={() => toggleDeduction(d)}
                                                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedDeductions.find(sd => sd.id === d.id) ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-md' : 'bg-white border-red-200 text-gray-700 hover:border-red-400'}`}
                                            >
                                                <span className="text-sm font-medium">{d.name}</span>
                                                <span className="text-xs font-bold">{d.amount_type === 'fixed' ? `৳${d.amount}` : `${d.amount}%`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-[#101D2C] text-white p-6 rounded-2xl shadow-xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                    Salary Summary
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm opacity-80">
                                        <span>Basic Salary</span>
                                        <span>৳{formData.basic_salary?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-emerald-400">
                                        <span>Total Allowance (+)</span>
                                        <span>৳{formData.total_allowance?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-400">
                                        <span>Total Deduction (-)</span>
                                        <span>৳{formData.total_deduction?.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-lg font-bold uppercase tracking-wider">Net Salary</span>
                                        <span className="text-2xl font-black text-emerald-400">৳{formData.net_salary?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Payment Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Payment Date</label>
                                    <input type="date" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#004D40] hover:bg-[#003d33] text-white py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98] text-lg uppercase tracking-widest mt-4">
                                Generate and Record Payroll
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
