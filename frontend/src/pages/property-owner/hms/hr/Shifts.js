import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { FiClock, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Shifts = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [formData, setFormData] = useState({ name: '', start_time: '', end_time: '', status: 'active' });

    const { data: shifts, isLoading } = useQuery('hms-shifts', () => 
        api.get('/hms/hr/shifts').then(res => res.data?.data?.shifts || [])
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await api.put(`/hms/hr/shifts/${editingShift.id}`, formData);
                showSuccess('Shift updated');
            } else {
                await api.post('/hms/hr/shifts', formData);
                showSuccess('Shift created');
            }
            setShowForm(false);
            setEditingShift(null);
            queryClient.invalidateQueries('hms-shifts');
        } catch (error) {
            showError('Operation failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
                <button onClick={() => { setEditingShift(null); setFormData({ name: '', start_time: '', end_time: '', status: 'active' }); setShowForm(true); }} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add Shift
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <LoadingSpinner />
                ) : shifts?.map(shift => (
                    <div key={shift.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{shift.name}</h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <FiClock /> {shift.start_time} - {shift.end_time}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingShift(shift); setFormData({...shift}); setShowForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingShift ? 'Edit' : 'Add'} Shift</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Start Time</label>
                                    <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">End Time</label>
                                    <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn-primary py-3 rounded-xl font-bold">Save Shift</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shifts;
