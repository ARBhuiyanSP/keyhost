import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
    FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiBriefcase, 
    FiMail, FiPhone, FiCalendar, FiCheck, FiX, FiFilter 
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STAFF_ROLES = [
    { value: 'manager', label: 'Manager' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
];

const AVAILABLE_PERMISSIONS = [
    { key: 'manage_properties', label: 'Manage Properties & Bookings' },
    { key: 'manage_inventory', label: 'Manage Room/Flat Inventory' },
    { key: 'manage_reservations', label: 'Manage HMS/PMS Reservations' },
    { key: 'manage_housekeeping', label: 'Manage Housekeeping & Cleaning' },
    { key: 'manage_food_beverage', label: 'Manage Food & Beverage' },
    { key: 'manage_hr', label: 'Manage Human Resources (HR)' },
    { key: 'manage_accounts', label: 'Manage Accounts & Finance' },
    { key: 'manage_billing', label: 'Manage PMS/HMS Billing & Subscriptions' },
    { key: 'view_analytics', label: 'View Dashboard & Financial Reports' }
];

const HMSStaff = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'other',
        salary: '',
        joining_date: new Date().toISOString().split('T')[0],
        status: 'active',
        password: '',
        permissions: {}
    });

    // Fetch user's properties to select one
    const { data: propertiesData, isLoading: loadingProperties } = useQuery(
        'owner-properties-list',
        () => api.get('/property-owner/properties?limit=100'),
        {
            select: (res) => res.data?.data?.properties?.filter(p => p.is_hms_enabled) || []
        }
    );

    // Fetch staff for selected property
    const { data: staffData, isLoading: loadingStaff, refetch: refetchStaff } = useQuery(
        ['hms-staff', selectedPropertyId],
        () => api.get(`/property-owner/hms-mgmt/staff/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.staff || []
        }
    );

    useEffect(() => {
        if (propertiesData?.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(propertiesData[0].id);
        }
    }, [propertiesData]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                permissions: formData.permissions || {}
            };
            
            // Remove empty password when editing to avoid overriding
            if (editingStaff && !payload.password) {
                delete payload.password;
            }

            if (editingStaff) {
                await api.put(`/property-owner/hms-mgmt/staff/${editingStaff.id}`, payload);
                showSuccess('Staff updated successfully');
            } else {
                await api.post('/property-owner/hms-mgmt/staff', {
                    ...payload,
                    property_id: selectedPropertyId
                });
                showSuccess('Staff member added successfully');
            }
            setShowForm(false);
            setEditingStaff(null);
            resetForm();
            refetchStaff();
        } catch (error) {
            showError(error.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            role: 'other',
            salary: '',
            joining_date: new Date().toISOString().split('T')[0],
            status: 'active',
            password: '',
            permissions: {}
        });
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        
        let parsedPerms = {};
        if (staff.permissions) {
            try {
                parsedPerms = typeof staff.permissions === 'string'
                    ? JSON.parse(staff.permissions)
                    : (staff.permissions || {});
            } catch (e) {
                console.error('Error parsing staff permissions:', e);
            }
        }

        setFormData({
            first_name: staff.first_name,
            last_name: staff.last_name,
            email: staff.email || '',
            phone: staff.phone || '',
            role: staff.role,
            salary: staff.salary,
            joining_date: staff.joining_date ? staff.joining_date.split('T')[0] : '',
            status: staff.status,
            password: '',
            permissions: parsedPerms
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/property-owner/hms-mgmt/staff/${id}`);
            showSuccess('Staff removed');
            refetchStaff();
        } catch (error) {
            showError('Failed to remove staff');
        }
    };

    const filteredStaff = (staffData || []).filter(staff => {
        const matchesSearch = 
            `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.phone?.includes(searchQuery);
        const matchesRole = !roleFilter || staff.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loadingProperties) return <div className="p-8 text-center"><LoadingSpinner size="large" /></div>;

    if (!propertiesData || propertiesData.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm max-w-2xl mx-auto my-12">
                <FiBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No HMS Properties Found</h2>
                <p className="text-gray-500 mb-6">Enable HMS mode for at least one property to manage staff.</p>
                <button onClick={() => window.location.href='/property-owner/properties'} className="btn-primary">
                    Manage Properties
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FiUsers className="mr-3 text-primary-600" />
                            Staff Management
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your hotel staff and their roles.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        >
                            {propertiesData.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => { resetForm(); setEditingStaff(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 font-semibold"
                        >
                            <FiPlus className="w-5 h-5" />
                            Add Staff
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 border border-gray-100">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search staff by name, email or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="pl-11 pr-8 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm cursor-pointer appearance-none"
                            >
                                <option value="">All Roles</option>
                                {STAFF_ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loadingStaff ? (
                    <div className="py-20 text-center"><LoadingSpinner size="large" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.length > 0 ? filteredStaff.map((staff) => (
                            <div key={staff.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-bold text-xl">
                                            {staff.first_name[0]}{staff.last_name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {staff.first_name} {staff.last_name}
                                            </h3>
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                {STAFF_ROLES.find(r => r.value === staff.role)?.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(staff)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(staff.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiMail className="mr-3 text-gray-400" />
                                        {staff.email || 'No email provided'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiPhone className="mr-3 text-gray-400" />
                                        {staff.phone || 'No phone provided'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiCalendar className="mr-3 text-gray-400" />
                                        Joined: {staff.joining_date ? new Date(staff.joining_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                    <div className="text-primary-600 font-bold text-lg">
                                        ৳{staff.salary?.toLocaleString()}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        staff.status === 'active' ? 'bg-green-100 text-green-700' : 
                                        staff.status === 'on_leave' ? 'bg-amber-100 text-amber-700' : 
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {staff.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        )) : selectedPropertyId ? (
                            <div className="col-span-full py-20 bg-white rounded-2xl text-center border-2 border-dashed border-gray-200">
                                <FiUsers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No staff found for this property</h3>
                                <p className="text-gray-500">Click "Add Staff" to start building your team.</p>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Staff Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
                        <div className="px-8 py-6 bg-primary-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all cursor-pointer"
                                    >
                                        {STAFF_ROLES.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Salary (BDT) *</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Joining Date</label>
                                    <input
                                        type="date"
                                        value={formData.joining_date}
                                        onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {editingStaff ? 'Login Password (leave blank to keep current)' : 'Login Password *'}
                                    </label>
                                    <input
                                        required={!editingStaff}
                                        type="password"
                                        placeholder={editingStaff ? "••••••••" : "Enter login password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            {/* Role Permissions Section */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-base font-bold text-[#E41D57] mb-2">Role Permissions</h3>
                                <p className="text-xs text-gray-500 mb-4">Toggle checkmarks to authorize access to specific hotel/property management features.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_PERMISSIONS.map(p => (
                                        <label key={p.key} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={!!formData.permissions?.[p.key]}
                                                onChange={(e) => {
                                                    const updatedPerms = {
                                                        ...(formData.permissions || {}),
                                                        [p.key]: e.target.checked
                                                    };
                                                    setFormData({ ...formData, permissions: updatedPerms });
                                                }}
                                                className="w-5 h-5 accent-primary-600 border-gray-300 rounded mt-0.5"
                                            />
                                            <span className="text-sm font-semibold text-gray-700">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25"
                                >
                                    {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSStaff;
