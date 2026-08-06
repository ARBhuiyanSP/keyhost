import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiAward, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Designations = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingDesig, setEditingDesig] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });

    const { data: designations, isLoading } = useQuery('hms-designations', () => 
        api.get('/hms/hr/designations').then(res => res.data?.data?.designations || [])
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDesig) {
                await api.put(`/hms/hr/designations/${editingDesig.id}`, formData);
                showSuccess('Designation updated');
            } else {
                await api.post('/hms/hr/designations', formData);
                showSuccess('Designation created');
            }
            setShowForm(false);
            setEditingDesig(null);
            setFormData({ name: '', description: '', status: 'active' });
            queryClient.invalidateQueries('hms-designations');
        } catch (error) {
            showError('Operation failed');
        }
    };

    const handleEdit = (desig) => {
        setEditingDesig(desig);
        setFormData({ name: desig.name, description: desig.description || '', status: desig.status });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this designation?')) return;
        try {
            await api.delete(`/hms/hr/designations/${id}`);
            showSuccess('Designation deleted');
            queryClient.invalidateQueries('hms-designations');
        } catch (error) {
            showError('Delete failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Designations</h1>
                <button onClick={() => { setEditingDesig(null); setFormData({ name: '', description: '', status: 'active' }); setShowForm(true); }} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add Designation
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="4" className="py-10 text-center"><LoadingSpinner /></td></tr>
                        ) : designations?.length > 0 ? designations.map(desig => (
                            <tr key={desig.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-800">{desig.name}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{desig.description || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${desig.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {desig.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(desig)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(desig.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="py-10 text-center text-gray-400">No designations found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingDesig ? 'Edit' : 'Add'} Designation</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full btn-primary py-3 rounded-xl font-bold">Save Designation</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Designations;
