import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiPrinter } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { useQuery } from 'react-query';

const Vouchers = () => {
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const [heads, setHeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        type: location.state?.type || 'payment',
        date: new Date().toISOString().split('T')[0],
        remarks: '',
        total_amount: 0,
        property_id: '',
        items: [{ head_id: '', amount: '', description: '' }]
    });

    // Fetch properties
    const { data: properties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    useEffect(() => {
        if (properties?.length > 0 && !formData.property_id) {
            setFormData(prev => ({ ...prev, property_id: properties[0].id }));
        }
    }, [properties]);

    useEffect(() => {
        if (location.state?.type) {
            setFormData(prev => ({ ...prev, type: location.state.type }));
        }
        fetchHeads();
    }, [location.state]);

    const fetchHeads = async () => {
        try {
            const res = await api.get('/hms/accounts/heads');
            if (res.data.success) {
                setHeads(res.data.data.heads);
            }
        } catch (error) {
            showError('Failed to load account heads');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { head_id: '', amount: '', description: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        
        // Calculate total
        const total = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        setFormData({ ...formData, items: newItems, total_amount: total });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.items.some(item => !item.head_id || !item.amount)) {
            return showError('Please fill all item details');
        }

        try {
            setSaving(true);
            const res = await api.post('/hms/accounts/vouchers', formData);
            if (res.data.success) {
                showSuccess('Voucher recorded successfully');
                setFormData({
                    type: 'payment',
                    date: new Date().toISOString().split('T')[0],
                    remarks: '',
                    total_amount: 0,
                    items: [{ head_id: '', amount: '', description: '' }]
                });
            }
        } catch (error) {
            showError('Failed to record voucher');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Voucher Entry</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-50">
                        <FiPrinter /> Print History
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 border-b border-gray-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Property / Hotel</label>
                        <select 
                            value={formData.property_id}
                            onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            required
                        >
                            <option value="">Select Property</option>
                            {properties?.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Voucher Type</label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        >
                            <option value="payment">Cash/Bank Payment (Expense)</option>
                            <option value="receipt">Cash/Bank Receipt (Income)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                        <input 
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Amount</label>
                        <div className="px-4 py-2.5 bg-white border rounded-lg font-black text-lg text-gray-800">
                            {formData.total_amount.toLocaleString()} BDT
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="pb-4 pr-4">Account Head</th>
                                <th className="pb-4 pr-4">Description</th>
                                <th className="pb-4 pr-4 w-40">Amount</th>
                                <th className="pb-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {formData.items.map((item, index) => (
                                <tr key={index} className="group">
                                    <td className="pr-4 pb-2">
                                        <select 
                                            value={item.head_id}
                                            onChange={(e) => handleItemChange(index, 'head_id', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-2 text-sm"
                                        >
                                            <option value="">Select Head</option>
                                            {heads.filter(h => h.type === (formData.type === 'payment' ? 'expense' : 'income')).map(h => (
                                                <option key={h.id} value={h.id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="pr-4 pb-2">
                                        <input 
                                            type="text"
                                            placeholder="Particulars..."
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-2 text-sm"
                                        />
                                    </td>
                                    <td className="pr-4 pb-2">
                                        <input 
                                            type="number"
                                            placeholder="0.00"
                                            value={item.amount}
                                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-2 text-sm font-bold"
                                        />
                                    </td>
                                    <td className="pb-2">
                                        {formData.items.length > 1 && (
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-gray-300 hover:text-rose-500"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button 
                        type="button"
                        onClick={handleAddItem}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                        <FiPlus /> Add Line Item
                    </button>

                    <div className="mt-8 border-t pt-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Remarks / Note</label>
                        <textarea 
                            rows="3"
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                            placeholder="Add any additional notes here..."
                            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t flex justify-end">
                    <button 
                        type="submit"
                        disabled={saving}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {saving ? 'Saving...' : <><FiSave /> Save Voucher</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Vouchers;
