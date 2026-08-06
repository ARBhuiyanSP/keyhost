import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiTool, FiPlus, FiCalendar, FiDollarSign, FiClock, FiCheck, FiX, 
  FiFilter, FiTrash2, FiAlertCircle, FiSettings, FiActivity, FiBriefcase,
  FiRepeat, FiMapPin, FiChevronsRight
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

const TakaIcon = ({ className = "w-4 h-4" }) => (
  <span className={`${className} font-bold font-sans flex items-center justify-center select-none leading-none`} style={{ fontSize: '1.1em' }}>
    ৳
  </span>
);const SearchablePropertySelect = ({ properties, selectedId, onChange, className = "w-full sm:w-64", placeholder = "Select Property..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsSearching(false);
        // Restore search text to currently selected property on blur
        const selected = properties?.find(p => p.id === parseInt(selectedId));
        if (selected) {
          setSearch(selected.title);
        } else {
          setSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [properties, selectedId]);

  const selectedProperty = properties?.find(p => p.id === parseInt(selectedId));

  useEffect(() => {
    if (selectedProperty) {
      setSearch(selectedProperty.title);
    } else {
      setSearch('');
    }
    setIsSearching(false);
  }, [selectedId, selectedProperty]);

  const filteredProperties = isSearching
    ? (properties?.filter(p => 
        p.title?.toLowerCase().includes(search.toLowerCase()) || 
        p.city?.toLowerCase().includes(search.toLowerCase())
      ) || [])
    : (properties || []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select(); // Highlight all text on focus for easy typing
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setIsSearching(true);
          }}
          className="w-full bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b] pl-3 pr-10 py-2.5 transition-all shadow-xs cursor-pointer"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {search && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearch('');
                onChange('');
                setIsSearching(true);
                setIsOpen(true);
              }}
              className="text-gray-400 hover:text-gray-650 focus:outline-none p-0.5 rounded-full hover:bg-gray-100"
            >
              <FiX size={14} />
            </button>
          )}
          <span className="text-gray-450 pointer-events-none pr-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-250 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in divide-y divide-gray-50">
          {filteredProperties.length > 0 ? (
            <div className="py-1">
              {filteredProperties.map(p => {
                const isSelected = parseInt(selectedId) === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.id.toString());
                      setSearch(p.title);
                      setIsOpen(false);
                      setIsSearching(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#064e3b]/10 text-[#064e3b] font-bold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="truncate pr-2 flex-1">
                      <span className="font-semibold block truncate w-full text-left">{p.title}</span>
                      {p.city && <span className="text-[10px] text-gray-400 font-medium truncate block mt-0.5 text-left">{p.city}</span>}
                    </div>
                    {isSelected && (
                      <FiCheck size={14} className="text-[#064e3b] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-3 text-center text-xs text-gray-400 italic">
              No matching properties found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HMSMaintenance = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();
    
    // States
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('active'); // 'active' (scheduled/in_progress), 'history' (completed/cancelled), 'types' (service types)
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Service Type States
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeFormData, setTypeFormData] = useState({ name: '', description: '' });

    // Fetch service types
    const { data: serviceTypes, isLoading: isLoadingTypes } = useQuery(
        'hms-maintenance-types',
        () => api.get('/property-owner/hms/maintenance/types').then(res => res.data?.data?.types || [])
    );

    const defaultTaskTypes = [
        { value: 'pest_control', label: 'Pest Control' },
        { value: 'ac_servicing', label: 'AC Servicing & Repair' },
        { value: 'plumbing', label: 'Plumbing & Pipe Fixing' },
        { value: 'painting', label: 'Painting & Touch-up' },
        { value: 'electrical', label: 'Electrical & Wire Check' },
        { value: 'general_inspection', label: 'General Quality Inspection' }
    ];

    const taskTypes = React.useMemo(() => {
        if (!serviceTypes || serviceTypes.length === 0) {
            return defaultTaskTypes;
        }
        return serviceTypes.map(t => ({
            value: t.name,
            label: t.name
        }));
    }, [serviceTypes]);

    const [formData, setFormData] = useState({
        property_id: '',
        room_id: '',
        task_type: '',
        description: '',
        cost: '',
        status: 'scheduled',
        start_date: '',
        end_date: '',
        is_recurring: false,
        recurrence_interval: '',
        lock_room: true
    });

    // Reset Form
    const resetForm = (propId) => {
        const targetPropertyId = propId || selectedPropertyId || '';
        setFormData({
            property_id: targetPropertyId ? targetPropertyId.toString() : '',
            room_id: '',
            task_type: taskTypes?.[0]?.value || '',
            description: '',
            cost: '',
            status: 'scheduled',
            start_date: format(new Date(), 'yyyy-MM-dd'),
            end_date: format(new Date(), 'yyyy-MM-dd'),
            is_recurring: false,
            recurrence_interval: '90',
            lock_room: true
        });
        setEditingTask(null);
    };

    // Fetch properties
    const { data: properties, isLoading: isLoadingProperties } = useQuery(
        'hms-properties',
        () => api.get('/property-owner/properties').then(res => res.data?.data?.properties?.filter(p => p.is_hms_enabled) || [])
    );

    // Sync selected property state
    useEffect(() => {
        if (properties && properties.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(properties[0].id.toString());
        }
    }, [properties, selectedPropertyId]);

    // Update property_id in form when property changes
    useEffect(() => {
        if (selectedPropertyId) {
            setFormData(prev => ({ ...prev, property_id: selectedPropertyId }));
        }
    }, [selectedPropertyId]);

    // Fetch rooms for selected property in form
    const { data: rooms } = useQuery(
        ['hms-rooms', formData.property_id],
        () => api.get(`/property-owner/hms/rooms/${formData.property_id}`).then(res => res.data?.data?.rooms || []),
        { enabled: !!formData.property_id }
    );

    // Fetch maintenance tasks
    const { data: tasksData, isLoading: isLoadingTasks } = useQuery(
        ['hms-maintenance-tasks', selectedPropertyId],
        () => api.get(`/property-owner/hms/maintenance?property_id=${selectedPropertyId}`).then(res => res.data?.data?.tasks || []),
        { enabled: !!selectedPropertyId }
    );

    // Mutations
    const createTaskMutation = useMutation(
        (data) => api.post('/property-owner/hms/maintenance', data),
        {
            onSuccess: (res, variables) => {
                showSuccess('Maintenance task scheduled successfully');
                const savedPropertyId = variables?.property_id;
                
                // Clear filters & switch tab
                setActiveTab('active');
                setStatusFilter('all');
                setTypeFilter('all');
                
                if (savedPropertyId) {
                    setSelectedPropertyId(savedPropertyId.toString());
                }
                
                queryClient.invalidateQueries('hms-maintenance-tasks');
                setIsModalOpen(false);
                resetForm(savedPropertyId);
            },
            onError: (err) => {
                showError(err.response?.data?.message || 'Failed to schedule task');
            }
        }
    );

    const updateTaskMutation = useMutation(
        ({ id, data }) => api.put(`/property-owner/hms/maintenance/${id}`, data),
        {
            onSuccess: (res, variables) => {
                showSuccess('Maintenance task updated successfully');
                const savedPropertyId = variables?.data?.property_id;
                const newStatus = variables?.data?.status;
                
                // Switch tab based on the new status
                if (newStatus === 'completed' || newStatus === 'cancelled') {
                    setActiveTab('history');
                } else {
                    setActiveTab('active');
                }
                
                // Clear filters
                setStatusFilter('all');
                setTypeFilter('all');
                
                if (savedPropertyId) {
                    setSelectedPropertyId(savedPropertyId.toString());
                }
                
                queryClient.invalidateQueries('hms-maintenance-tasks');
                setIsModalOpen(false);
                resetForm(savedPropertyId);
            },
            onError: (err) => {
                showError(err.response?.data?.message || 'Failed to update task');
            }
        }
    );

    const deleteTaskMutation = useMutation(
        (id) => api.delete(`/property-owner/hms/maintenance/${id}`),
        {
            onSuccess: () => {
                showSuccess('Maintenance task deleted');
                queryClient.invalidateQueries('hms-maintenance-tasks');
            },
            onError: (err) => {
                showError(err.response?.data?.message || 'Failed to delete task');
            }
        }
    );

    // Service Type Mutations
    const createTypeMutation = useMutation(
        (data) => api.post('/property-owner/hms/maintenance/types', data),
        {
            onSuccess: () => {
                showSuccess('Service type created successfully');
                queryClient.invalidateQueries('hms-maintenance-types');
                setIsTypeModalOpen(false);
                setTypeFormData({ name: '', description: '' });
            },
            onError: (err) => {
                showError(err.response?.data?.message || 'Failed to create service type');
            }
        }
    );

    const updateTypeMutation = useMutation(
        ({ id, data }) => api.put(`/property-owner/hms/maintenance/types/${id}`, data),
        {
            onSuccess: () => {
                showSuccess('Service type updated successfully');
                queryClient.invalidateQueries('hms-maintenance-types');
                setIsTypeModalOpen(false);
                setEditingType(null);
                setTypeFormData({ name: '', description: '' });
            },
            onError: (err) => {
                showError(err.response?.data?.message || 'Failed to update service type');
            }
        }
    );

    const deleteTypeMutation = useMutation(
        (id) => api.delete(`/property-owner/hms/maintenance/types/${id}`),
        {
            onSuccess: () => {
                showSuccess('Service type deleted successfully');
                queryClient.invalidateQueries('hms-maintenance-types');
            },
            onError: (err) => {
                showError(err.response?.data?.message || 'Failed to delete service type');
            }
        }
    );

    // Handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.property_id || !formData.task_type || !formData.start_date || !formData.end_date) {
            showError('Please fill out all required fields');
            return;
        }

        const payload = {
            ...formData,
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            recurrence_interval: formData.is_recurring ? parseInt(formData.recurrence_interval) : 0
        };

        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, data: payload });
        } else {
            createTaskMutation.mutate(payload);
        }
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
        setFormData({
            property_id: task.property_id,
            room_id: task.room_id || '',
            task_type: task.task_type,
            description: task.description || '',
            cost: task.cost || '',
            status: task.status,
            start_date: format(new Date(task.start_date), 'yyyy-MM-dd'),
            end_date: format(new Date(task.end_date), 'yyyy-MM-dd'),
            is_recurring: !!task.is_recurring,
            recurrence_interval: task.recurrence_interval || '90',
            lock_room: task.status === 'in_progress' || task.status === 'scheduled'
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this maintenance task?')) {
            deleteTaskMutation.mutate(id);
        }
    };

    const handleQuickStatusUpdate = (task, newStatus) => {
        const payload = {
            ...task,
            status: newStatus,
            cost: task.cost ? parseFloat(task.cost) : 0,
            lock_room: newStatus === 'in_progress' || newStatus === 'scheduled'
        };
        updateTaskMutation.mutate({ id: task.id, data: payload });
    };

    // KPI Aggregations
    const kpis = React.useMemo(() => {
        const list = tasksData || [];
        const active = list.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;
        const completed = list.filter(t => t.status === 'completed').length;
        
        // Cost spent in current month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyCost = list
            .filter(t => {
                if (t.status !== 'completed' || !t.end_date) return false;
                const d = new Date(t.end_date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + parseFloat(t.cost || 0), 0);

        // Upcoming recurring tasks alarms (tasks due within next 7 days)
        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        const alarms = list.filter(t => {
            if (t.status !== 'scheduled' || !t.next_due_date) return false;
            const d = new Date(t.next_due_date);
            return d >= new Date() && d <= next7Days;
        }).length;

        return { active, completed, monthlyCost, alarms };
    }, [tasksData]);

    // Filters & Sorting logic
    const filteredTasks = React.useMemo(() => {
        let list = tasksData || [];

        // Tab separation
        if (activeTab === 'active') {
            list = list.filter(t => t.status === 'scheduled' || t.status === 'in_progress');
        } else {
            list = list.filter(t => t.status === 'completed' || t.status === 'cancelled');
        }

        // Dropdown Filters
        if (statusFilter !== 'all') {
            list = list.filter(t => t.status === statusFilter);
        }
        if (typeFilter !== 'all') {
            list = list.filter(t => t.task_type === typeFilter);
        }

        return list;
    }, [tasksData, activeTab, statusFilter, typeFilter]);

    // Sum total cost of currently visible items
    const filteredCostTotal = React.useMemo(() => {
        return filteredTasks.reduce((sum, t) => sum + parseFloat(t.cost || 0), 0);
    }, [filteredTasks]);

    const formatPrice = (amount) => {
        const val = parseFloat(amount || 0);
        return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };


    const activeFilterCount = [
        statusFilter !== 'all',
        typeFilter !== 'all'
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-12">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>

            {/* Header */}
            <div className="bg-white border-b border-gray-200/80 px-4 sm:px-8 py-6 sm:py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <FiTool className="text-[#064e3b]" />
                            <span>HMS Room Maintenance</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">Schedule repairs, inspections, and sync operational maintenance costs with Accounts.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        <SearchablePropertySelect
                            properties={properties}
                            selectedId={selectedPropertyId}
                            onChange={setSelectedPropertyId}
                            className="w-full sm:w-60"
                            placeholder="Type to search property..."
                        />

                        <button
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                            className="hidden sm:flex items-center justify-center gap-2 bg-[#064e3b] hover:bg-[#043d2e] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all"
                        >
                            <FiPlus size={16} /> Schedule Task
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard & Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 sm:mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
                    {/* Active tasks */}
                    <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                            <FiClock size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Tasks</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">{kpis.active} Pending</span>
                        </div>
                    </div>

                    {/* Completed tasks */}
                    <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 shrink-0">
                            <FiCheck size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">{kpis.completed} Services</span>
                        </div>
                    </div>

                    {/* Monthly cost */}
                    <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
                            <FiDollarSign size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Costs (This Month)</span>
                            <span className="text-base sm:text-lg font-extrabold text-gray-850 flex items-center">
                                <TakaIcon className="text-red-650 mr-0.5" />
                                <span>{formatPrice(kpis.monthlyCost)}</span>
                            </span>
                        </div>
                    </div>

                    {/* Alarm triggers */}
                    <div className="bg-white rounded-xl shadow-xs border border-gray-150 p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                            <FiRepeat size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">7 Days Alarms</span>
                            <span className="text-base sm:text-lg font-bold text-gray-800">{kpis.alarms} Due Soon</span>
                        </div>
                    </div>
                </div>

                {/* Main Filter and Table container */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                    {/* Tabs row */}
                    <div className="flex border-b border-gray-150 bg-gray-50/50 px-4 sm:px-6">
                        <button
                            onClick={() => { setActiveTab('active'); setStatusFilter('all'); }}
                            className={`px-3 sm:px-4 py-3 sm:py-4 text-xs font-bold transition-all border-b-2 ${
                                activeTab === 'active' 
                                    ? 'border-[#064e3b] text-[#064e3b]' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Active Schedule
                        </button>
                        <button
                            onClick={() => { setActiveTab('history'); setStatusFilter('all'); }}
                            className={`px-3 sm:px-4 py-3 sm:py-4 text-xs font-bold transition-all border-b-2 ${
                                activeTab === 'history' 
                                    ? 'border-[#064e3b] text-[#064e3b]' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            History & Archives
                        </button>
                        <button
                            onClick={() => { setActiveTab('types'); }}
                            className={`px-3 sm:px-4 py-3 sm:py-4 text-xs font-bold transition-all border-b-2 ${
                                activeTab === 'types' 
                                    ? 'border-[#064e3b] text-[#064e3b]' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Service Types
                        </button>
                    </div>

                    {activeTab !== 'types' ? (
                        <>
                            {/* Collapsible Mobile Filters Button & Header */}
                            <div className="p-4 sm:p-6 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                                <div className="flex items-center justify-between w-full md:w-auto">
                                    <div className="flex items-center gap-2">
                                        <FiFilter className="text-gray-400" size={14} />
                                        <span className="text-xs font-bold text-gray-600">Filters:</span>
                                        {activeFilterCount > 0 && (
                                            <span className="text-[10px] bg-[#064e3b]/10 text-[#064e3b] px-1.5 py-0.5 rounded-full font-bold">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                        className="md:hidden text-xs font-bold text-[#064e3b] bg-[#064e3b]/5 px-3 py-1.5 rounded-lg border border-[#064e3b]/15"
                                    >
                                        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                                    </button>
                                </div>

                                {/* Dropdown Filters (collapsible on mobile, visible on desktop) */}
                                <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto animate-fade-in`}>
                                    {/* Status dropdown */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-white border border-gray-250 text-gray-750 text-xs rounded-lg block p-2 focus:ring-[#064e3b] focus:border-[#064e3b]"
                                    >
                                        <option value="all">All Statuses</option>
                                        {activeTab === 'active' ? (
                                            <>
                                                <option value="scheduled">Scheduled</option>
                                                <option value="in_progress">In Progress</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </>
                                        )}
                                    </select>

                                    {/* Task Type dropdown */}
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="bg-white border border-gray-255 text-gray-755 text-xs rounded-lg block p-2 focus:ring-[#064e3b] focus:border-[#064e3b]"
                                    >
                                        <option value="all">All Service Types</option>
                                        {taskTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>

                                    {(statusFilter !== 'all' || typeFilter !== 'all') && (
                                        <button
                                            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                                            className="text-xs font-bold text-red-600 hover:text-red-850 p-2 text-center"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>

                                {activeTab === 'history' && (
                                    <div className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-150 flex items-center justify-between sm:justify-start gap-1 w-full sm:w-auto shrink-0">
                                        <span>Logged Expense:</span>
                                        <span className="text-[#064e3b] font-black flex items-center">
                                            <TakaIcon className="text-[#064e3b] w-3 h-3 mr-0.5" />
                                            <span>{formatPrice(filteredCostTotal)} BDT</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Table / Card List View */}
                            {isLoadingTasks ? (
                                <div className="p-12 text-center"><LoadingSpinner /></div>
                            ) : (
                                <div>
                                    {/* Desktop/Tablet Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xxs uppercase tracking-wider text-gray-400 font-extrabold">
                                                    <th className="px-6 py-4">Task Details</th>
                                                    <th className="px-6 py-4">Room/Unit No</th>
                                                    <th className="px-6 py-4">Schedule Date</th>
                                                    <th className="px-6 py-4">Recurrence / Alerts</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Cost (BDT)</th>
                                                    <th className="px-6 py-4 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredTasks.map(t => (
                                                    <tr key={t.id} className="hover:bg-gray-50/20 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-gray-900 block text-xs">
                                                                {taskTypes.find(type => type.value === t.task_type)?.label || t.task_type}
                                                            </span>
                                                            <span className="text-xxs text-gray-400 mt-0.5 block truncate max-w-xs">{t.description || 'No description provided.'}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {t.room_number ? (
                                                                <span className="bg-[#064e3b]/10 text-[#064e3b] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                    Room {t.room_number}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xxs font-medium italic">Whole Property</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                                                            {format(new Date(t.start_date), 'MMM dd')} - {format(new Date(t.end_date), 'MMM dd, yyyy')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {t.is_recurring ? (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-xxs font-bold text-[#064e3b] flex items-center gap-1">
                                                                        <FiRepeat size={10} /> Every {t.recurrence_interval} days
                                                                    </span>
                                                                    {t.next_due_date && (
                                                                        <span className="text-[10px] text-gray-400">Next: {format(new Date(t.next_due_date), 'MMM dd, yyyy')}</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xxs">One-off task</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                                                                t.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                t.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                t.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                                'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                                {t.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-gray-800 text-xs">
                                                            {t.cost > 0 ? (
                                                                <span className="flex items-center justify-end gap-0.5">
                                                                    <TakaIcon className="text-gray-500" />
                                                                    <span>{formatPrice(t.cost)}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xxs font-semibold">--</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {t.status === 'scheduled' && (
                                                                    <button
                                                                        onClick={() => handleQuickStatusUpdate(t, 'in_progress')}
                                                                        title="Start Task"
                                                                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        <FiActivity size={14} />
                                                                    </button>
                                                                )}
                                                                {t.status === 'in_progress' && (
                                                                    <button
                                                                        onClick={() => handleEditClick(t)}
                                                                        title="Complete Task"
                                                                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        <FiCheck size={14} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleEditClick(t)}
                                                                    title="Edit details"
                                                                    className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-650 rounded-lg transition-colors cursor-pointer"
                                                                >
                                                                    <FiSettings size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClick(t.id)}
                                                                    title="Delete Task"
                                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-colors cursor-pointer"
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card-List View (Responsive fallback) */}
                                    <div className="block md:hidden divide-y divide-gray-100 bg-white">
                                        {filteredTasks.map(t => (
                                            <div key={t.id} className="p-4 flex flex-col gap-3.5 animate-fade-in">
                                                 {/* Card Header: Title & Status */}
                                                 <div className="flex items-start justify-between gap-2">
                                                      <div>
                                                          <span className="font-extrabold text-gray-900 text-sm block">
                                                              {taskTypes.find(type => type.value === t.task_type)?.label || t.task_type}
                                                          </span>
                                                          <span className="text-[11px] text-gray-550 mt-1 block leading-relaxed">{t.description || 'No description provided.'}</span>
                                                      </div>
                                                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border shrink-0 ${
                                                          t.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                          t.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                          t.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                          'bg-amber-50 text-amber-700 border-amber-200'
                                                      }`}>
                                                          {t.status.replace('_', ' ')}
                                                      </span>
                                                 </div>

                                                 {/* Meta Info: Room, Property & Dates */}
                                                 <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xxs text-gray-500 font-bold bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                                                      {t.room_number ? (
                                                          <span className="bg-[#064e3b]/10 text-[#064e3b] px-2 py-0.5 rounded-md text-[10px]">
                                                              Room {t.room_number}
                                                          </span>
                                                      ) : (
                                                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] italic">Whole Property</span>
                                                      )}
                                                      <span className="flex items-center gap-1">
                                                          <FiCalendar size={12} className="text-gray-400" />
                                                          <span>{format(new Date(t.start_date), 'MMM dd')} ➔ {format(new Date(t.end_date), 'MMM dd, yyyy')}</span>
                                                      </span>
                                                 </div>

                                                 {/* Bottom details: Cost and Recurrence */}
                                                 <div className="flex items-center justify-between mt-1">
                                                      <div>
                                                          {t.is_recurring ? (
                                                              <span className="text-[10px] font-extrabold text-[#064e3b] flex items-center gap-1">
                                                                  <FiRepeat size={10} /> Every {t.recurrence_interval} days
                                                              </span>
                                                          ) : (
                                                              <span className="text-gray-400 text-[10px]">One-off servicing</span>
                                                          )}
                                                      </div>
                                                      
                                                      <div className="text-right">
                                                          <span className="text-xxs font-bold text-gray-400 block uppercase">Cost:</span>
                                                          <span className="text-xs font-black text-gray-805 flex items-center gap-0.5 justify-end">
                                                              <TakaIcon className="text-gray-550 w-3 h-3" />
                                                              <span>{t.cost > 0 ? formatPrice(t.cost) : '0'}</span>
                                                          </span>
                                                      </div>
                                                 </div>

                                                 {/* Action Row */}
                                                 <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                                                      {t.status === 'scheduled' && (
                                                          <button
                                                              onClick={() => handleQuickStatusUpdate(t, 'in_progress')}
                                                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xxs font-bold transition-colors cursor-pointer"
                                                          >
                                                              <FiActivity size={12} />
                                                              <span>Start</span>
                                                          </button>
                                                      )}
                                                      {t.status === 'in_progress' && (
                                                          <button
                                                              onClick={() => handleEditClick(t)}
                                                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xxs font-bold transition-colors cursor-pointer"
                                                          >
                                                              <FiCheck size={12} />
                                                              <span>Complete</span>
                                                          </button>
                                                      )}
                                                      <button
                                                          onClick={() => handleEditClick(t)}
                                                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xxs font-bold transition-colors cursor-pointer"
                                                      >
                                                          <FiSettings size={12} />
                                                          <span>Edit</span>
                                                      </button>
                                                      <button
                                                          onClick={() => handleDeleteClick(t.id)}
                                                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xxs font-bold transition-colors cursor-pointer"
                                                      >
                                                          <FiTrash2 size={12} />
                                                          <span>Delete</span>
                                                      </button>
                                                 </div>
                                            </div>
                                        ))}
                                    </div>

                                    {(!filteredTasks || filteredTasks.length === 0) && (
                                        <div className="p-16 text-center text-gray-400 bg-white">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FiAlertCircle className="text-3xl text-gray-300" />
                                                <span className="text-sm font-medium">No tasks logged in this view.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-4 sm:p-6 bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Manage Service Types</h2>
                                    <p className="text-xxs text-gray-400 mt-1">Add custom maintenance services that you perform on your properties.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingType(null);
                                        setTypeFormData({ name: '', description: '' });
                                        setIsTypeModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 bg-[#064e3b] hover:bg-[#043d2e] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                                >
                                    <FiPlus size={14} /> Add Service Type
                                </button>
                            </div>

                            {isLoadingTypes ? (
                                <div className="p-8 text-center"><LoadingSpinner /></div>
                            ) : !serviceTypes || serviceTypes.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                    <FiAlertCircle className="text-2xl text-gray-300 mx-auto mb-2" />
                                    <span className="text-xs font-medium">No service types found. Click Add to create one.</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-gray-150 rounded-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/60 border-b border-gray-150 text-xxs uppercase tracking-wider text-gray-400 font-extrabold">
                                                <th className="px-4 py-3">Service Name</th>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3 text-center w-24">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {serviceTypes.map(type => (
                                                <tr key={type.id} className="hover:bg-gray-50/10 transition-colors">
                                                    <td className="px-4 py-3.5 font-bold text-gray-800">{type.name}</td>
                                                    <td className="px-4 py-3.5 text-gray-500 font-medium">{type.description || <span className="text-gray-300 italic">No description</span>}</td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingType(type);
                                                                    setTypeFormData({ name: type.name, description: type.description || '' });
                                                                    setIsTypeModalOpen(true);
                                                                }}
                                                                className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-650 rounded-lg transition-colors cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <FiSettings size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Are you sure you want to delete "${type.name}"? This won't affect past tasks but will remove it from the scheduling dropdown options.`)) {
                                                                        deleteTypeMutation.mutate(type.id);
                                                                    }
                                                                }}
                                                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <div className="fixed bottom-6 right-6 sm:hidden z-40">
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center bg-[#064e3b] text-white w-14 h-14 rounded-full shadow-xl hover:scale-95 active:scale-90 transition-transform cursor-pointer"
                >
                    <FiPlus size={24} />
                </button>
            </div>

            {/* Schedule & Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-150 transform transition-all animate-fade-in my-8">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase flex items-center gap-1.5">
                                <FiTool className="text-[#064e3b]" />
                                <span>{editingTask ? 'Edit Scheduled Task' : 'Schedule Maintenance Task'}</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* Property select */}
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Property *</label>
                                <SearchablePropertySelect
                                    properties={properties}
                                    selectedId={formData.property_id}
                                    onChange={(id) => setFormData(prev => ({ ...prev, property_id: id, room_id: '' }))}
                                    className="w-full"
                                    placeholder="Search property name..."
                                />
                            </div>

                            {/* Room select */}
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Room/Unit (Optional)</label>
                                <select
                                    value={formData.room_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, room_id: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                >
                                    <option value="">Whole Property / Common Space</option>
                                    {rooms?.map(r => (
                                        <option key={r.id} value={r.id}>Room {r.room_number} ({r.room_type_name || 'Room'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Task Type */}
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Service Type *</label>
                                    <select
                                        value={formData.task_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
                                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                        required
                                    >
                                        {taskTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Task Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                        required
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                        required
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Cost Input */}
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">
                                    Actual/Estimated Cost (BDT)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter cost in BDT"
                                    value={formData.cost}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                />
                                {formData.status === 'completed' && (
                                    <p className="text-[10px] text-green-600 font-bold mt-1.5 leading-normal">
                                        💡 Completed status triggers a Repairs & Maintenance expense voucher inside accounts for this amount.
                                    </p>
                                )}
                            </div>

                            {/* Room Status Lock & Recurrence */}
                            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3.5 border border-gray-150">
                                {formData.room_id && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xxs font-bold text-gray-700 block">Lock Room Booking Calendar</span>
                                            <span className="text-[10px] text-gray-400">Lock room to maintenance status during service</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.lock_room}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lock_room: e.target.checked }))}
                                            className="w-5 h-5 text-[#064e3b] border-gray-300 rounded focus:ring-[#064e3b]"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xxs font-bold text-gray-700 block">Is Recurring Task?</span>
                                        <span className="text-[10px] text-gray-400">Repeats periodically and alerts host on WhatsApp</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_recurring}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                                        className="w-5 h-5 text-[#064e3b] border-gray-300 rounded focus:ring-[#064e3b]"
                                    />
                                </div>

                                {formData.is_recurring && (
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Recurrence Days (Interval)</label>
                                            <input
                                                type="number"
                                                placeholder="90"
                                                value={formData.recurrence_interval}
                                                onChange={(e) => setFormData(prev => ({ ...prev, recurrence_interval: e.target.value }))}
                                                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-[#064e3b]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Description / Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="Enter additional details or service provider information..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                />
                            </div>

                            {/* Submit and Cancel buttons */}
                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTaskMutation.isLoading || updateTaskMutation.isLoading}
                                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#064e3b] hover:bg-[#043d2e] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    {(createTaskMutation.isLoading || updateTaskMutation.isLoading) ? 'Saving...' : 'Save Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Service Type Add/Edit Modal */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-150 transform transition-all animate-fade-in my-8">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase flex items-center gap-1.5">
                                <FiPlus className="text-[#064e3b]" />
                                <span>{editingType ? 'Edit Service Type' : 'Add Service Type'}</span>
                            </h3>
                            <button onClick={() => setIsTypeModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!typeFormData.name.trim()) return;
                            const payload = {
                                name: typeFormData.name.trim(),
                                description: typeFormData.description
                            };
                            if (editingType) {
                                updateTypeMutation.mutate({ id: editingType.id, data: payload });
                            } else {
                                createTypeMutation.mutate(payload);
                            }
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Service Type Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Deep Cleaning, Pool Maintenance"
                                    value={typeFormData.name}
                                    onChange={(e) => setTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b] font-semibold text-gray-705"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xxs font-bold text-gray-400 uppercase mb-1">Description / Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe the nature of this service..."
                                    value={typeFormData.description}
                                    onChange={(e) => setTypeFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-[#064e3b] focus:border-[#064e3b]"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsTypeModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTypeMutation.isLoading || updateTypeMutation.isLoading}
                                    className="px-4 py-2 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                    {(createTypeMutation.isLoading || updateTypeMutation.isLoading) ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSMaintenance;
