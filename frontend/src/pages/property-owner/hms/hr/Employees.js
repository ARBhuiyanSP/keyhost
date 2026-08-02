import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
    FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiBriefcase, 
    FiMail, FiPhone, FiCalendar, FiCheck, FiX, FiFilter, FiMapPin, FiCamera
} from 'react-icons/fi';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { getImageUrl } from '../../../../utils/imageUrl';
import SingleImageUpload from '../../../../components/common/SingleImageUpload';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

const Employees = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [desigFilter, setDesigFilter] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        salary: '',
        designation_id: '',
        department_id: '',
        shift_id: '',
        blood_group: '',
        date_of_birth: '',
        appointment_date: '',
        joining_date: '',
        address: '',
        photo: '',
        status: 'active',
        password: '', // For new staff login
        property_id: '',
        permissions: {},
    });

    // Fetch Departments
    const { data: deptsData } = useQuery('hms-departments', () => api.get('/hms/hr/departments'), {
        select: (res) => res.data?.data?.departments || []
    });

    // Fetch Designations
    const { data: desigsData } = useQuery('hms-designations', () => api.get('/hms/hr/designations'), {
        select: (res) => res.data?.data?.designations || []
    });

    // Fetch Shifts
    const { data: shiftsData } = useQuery('hms-shifts', () => api.get('/hms/hr/shifts'), {
        select: (res) => res.data?.data?.shifts || []
    });

    // Fetch Properties
    const { data: properties } = useQuery('hms-properties', async () => {
        const response = await api.get('/property-owner/properties');
        return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
    });

    // Fetch Employees
    const { data: employeesData, isLoading: loadingEmployees, refetch: refetchEmployees } = useQuery(
        'hms-employees',
        () => api.get('/hms/hr/employees'),
        {
            select: (res) => res.data?.data?.employees || []
        }
    );

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await api.put(`/hms/hr/employees/${editingEmployee.id}`, formData);
                showSuccess('Employee updated successfully');
            } else {
                await api.post('/hms/hr/employees', formData);
                showSuccess('Employee added successfully');
            }
            setShowForm(false);
            setEditingEmployee(null);
            resetForm();
            refetchEmployees();
        } catch (error) {
            showError(error.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            salary: '',
            designation_id: '',
            department_id: '',
            shift_id: '',
            blood_group: '',
            date_of_birth: '',
            appointment_date: '',
            joining_date: '',
            address: '',
            photo: '',
            status: 'active',
            password: '',
            property_id: '',
            permissions: {},
        });
    };

    const handleEdit = (emp) => {
        setEditingEmployee(emp);
        
        let parsedPerms = {};
        if (emp.permissions) {
            try {
                parsedPerms = typeof emp.permissions === 'string'
                    ? JSON.parse(emp.permissions)
                    : (emp.permissions || {});
            } catch (e) {
                console.error('Error parsing employee permissions:', e);
            }
        }

        setFormData({
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            salary: emp.salary,
            designation_id: emp.designation_id || '',
            department_id: emp.department_id || '',
            shift_id: emp.shift_id || '',
            blood_group: emp.blood_group || '',
            date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
            appointment_date: emp.appointment_date ? emp.appointment_date.split('T')[0] : '',
            joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
            address: emp.address || '',
            photo: emp.photo || '',
            status: emp.status,
            password: '',
            property_id: emp.property_id || '',
            permissions: parsedPerms
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this employee?')) return;
        try {
            await api.delete(`/hms/hr/employees/${id}`);
            showSuccess('Employee removed');
            refetchEmployees();
        } catch (error) {
            showError('Failed to remove employee');
        }
    };

    const filteredEmployees = (employeesData || []).filter(emp => {
        const matchesSearch = 
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.phone?.includes(searchQuery);
        const matchesStatus = !statusFilter || emp.status === statusFilter;
        const matchesDept = !deptFilter || emp.department_id === parseInt(deptFilter);
        const matchesDesig = !desigFilter || emp.designation_id === parseInt(desigFilter);
        return matchesSearch && matchesStatus && matchesDept && matchesDesig;
    });

    return (
        <div className="min-h-screen bg-[#F3F7F9]">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Employee</h1>
                        <p className="text-sm text-gray-500">Manage your hotel employees and staff details</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingEmployee(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-[#004D40] hover:bg-[#003d33] text-white px-4 py-2 rounded-lg transition-all shadow-md font-medium"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add New Employee
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 border border-gray-100 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                        />
                    </div>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                    </select>

                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">Select Department</option>
                        {deptsData?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select
                        value={desigFilter}
                        onChange={(e) => setDesigFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">Select Designation</option>
                        {desigsData?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <button 
                        onClick={() => { setSearchQuery(''); setStatusFilter(''); setDeptFilter(''); setDesigFilter(''); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear Filters"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#CFD8DC] text-[#455A64] text-xs font-bold uppercase">
                                    <th className="px-4 py-3">SL</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Designation</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Contact No</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Salary</th>
                                    <th className="px-4 py-3">Joining Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loadingEmployees ? (
                                    <tr><td colSpan="10" className="py-20 text-center"><LoadingSpinner /></td></tr>
                                ) : filteredEmployees.length > 0 ? filteredEmployees.map((emp, index) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {emp.photo ? (
                                                        <img src={getImageUrl(emp.photo)} alt={emp.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <FiUsers className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-800">{emp.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{emp.designation_name || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-pink-50 text-pink-600 rounded text-xs font-bold">
                                                {emp.department_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-700">{emp.salary?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                                                emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEdit(emp)} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="10" className="py-20 text-center text-gray-400">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g: Mr. John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                
                                {/* Property */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Select a Property
                                    </label>
                                    <select
                                        required
                                        value={formData.property_id}
                                        onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                    >
                                        <option value="">Select a Property</option>
                                        {properties?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Email
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="email"
                                            placeholder="example@gmail.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Phone No
                                    </label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="01** *** ****"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Salary */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Salary
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="e.g: 50000"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Select a Designation
                                    </label>
                                    <select
                                        required
                                        value={formData.designation_id}
                                        onChange={(e) => setFormData({...formData, designation_id: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                    >
                                        <option value="">Select a Designation</option>
                                        {desigsData?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Select a Department
                                    </label>
                                    <select
                                        required
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                    >
                                        <option value="">Select a Department</option>
                                        {deptsData?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Select Blood Group
                                    </label>
                                    <select
                                        required
                                        value={formData.blood_group}
                                        onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                    >
                                        <option value="">Select Blood Group</option>
                                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>

                                {/* DOB */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Appointment Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Date</label>
                                    <input
                                        type="date"
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                    />
                                </div>

                                {/* Joining Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Joining Date</label>
                                    <input
                                        type="date"
                                        value={formData.joining_date}
                                        onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-600"
                                    />
                                </div>

                                {/* Password for Login */}
                                <div className="col-span-full animate-fadeIn">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        {editingEmployee ? 'Change Login Password (leave blank to keep current)' : 'Login Password (Optional - if provided, employee can login)'}
                                    </label>
                                    <input
                                        type="password"
                                        placeholder={editingEmployee ? "••••••••" : "Set a password for panel login"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                {/* Role Permissions Section */}
                                <div className="col-span-full border-t border-gray-100 pt-4">
                                    <label className="block text-sm font-semibold text-[#004D40] mb-2">
                                        Role Permissions
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Authorize access to specific features for this employee:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        {AVAILABLE_PERMISSIONS.map(p => (
                                            <label key={p.key} className="flex items-center gap-3 cursor-pointer">
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
                                                    className="w-4 h-4 text-[#004D40] border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">{p.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="col-span-full">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        <span className="text-red-500 mr-1">*</span> Address
                                    </label>
                                    <textarea
                                        required
                                        placeholder="e.g: Banani, Dhaka"
                                        rows="3"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    ></textarea>
                                </div>

                                <div className="col-span-full">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Photo (Maximum Size 1 MB)</label>
                                    <SingleImageUpload
                                        label="Upload Photo"
                                        value={formData.photo}
                                        onChange={(url) => setFormData({...formData, photo: url})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-start gap-4 mt-8">
                                <button
                                    type="submit"
                                    className="bg-[#004D40] hover:bg-[#003d33] text-white px-8 py-2.5 rounded font-bold transition-all shadow-lg"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
