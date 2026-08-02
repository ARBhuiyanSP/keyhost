import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
    FiCheckCircle, FiClock, FiAlertCircle, FiUser, FiInfo, 
    FiHome, FiFilter, FiSearch, FiEdit, FiPlus, FiTrash2, FiActivity
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_OPTIONS = [
    { value: 'dirty', label: 'Dirty', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { value: 'cleaning', label: 'Cleaning', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'clean', label: 'Clean', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'inspected', label: 'Inspected', color: 'bg-blue-100 text-blue-700 border-blue-200' }
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-rose-100 text-rose-700' }
];

const HMSHousekeeping = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    
    const [formData, setFormData] = useState({
        room_id: '',
        staff_id: '',
        priority: 'medium',
        notes: ''
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
        if (properties?.length > 0) {
            const savedId = localStorage.getItem('hms_selected_property_id');
            const parsedSavedId = savedId ? parseInt(savedId) : null;
            const exists = properties.some(p => p.id === parsedSavedId);
            
            if (exists && parsedSavedId) {
                setSelectedPropertyId(parsedSavedId);
            } else {
                setSelectedPropertyId(properties[0].id);
                localStorage.setItem('hms_selected_property_id', properties[0].id);
                localStorage.setItem('hms_selected_property_type', properties[0].property_type || 'hotel');
            }
        }
    }, [properties]);

    useEffect(() => {
        const handlePropertyChange = () => {
            const savedId = localStorage.getItem('hms_selected_property_id');
            if (savedId) {
                setSelectedPropertyId(parseInt(savedId));
            }
        };
        window.addEventListener('hmsPropertyChange', handlePropertyChange);
        return () => window.removeEventListener('hmsPropertyChange', handlePropertyChange);
    }, []);

    const handlePropertyChange = (val) => {
        const newId = parseInt(val);
        setSelectedPropertyId(newId);
        localStorage.setItem('hms_selected_property_id', newId);
        const prop = properties?.find(p => p.id === newId);
        if (prop) {
            localStorage.setItem('hms_selected_property_type', prop.property_type || 'hotel');
            window.dispatchEvent(new Event('hmsPropertyChange'));
        }
    };

    const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
    const propertyType = selectedProperty?.property_type || 'hotel';

    const getTerminology = (propType) => {
        const type = (propType || '').toLowerCase();
        if (type.includes('apartment') || type.includes('flat') || type.includes('building')) {
            return {
                room: 'Flat',
                rooms: 'Flats',
                roomNo: 'Flat No.',
                roomType: 'Flat Type',
                roomSingular: 'flat',
                housekeeping: 'Cleaning & Maintenance'
            };
        } else if (type.includes('villa') || type.includes('house') || type.includes('resort')) {
            return {
                room: 'Unit',
                rooms: 'Units',
                roomNo: 'Unit No.',
                roomType: 'Unit Type',
                roomSingular: 'unit',
                housekeeping: 'Housekeeping'
            };
        }
        return {
            room: 'Room',
            rooms: 'Rooms',
            roomNo: 'Room No.',
            roomType: 'Room Type',
            roomSingular: 'room',
            housekeeping: 'Housekeeping'
        };
    };
    
    const terms = getTerminology(propertyType);

    // Fetch tasks
    const { data: tasks, isLoading: loadingTasks } = useQuery(
        ['hms-housekeeping', selectedPropertyId],
        () => api.get(`/property-owner/hms-mgmt/housekeeping/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.tasks || []
        }
    );

    // Fetch rooms for dropdown
    const { data: rooms } = useQuery(
        ['hms-rooms', selectedPropertyId],
        () => api.get(`/property-owner/hms/rooms/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.rooms || []
        }
    );

    // Fetch staff for dropdown from HR module
    const { data: staff } = useQuery(
        ['hms-hr-employees', selectedPropertyId],
        () => api.get('/hms/hr/employees'),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.employees?.filter(s => 
                s.status === 'active' && 
                (s.designation_name?.toLowerCase().includes('housekeeping') || s.role === 'housekeeping')
            ) || []
        }
    );

    const updateTaskMutation = useMutation(
        ({ id, ...data }) => api.put(`/property-owner/hms-mgmt/housekeeping/${id}`, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-housekeeping', selectedPropertyId]);
                showSuccess('Task updated');
                setShowTaskModal(false);
                setEditingTask(null);
            },
            onError: () => showError('Failed to update task')
        }
    );

    const addTaskMutation = useMutation(
        (data) => api.post('/property-owner/hms-mgmt/housekeeping', { ...data, property_id: selectedPropertyId }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-housekeeping', selectedPropertyId]);
                showSuccess('Task assigned');
                setShowTaskModal(false);
            },
            onError: () => showError('Failed to assign task')
        }
    );

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                room_id: task.room_id,
                staff_id: task.staff_id || '',
                priority: task.priority,
                notes: task.notes || '',
                status: task.status
            });
        } else {
            setEditingTask(null);
            setFormData({
                room_id: '',
                staff_id: '',
                priority: 'medium',
                notes: ''
            });
        }
        setShowTaskModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, ...formData });
        } else {
            addTaskMutation.mutate(formData);
        }
    };

    const filteredTasks = (tasks || []).filter(t => !statusFilter || t.status === statusFilter);

    const stats = {
        total: tasks?.length || 0,
        dirty: tasks?.filter(t => t.status === 'dirty').length || 0,
        cleaning: tasks?.filter(t => t.status === 'cleaning').length || 0,
        clean: tasks?.filter(t => t.status === 'clean').length || 0
    };

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FiActivity className="mr-3 text-primary-600" />
                            {terms.housekeeping} Management
                        </h1>
                        <p className="text-gray-500 mt-1">Monitor and manage {terms.roomSingular} cleaning tasks.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <select
                            value={selectedPropertyId || ''}
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm w-full sm:w-auto max-w-full sm:max-w-[320px] md:max-w-[420px] truncate"
                        >
                            {properties?.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 font-semibold w-full sm:w-auto whitespace-nowrap"
                        >
                            <FiPlus className="w-5 h-5" />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-xs md:text-sm font-medium mb-1">Total Tasks</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-rose-500 text-xs md:text-sm font-medium mb-1">Dirty</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.dirty}</div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-amber-500 text-xs md:text-sm font-medium mb-1">Cleaning</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.cleaning}</div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-green-500 text-xs md:text-sm font-medium mb-1">Clean/Inspected</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.clean}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex items-center gap-4 border border-gray-100">
                    <div className="relative w-full sm:w-auto">
                        <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-11 pr-8 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm cursor-pointer appearance-none w-full sm:min-w-[200px]"
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loadingTasks ? (
                    <div className="py-20 text-center"><LoadingSpinner size="large" /></div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-bold">{terms.room}</th>
                                        <th className="px-6 py-4 text-sm font-bold">Staff</th>
                                        <th className="px-6 py-4 text-sm font-bold">Priority</th>
                                        <th className="px-6 py-4 text-sm font-bold">Status</th>
                                        <th className="px-6 py-4 text-sm font-bold">Last Updated</th>
                                        <th className="px-6 py-4 text-sm font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-gray-50 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{terms.room} {task.room_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.staff_first_name ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                                                            {task.staff_first_name[0]}{task.staff_last_name ? task.staff_last_name[0] : ''}
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {task.staff_first_name} {task.staff_last_name || ''}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_OPTIONS.find(s => s.value === task.status)?.color}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(task.updated_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleOpenModal(task)}
                                                    className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <FiActivity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                                <p className="text-gray-500 font-medium">No housekeeping tasks found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="space-y-4 md:hidden">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 text-lg">
                                                {terms.room} {task.room_number}
                                            </span>
                                            <button 
                                                onClick={() => handleOpenModal(task)}
                                                className="p-2 hover:bg-primary-50 text-primary-600 rounded-xl transition-colors border border-gray-100"
                                            >
                                                <FiEdit className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-1 border-t border-b border-gray-50 my-2">
                                            <div>
                                                <span className="text-xs text-gray-400 block mb-1">Status</span>
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_OPTIONS.find(s => s.value === task.status)?.color}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-400 block mb-1">Priority</span>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${PRIORITY_OPTIONS.find(p => p.value === task.priority)?.color}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {task.staff_first_name ? (
                                                    <>
                                                        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                                                            {task.staff_first_name[0]}{task.staff_last_name ? task.staff_last_name[0] : ''}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-400">Assigned Staff</span>
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {task.staff_first_name} {task.staff_last_name || ''}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-400">Assigned Staff</span>
                                                        <span className="text-gray-400 text-sm italic">Unassigned</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400 block">Last Updated</span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {new Date(task.updated_at).toLocaleDateString()} {new Date(task.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                                    <FiActivity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">No housekeeping tasks found</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 bg-primary-600 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold">
                                {editingTask ? 'Update Task' : `New ${terms.room} Cleaning Task`}
                            </h2>
                            <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <FiPlus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
                            {!editingTask && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select {terms.room} *</label>
                                    <select
                                        required
                                        value={formData.room_id}
                                        onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all"
                                    >
                                        <option value="">Choose a {terms.roomSingular}...</option>
                                        {rooms?.map(r => (
                                            <option key={r.id} value={r.id}>{terms.room} {r.room_number} ({r.room_type})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Assign Staff</label>
                                <select
                                    value={formData.staff_id}
                                    onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all"
                                >
                                    <option value="">Unassigned</option>
                                    {staff?.map(s => (
                                        <option key={s.id} value={s.id}>{s.name || `${s.first_name} ${s.last_name}`}</option>
                                    ))}
                                </select>
                            </div>

                            {editingTask && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STATUS_OPTIONS.map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => setFormData({...formData, status: s.value})}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${formData.status === s.value ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20' : 'bg-white text-gray-600 border-gray-100 hover:border-primary-200'}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all"
                                >
                                    {PRIORITY_OPTIONS.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 outline-none transition-all h-24 resize-none"
                                    placeholder="Add instructions or details..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25"
                                >
                                    {editingTask ? 'Update Task' : 'Assign Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSHousekeeping;
