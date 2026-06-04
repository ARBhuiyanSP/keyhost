import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiSearch, FiFilter, FiEye, FiEdit, FiShield, FiShieldOff, FiX, FiSave, FiUsers, FiBriefcase, FiUserCheck, FiActivity } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminUsers = () => {
  const { showSuccess, showError } = useToast();

  const [filters, setFilters] = useState({
    user_type: '',
    search: '',
    page: 1,
    limit: 10
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    user_type: '',
    auto_accept_bookings: false,
    hms_status: 'inactive',
    owner_verified: false
  });

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery(
    ['admin-users', filters],
    () => api.get(`/admin/users?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { users: [], pagination: {} },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value
    }));
  };

  const handleBlockUser = async (userId, isActive) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/block`, {
        is_active: isActive,
        reason: isActive ? 'Unblocked by admin' : 'Blocked by admin'
      });

      if (response.data?.success) {
        showSuccess(`User ${isActive ? 'unblocked' : 'blocked'} successfully!`);
        refetch();
      } else {
        showError(response.data?.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showError('Failed to update user status. Please try again.');
    }
  };

  const handleToggleAutoAccept = async (user) => {
    const newValue = !user.auto_accept_bookings;
    try {
      const response = await api.put(`/admin/users/${user.id}`, {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        auto_accept_bookings: newValue
      });
      if (response.data?.success) {
        showSuccess(`Auto Accept ${newValue ? 'enabled' : 'disabled'} for ${user.first_name}`);
        refetch();
      } else {
        showError(response.data?.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error toggling auto accept:', error);
      showError('Failed to update auto accept setting.');
    }
  };

  const handleToggleHMSStatus = async (user, newStatus) => {
    try {
      const response = await api.patch('/admin/hms/toggle', {
        host_id: user.id,
        status: newStatus
      });
      if (response.data?.success) {
        showSuccess(`HMS Status updated to ${newStatus}`);
        refetch();
      } else {
        showError(response.data?.message || 'Failed to update HMS Status');
      }
    } catch (error) {
      console.error('Error toggling HMS status:', error);
      showError('Failed to update HMS status.');
    }
  };

  const getHMSRemainingText = (user) => {
    if (user.hms_status === 'trialing' && user.hms_trial_ends_at) {
      const days = Math.ceil((new Date(user.hms_trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} days left` : 'Ends today';
    } else if (user.hms_status === 'active' && user.hms_subscription_ends_at) {
      const days = Math.ceil((new Date(user.hms_subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} days left` : 'Ends today';
    }
    return null;
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      user_type: user.user_type || '',
      auto_accept_bookings: !!user.auto_accept_bookings,
      hms_status: user.hms_status || 'inactive',
      owner_verified: !!user.owner_verified
    });
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      user_type: '',
      auto_accept_bookings: false,
      hms_status: 'inactive',
      owner_verified: false
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await api.put(`/admin/users/${selectedUser.id}`, editFormData);

      if (editFormData.user_type === 'property_owner') {
        try {
          await api.patch('/admin/hms/toggle', {
            host_id: selectedUser.id,
            status: editFormData.hms_status || 'inactive'
          });
        } catch (e) {
          console.error("Failed to update HMS status:", e);
        }
      }

      if (response.data?.success) {
        showSuccess('User updated successfully!');
        await refetch();
        handleCloseModals();
      } else {
        showError(response.data?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user. Please try again.';
      showError(errorMessage);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Blocked
      </span>
    );
  };

  const getUserTypeBadge = (userType) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      property_owner: 'bg-blue-100 text-blue-800',
      guest: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[userType] || 'bg-gray-100 text-gray-800'}`}>
        {userType?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (isLoading) return <LoadingSpinner />;

  const { users = [], pagination = {}, stats = {} } = usersData || {};

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Premium Page Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
            <p className="mt-2 text-indigo-200/90 text-sm max-w-xl">
              Monitor platform signups, manage account verification statuses for property owners, configure HMS billing licenses, and moderate account activities.
            </p>
          </div>
        </div>

        {/* Premium Metric Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <FiUsers className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Registrations</span>
              <span className="text-2xl font-black text-slate-800">{stats.total_users || 0}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <FiUserCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified Hosts</span>
              <span className="text-2xl font-black text-slate-800">{stats.verified_hosts || 0}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <FiActivity className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Verification</span>
              <span className="text-2xl font-black text-slate-800">{stats.pending_hosts || 0}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <FiShield className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Blocked Accounts</span>
              <span className="text-2xl font-black text-slate-800">{stats.blocked_users || 0}</span>
            </div>
          </div>
        </div>

        {/* Tabbed User Type Filtering */}
        <div className="flex border-b border-gray-200 mb-6 space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: '', label: 'All Users', count: stats.total_users },
            { id: 'property_owner', label: 'Property Owners / Hosts', count: stats.total_hosts },
            { id: 'guest', label: 'Guests', count: (stats.total_users || 0) - (stats.total_hosts || 0) },
            { id: 'admin', label: 'Administrators' }
          ].map((tab) => {
            const isActive = filters.user_type === tab.id;
            return (
              <button
                key={tab.label}
                onClick={() => handleFilterChange('user_type', tab.id)}
                className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-150 flex items-center gap-2 rounded-t-lg ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-150 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search users by name, email or phone..."
                className="w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
              />
              <FiSearch className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Page size:</span>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <FiFilter className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Users Table (hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">
              Users List <span className="text-gray-500 font-normal text-xs ml-2">({pagination?.totalItems || 0} matching)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">HMS License</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Auto Accept</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-150">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profile_image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={user.profile_image}
                                alt={`${user.first_name} ${user.last_name}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                                <span className="text-xs font-extrabold text-blue-600">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                              <span>{user.first_name} {user.last_name}</span>
                              {user.user_type === 'property_owner' && (
                                user.owner_verified ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200" title="Verified Host">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Pending Verification">
                                    Pending Verify
                                  </span>
                                )
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserTypeBadge(user.user_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.user_type === 'property_owner' ? (
                          <div className="flex flex-col items-start">
                            <select
                              value={user.hms_status || 'inactive'}
                              onChange={(e) => handleToggleHMSStatus(user, e.target.value)}
                              className={`text-xs font-bold rounded-full px-2.5 py-1 outline-none cursor-pointer border focus:ring-1 focus:ring-blue-500 max-w-[110px] ${
                                user.hms_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                user.hms_status === 'trialing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                user.hms_status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              <option value="inactive">INACTIVE</option>
                              <option value="active">ACTIVE</option>
                              <option value="trialing">TRIALING</option>
                              <option value="expired">EXPIRED</option>
                            </select>
                            {getHMSRemainingText(user) && (
                              <span className="text-[10px] text-gray-400 mt-1 ml-1 font-semibold">
                                {getHMSRemainingText(user)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.user_type === 'property_owner' ? (
                          <label
                            className="relative inline-flex items-center cursor-pointer"
                            title={user.auto_accept_bookings ? 'Auto Accept: ON' : 'Auto Accept: OFF'}
                          >
                            <input
                              type="checkbox"
                              checked={!!user.auto_accept_bookings}
                              onChange={() => handleToggleAutoAccept(user)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-semibold">
                        {formatDate(user.last_login_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-semibold">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 text-gray-550 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-gray-550 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <FiEdit className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleBlockUser(user.id, !user.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_active
                                ? 'text-gray-550 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-550 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.is_active ? 'Block User' : 'Unblock User'}
                          >
                            {user.is_active ? (
                              <FiShieldOff className="h-4.5 w-4.5" />
                            ) : (
                              <FiShield className="h-4.5 w-4.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-gray-900 font-bold">No users found</p>
                        <p className="text-xs">Adjust your search parameters and try again</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards List (hidden on desktop) */}
        <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {user.profile_image ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover border border-gray-150"
                        src={user.profile_image}
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                        <span className="text-base font-extrabold text-blue-600">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-950 flex items-center gap-1.5 flex-wrap">
                        {user.first_name} {user.last_name}
                      </h4>
                      <p className="text-xs text-gray-500 font-semibold">{user.email}</p>
                    </div>
                  </div>
                  <div>
                    {getUserTypeBadge(user.user_type)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-gray-100 py-3">
                  <div>
                    <span className="block text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Status</span>
                    {getStatusBadge(user.is_active)}
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Joined</span>
                    <span className="font-bold text-gray-700">{formatDate(user.created_at)}</span>
                  </div>
                  {user.user_type === 'property_owner' && (
                    <>
                      <div>
                        <span className="block text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Verification</span>
                        <div className="mt-0.5">
                          {user.owner_verified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Verify
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">HMS status</span>
                        <div className="mt-0.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            user.hms_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                            user.hms_status === 'trialing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            user.hms_status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {user.hms_status || 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  {user.user_type === 'property_owner' ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-500">Auto Accept:</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!user.auto_accept_bookings}
                          onChange={() => handleToggleAutoAccept(user)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <FiEye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <FiEdit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleBlockUser(user.id, !user.is_active)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.is_active
                          ? 'bg-gray-100 hover:bg-red-50 text-red-500 hover:text-red-700'
                          : 'bg-gray-100 hover:bg-green-50 text-green-500 hover:text-green-700'
                      }`}
                    >
                      {user.is_active ? <FiShieldOff className="h-3.5 w-3.5" /> : <FiShield className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              <FiSearch className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-950">No users found</p>
              <p className="text-xs">Adjust your search parameters</p>
            </div>
          )}
        </div>

        {/* Pagination Card */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border border-gray-200 rounded-xl bg-white flex items-center justify-between shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Showing <span className="font-bold text-gray-900">{((filters.page - 1) * filters.limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(filters.page * filters.limit, pagination.totalItems)}</span> of <span className="font-bold text-gray-900">{pagination.totalItems}</span> results
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Dynamically render page numbers */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => handleFilterChange('page', num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filters.page === num 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'border border-gray-200 text-gray-605 bg-white hover:bg-gray-55'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                  disabled={filters.page >= pagination.totalPages}
                  className="relative inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-55 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
            
            {/* Mobile Pagination */}
            <div className="flex-1 flex justify-between sm:hidden text-xs">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center font-bold text-gray-550">
                Page {filters.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                disabled={filters.page >= pagination.totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-y-auto transition-transform scale-100">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-extrabold text-gray-900">User Profile Details</h3>
                  {getUserTypeBadge(selectedUser.user_type)}
                </div>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Section 1: General Info */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">General & Contact Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Full Name</span>
                      <span className="text-sm font-bold text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Account Status</span>
                      <div className="mt-0.5">{getStatusBadge(selectedUser.is_active)}</div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Email Address</span>
                      <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                        {selectedUser.email}
                        {selectedUser.email_verified_at ? (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-green-200">
                            Unverified
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Phone Number</span>
                      <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                        {selectedUser.phone || 'Not provided'}
                        {selectedUser.phone && (selectedUser.phone_verified_at ? (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Unverified
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Address Info & Bio */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Address & Bio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="md:col-span-2">
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Bio</span>
                      <p className="text-sm text-gray-750 italic">{selectedUser.bio || 'No bio provided'}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Address</span>
                      <span className="text-sm text-gray-900 font-medium">{selectedUser.address || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Location details</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {[selectedUser.city, selectedUser.state, selectedUser.country, selectedUser.postal_code].filter(Boolean).join(', ') || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Business Details (Property Owners Only) */}
                {selectedUser.user_type === 'property_owner' && (
                  <>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Business Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Business Name</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.business_name || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Verification Status</span>
                          <div className="mt-0.5">
                            {selectedUser.owner_verified ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                Verified Host
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Pending Verification
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Business License No.</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.business_license || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Tax ID / TIN</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.tax_id || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">HMS Mode Status</span>
                          <span className="text-sm font-bold text-gray-900 capitalize">{selectedUser.hms_status || 'Inactive'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Commission Rate</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.commission_rate !== null && selectedUser.commission_rate !== undefined ? `${selectedUser.commission_rate}%` : '0%'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Payout & Banking Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Bank Name</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.bank_name || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Account Number</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.bank_account_number || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold text-gray-455 uppercase">Routing Number</span>
                          <span className="text-sm font-bold text-gray-900">{selectedUser.bank_routing_number || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Section 4: System Log details */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">System Log Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Last Login At</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.last_login_at)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-455 uppercase">Member Since</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside View Details */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-55 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseModals();
                    handleEditUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FiEdit className="mr-2" />
                  Edit & Verify Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative mx-auto p-6 border w-full max-w-lg shadow-2xl rounded-2xl bg-white transition-all scale-100">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editFormData.first_name}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editFormData.last_name}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <select
                    name="user_type"
                    value={editFormData.user_type}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="guest">Guest</option>
                    <option value="property_owner">Property Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {editFormData.user_type === 'property_owner' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="auto_accept_bookings"
                            checked={editFormData.auto_accept_bookings}
                            onChange={handleEditFormChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Auto Accept Bookings</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="owner_verified"
                            checked={editFormData.owner_verified}
                            onChange={handleEditFormChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Verified Host</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">HMS Status</label>
                      <select
                        name="hms_status"
                        value={editFormData.hms_status}
                        onChange={handleEditFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FiSave className="inline mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;