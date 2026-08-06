import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Deductions = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', amount_type: 'fixed', amount: '' });

    const { data: deductions, isLoading } = useQuery('hms-deductions', () => 
        api.get('/hms/hr/deductions').then(res => res.data?.data?.deductions || [])
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hms/hr/deductions', formData);
            showSuccess('Deduction created');
            setShowForm(false);
            queryClient.invalidateQueries('hms-deductions');
        } catch (error) {
            showError('Failed to create deduction');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Deductions</h1>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 bg-rose-600">
                    <FiPlus /> Add Deduction
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="3" className="text-center py-10"><LoadingSpinner /></td></tr>
                        ) : deductions?.map(d => (
                            <tr key={d.id}>
                                <td className="px-6 py-4 font-medium">{d.name}</td>
                                <td className="px-6 py-4 capitalize">{d.amount_type}</td>
                                <td className="px-6 py-4 text-rose-600">{d.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Deduction</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Type</label>
                                <select value={formData.amount_type} onChange={e => setFormData({...formData, amount_type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="fixed">Fixed Amount</option>
                                    <option value="percentage">Percentage of Basic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Amount</label>
                                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold">Save Deduction</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deductions;
