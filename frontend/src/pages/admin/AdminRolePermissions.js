import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiShield, FiUsers, FiHome, FiArrowLeft, FiX, FiSave, FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import usePermission from '../../hooks/usePermission';

const PERMISSION_GROUPS = [
  {
    groupKey: 'property_management',
    groupName: '🏠 Property & Catalog Management',
    description: 'Control property listings, unit types, amenities, categories, and promotional coupons.',
    resources: [
      {
        key: 'properties',
        label: 'Properties & Units',
        description: 'Add properties, view listings, update property specs, upload photos.',
        actions: [
          { key: 'properties.read', label: 'Read' },
          { key: 'properties.create_update', label: 'Edit' },
          { key: 'properties.delete', label: 'Delete' }
        ]
      },
      {
        key: 'property_types',
        label: 'Property Types',
        description: 'Manage property types (Hotel, Apartment, Villa, Resort, Guest House).',
        actions: [
          { key: 'property_types.read', label: 'Read' },
          { key: 'property_types.create_update', label: 'Edit' },
          { key: 'property_types.delete', label: 'Delete' }
        ]
      },
      {
        key: 'amenities',
        label: 'Amenities Catalog',
        description: 'Manage property amenities, room features, and facility tags.',
        actions: [
          { key: 'amenities.read', label: 'Read' },
          { key: 'amenities.create_update', label: 'Edit' },
          { key: 'amenities.delete', label: 'Delete' }
        ]
      },
      {
        key: 'display_categories',
        label: 'Display Categories',
        description: 'Configure featured collection tags, homepage categories, and display filters.',
        actions: [
          { key: 'display_categories.read', label: 'Read' },
          { key: 'display_categories.create_update', label: 'Edit' },
          { key: 'display_categories.delete', label: 'Delete' }
        ]
      },
      {
        key: 'coupons',
        label: 'Coupons & Discounts',
        description: 'Create discount codes, set promotional offers, manage validity dates.',
        actions: [
          { key: 'coupons.read', label: 'Read' },
          { key: 'coupons.create_update', label: 'Edit' },
          { key: 'coupons.delete', label: 'Delete' }
        ]
      }
    ]
  },
  {
    groupKey: 'booking_management',
    groupName: '📅 Bookings, PMS & Calendar Sync',
    description: 'Manage reservations, rates availability calendar, checkins/checkouts, and iCal sync.',
    resources: [
      {
        key: 'bookings',
        label: 'Bookings & Reservations',
        description: 'View reservations, create manual bookings, modify dates, cancel checkins.',
        actions: [
          { key: 'bookings.read', label: 'Read' },
          { key: 'bookings.create_update', label: 'Edit' },
          { key: 'bookings.delete', label: 'Delete' }
        ]
      },
      {
        key: 'calendar',
        label: 'Rates & Availability Calendar',
        description: 'View calendar rates, override daily pricing, block room availability.',
        actions: [
          { key: 'calendar.read', label: 'Read' },
          { key: 'calendar.create_update', label: 'Edit' }
        ]
      },
      {
        key: 'ical',
        label: 'iCal Channel Manager Sync',
        description: 'Export and import external calendar feeds (Airbnb, Booking.com, Agoda).',
        actions: [
          { key: 'ical.read', label: 'Read' },
          { key: 'ical.create_update', label: 'Edit' },
          { key: 'ical.delete', label: 'Delete' }
        ]
      }
    ]
  },
  {
    groupKey: 'hms_operations',
    groupName: '🏨 HMS Hotel Operations',
    description: 'Hotel room inventory, housekeeping tasks, maintenance logs, and property HR.',
    resources: [
      {
        key: 'hms_rooms',
        label: 'HMS Rooms & Inventory',
        description: 'Setup hotel rooms, set floor numbers, configure room types & pricing.',
        actions: [
          { key: 'hms_rooms.read', label: 'Read' },
          { key: 'hms_rooms.create_update', label: 'Edit' },
          { key: 'hms_rooms.delete', label: 'Delete' }
        ]
      },
      {
        key: 'hms_housekeeping',
        label: 'Housekeeping & Maintenance',
        description: 'Assign cleaning tasks, track room status (Clean, Dirty, OOO), log maintenance.',
        actions: [
          { key: 'hms_housekeeping.read', label: 'Read' },
          { key: 'hms_housekeeping.create_update', label: 'Edit' },
          { key: 'hms_housekeeping.delete', label: 'Delete' }
        ]
      },
      {
        key: 'hms_accounts',
        label: 'HMS Accounting & Vouchers',
        description: 'Record petty cash, manage hotel income/expense ledgers, print vouchers.',
        actions: [
          { key: 'hms_accounts.read', label: 'Read' },
          { key: 'hms_accounts.create_update', label: 'Edit' },
          { key: 'hms_accounts.delete', label: 'Delete' }
        ]
      },
      {
        key: 'hms_hr',
        label: 'HMS Staff & Employees',
        description: 'Manage property staff employees, shifts, duty rosters, and HR records.',
        actions: [
          { key: 'hms_hr.read', label: 'Read' },
          { key: 'hms_hr.create_update', label: 'Edit' },
          { key: 'hms_hr.delete', label: 'Delete' }
        ]
      }
    ]
  },
  {
    groupKey: 'financial_management',
    groupName: '💰 Financials, Earnings & Payouts',
    description: 'Track revenue, invoices, host payouts, refunds, and security deposits.',
    resources: [
      {
        key: 'earnings',
        label: 'Earnings & Revenue Ledgers',
        description: 'View total earnings, gross payouts, platform commission breakdowns.',
        actions: [
          { key: 'earnings.read', label: 'Read' },
          { key: 'earnings.create_update', label: 'Edit' },
          { key: 'earnings.delete', label: 'Delete' }
        ]
      },
      {
        key: 'payouts',
        label: 'Host Owner Payouts',
        description: 'Process host withdrawal requests, approve bank transfers, view history.',
        actions: [
          { key: 'payouts.read', label: 'Read' },
          { key: 'payouts.create_update', label: 'Edit' },
          { key: 'payouts.delete', label: 'Delete' }
        ]
      },
      {
        key: 'refunds',
        label: 'Refund Processing',
        description: 'Review guest refund applications, disburse bKash/Nagad/Cards refunds.',
        actions: [
          { key: 'refunds.read', label: 'Read' },
          { key: 'refunds.create_update', label: 'Edit' }
        ]
      },
      {
        key: 'security_deposits',
        label: 'Security Deposits',
        description: 'Manage hold balances, process damage claims, release guest deposits.',
        actions: [
          { key: 'security_deposits.read', label: 'Read' },
          { key: 'security_deposits.create_update', label: 'Edit' }
        ]
      }
    ]
  },
  {
    groupKey: 'communication_support',
    groupName: '💬 Messages, Support & Reviews',
    description: 'Manage customer communications, support ticket resolution, and review ratings.',
    resources: [
      {
        key: 'messages',
        label: 'Direct Messaging & Chat',
        description: 'Send and receive guest-host messages, view conversation threads.',
        actions: [
          { key: 'messages.read', label: 'Read' },
          { key: 'messages.create_update', label: 'Edit' }
        ]
      },
      {
        key: 'support',
        label: 'Support Tickets',
        description: 'View support tickets, update ticket statuses, respond to customer cases.',
        actions: [
          { key: 'support.read', label: 'Read' },
          { key: 'support.create_update', label: 'Edit' },
          { key: 'support.delete', label: 'Delete' }
        ]
      },
      {
        key: 'contact_messages',
        label: 'Contact Inquiries',
        description: 'Read public contact inquiry messages, reply via email or SMS.',
        actions: [
          { key: 'contact_messages.read', label: 'Read' },
          { key: 'contact_messages.create_update', label: 'Edit' },
          { key: 'contact_messages.delete', label: 'Delete' }
        ]
      },
      {
        key: 'reviews',
        label: 'Reviews & Feedback',
        description: 'Moderate guest reviews, reply to ratings, manage review approvals.',
        actions: [
          { key: 'reviews.read', label: 'Read' },
          { key: 'reviews.create_update', label: 'Edit' },
          { key: 'reviews.delete', label: 'Delete' }
        ]
      }
    ]
  },
  {
    groupKey: 'user_management',
    groupName: '👥 Users, Roles & Rewards',
    description: 'Manage user profiles, account permissions, host staff, and loyalty points.',
    resources: [
      {
        key: 'users',
        label: 'Users & Accounts',
        description: 'View user profiles, edit account details, verify host IDs, block accounts.',
        actions: [
          { key: 'users.read', label: 'Read' },
          { key: 'users.create_update', label: 'Edit' },
          { key: 'users.delete', label: 'Delete' }
        ]
      },
      {
        key: 'roles',
        label: 'Role Permissions & Defaults',
        description: 'Add custom roles, edit role permissions, configure global default sets.',
        actions: [
          { key: 'roles.read', label: 'Read' },
          { key: 'roles.create_update', label: 'Edit' },
          { key: 'roles.delete', label: 'Delete' }
        ]
      },
      {
        key: 'staff',
        label: 'Host Staff Members',
        description: 'Add host staff, assign custom staff permissions, view staff logs.',
        actions: [
          { key: 'staff.read', label: 'Read' },
          { key: 'staff.create_update', label: 'Edit' },
          { key: 'staff.delete', label: 'Delete' }
        ]
      },
      {
        key: 'rewards',
        label: 'Rewards & Loyalty Points',
        description: 'View point transactions, adjust points balances, set redemption rules.',
        actions: [
          { key: 'rewards.read', label: 'Read' },
          { key: 'rewards.create_update', label: 'Edit' }
        ]
      }
    ]
  },
  {
    groupKey: 'analytics_reports',
    groupName: '📊 Analytics & Platform Reports',
    description: 'Platform performance dashboards, financial reports, host reports, occupancy stats.',
    resources: [
      {
        key: 'analytics',
        label: 'Analytics Dashboard',
        description: 'View platform growth charts, booking trends, user conversion stats.',
        actions: [
          { key: 'analytics.read', label: 'Read' }
        ]
      },
      {
        key: 'reports',
        label: 'Platform & Financial Reports',
        description: 'Generate occupancy reports, payout reports, cancellation statistics.',
        actions: [
          { key: 'reports.read', label: 'Read' },
          { key: 'reports.create_update', label: 'Edit' }
        ]
      }
    ]
  }
];

const ALL_RESOURCES = PERMISSION_GROUPS.flatMap(g => g.resources);

const ROLE_GROUP_VISIBILITY = {
  property_management: ['property_owner'],
  booking_management:  ['property_owner', 'guest'],
  hms_operations:      ['property_owner'],
  financial_management:['property_owner', 'guest'],
  communication_support:['property_owner', 'guest'],
  user_management:     ['property_owner', 'guest'],
  analytics_reports:   ['property_owner'],
};

const ROLE_RESOURCE_VISIBILITY = {
  calendar:           ['property_owner'],
  ical:               ['property_owner'],
  earnings:           ['property_owner'],
  payouts:            ['property_owner'],
  security_deposits:  ['property_owner'],
  contact_messages:   ['property_owner'],
  users:              [],
  roles:              [],
  staff:              ['property_owner'],
  rewards:            ['property_owner', 'guest'],
};

const getGroupsForRole = (userType) => {
  // Always return all permission groups and resources for all roles
  return PERMISSION_GROUPS;
};

const AdminRolePermissions = () => {
  const { showSuccess, showError } = useToast();
  const { can } = usePermission();
  const [defaultsViewMode, setDefaultsViewMode] = useState('list'); // 'list' | 'edit'
  const [defaultsActiveTab, setDefaultsActiveTab] = useState('property_owner');
  const [defaultsFormData, setDefaultsFormData] = useState({});

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleKey, setNewRoleKey] = useState('');

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null); // { role, display_name }
  const [renameValue, setRenameValue] = useState('');

  // Fetch all platform roles
  const { data: rolesData = [], isLoading, refetch: refetchRoles } = useQuery(
    'admin-roles-page',
    async () => {
      const response = await api.get('/admin/roles');
      return response.data?.data?.roles || [];
    }
  );

  const handleSelectRoleForEdit = (role) => {
    setDefaultsActiveTab(role);
    const matchedRole = rolesData?.find(r => r.role === role);
    setDefaultsFormData(matchedRole?.permissions || {});
    setDefaultsViewMode('edit');
  };

  const handleSaveDefaults = async () => {
    try {
      const response = await api.put(`/admin/roles/${defaultsActiveTab}`, {
        permissions: defaultsFormData
      });

      if (response.data?.success) {
        showSuccess('Role permissions defaults updated successfully!');
        refetchRoles();
        setDefaultsViewMode('list');
      } else {
        showError(response.data?.message || 'Failed to update defaults');
      }
    } catch (error) {
      console.error('Error saving default permissions:', error);
      showError('Failed to save default permissions. Please try again.');
    }
  };

  const handleCreateCustomRole = async () => {
    if (!newRoleKey || !newRoleName) {
      showError('Please fill in both Role ID and Display Name.');
      return;
    }
    try {
      const response = await api.post('/admin/roles', {
        role: newRoleKey,
        display_name: newRoleName,
        permissions: {}
      });
      if (response.data?.success) {
        showSuccess('Custom role created successfully!');
        refetchRoles();
        setShowCreateRoleModal(false);
        setNewRoleKey('');
        setNewRoleName('');
      } else {
        showError(response.data?.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showError('Failed to create role. Please try again.');
    }
  };

  const handleDeleteCustomRole = async (roleKey) => {
    const confirmed = window.confirm(`Are you sure you want to delete custom role '${roleKey}'? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      const response = await api.delete(`/admin/roles/${roleKey}`);
      if (response.data?.success) {
        showSuccess('Custom role deleted successfully!');
        refetchRoles();
      } else {
        showError(response.data?.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showError('Failed to delete role. Please try again.');
    }
  };

  const handleOpenRenameModal = (roleItem) => {
    setRenameTarget(roleItem);
    setRenameValue(roleItem.display_name);
    setShowRenameModal(true);
  };

  const handleRenameRole = async () => {
    if (!renameValue.trim()) {
      showError('Display name cannot be empty.');
      return;
    }
    try {
      const response = await api.put(`/admin/roles/${renameTarget.role}`, {
        display_name: renameValue.trim()
      });
      if (response.data?.success) {
        showSuccess('Role display name updated successfully!');
        refetchRoles();
        setShowRenameModal(false);
        setRenameTarget(null);
        setRenameValue('');
      } else {
        showError(response.data?.message || 'Failed to rename role');
      }
    } catch (error) {
      console.error('Error renaming role:', error);
      showError('Failed to rename role. Please try again.');
    }
  };

  // Compute active groups for selected role
  const activePermGroups = defaultsActiveTab ? getGroupsForRole(defaultsActiveTab) : [];
  const activePermResources = activePermGroups.flatMap(g => g.resources);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <FiShield className="h-6 w-6 text-teal-600" />
              Rolewise Default Permissions Configuration
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              Manage module-level global permission default configurations across platform roles.
            </p>
          </div>
          {defaultsViewMode === 'list' && can('roles.create_update') && (
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="bg-[#004e59] hover:bg-[#003840] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <FiPlus className="h-4.5 w-4.5" />
              Add Custom Role
            </button>
          )}
        </div>

        {defaultsViewMode === 'list' ? (
          /* List-based view of system + custom roles */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-250 text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Role Key / Display Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Active Users</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white text-sm">
                {rolesData.map((roleItem) => (
                  <tr key={roleItem.role} className="hover:bg-gray-50/50 transition-colors">
                    {/* Role / Display Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-lg ${
                          roleItem.is_custom 
                            ? 'bg-purple-50 text-purple-600' 
                            : roleItem.role === 'guest' 
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-teal-50 text-[#004e59]'
                        }`}>
                          {roleItem.role === 'guest' ? <FiUsers className="h-5 w-5" /> : <FiHome className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 uppercase flex items-center gap-2">
                            {roleItem.display_name}
                            <span className={`text-[8px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-full ${
                              roleItem.is_custom 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {roleItem.is_custom ? 'custom' : 'system'}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold mt-0.5 select-all">
                            key: {roleItem.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Description */}
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {roleItem.role === 'guest' 
                          ? 'Default guest traveler role. Allows browsing properties, making reservations, managing reviews, messages, and reward programs.'
                          : roleItem.role === 'property_owner'
                          ? 'Default property owner / host role. Enables property listing, PMS bookings management, calendar configurations, earnings, and staffs.'
                          : roleItem.role === 'staff'
                          ? 'Default HMS property employee role. Permissions are inherited from host configurations and staff employee roster sets.'
                          : `Custom administrative platform role. Configured by administrator with tailored module-level CRUD permissions overrides.`}
                      </p>
                    </td>

                    {/* Active Users */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                        {roleItem.user_count} users
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      <button
                        onClick={() => handleSelectRoleForEdit(roleItem.role)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 ${
                          roleItem.is_custom
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            : roleItem.role === 'guest'
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                            : 'bg-teal-50 text-[#004e59] hover:bg-teal-100 border border-teal-200'
                        } rounded-xl text-xs font-bold transition duration-200 active:scale-95`}
                      >
                        <FiShield className="h-3.5 w-3.5" />
                        {can('roles.create_update') ? 'Configure Defaults' : 'View Defaults'}
                      </button>

                      {/* Edit/Rename display name button */}
                      {can('roles.create_update') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRenameModal(roleItem);
                          }}
                          className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-[#004e59] hover:bg-teal-50 border border-transparent hover:border-teal-200 rounded-xl transition duration-200 active:scale-95"
                          title="Rename Display Name"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {roleItem.is_custom ? (
                        <button
                          disabled={!can('roles.delete')}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomRole(roleItem.role);
                          }}
                          className={`inline-flex items-center justify-center p-2 rounded-xl transition duration-200 active:scale-95 ${
                            can('roles.delete')
                              ? 'text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200'
                              : 'text-gray-200 cursor-not-allowed border border-transparent'
                          }`}
                          title={can('roles.delete') ? 'Delete Custom Role' : 'Missing delete permissions'}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center justify-center p-2 text-gray-200 cursor-not-allowed border border-transparent"
                          title="System roles cannot be deleted"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Checklist configuration interface */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            
            {/* Header / Sub actions */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDefaultsViewMode('list')}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1.5 transition active:scale-95 bg-teal-50 px-3 py-1.5 rounded-lg"
              >
                <FiArrowLeft className="h-4 w-4" />
                Back to Roles
              </button>
              <div className="text-xs font-bold text-gray-500">
                Configuring: <span className="text-teal-700 uppercase font-black">{rolesData.find(r => r.role === defaultsActiveTab)?.display_name}</span> Defaults
              </div>
            </div>

            {/* Permissions Matrix Checklist Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-1/2">Permission Group / Feature Module</th>
                    <th className="px-4 py-4 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[9px] font-extrabold tracking-widest text-slate-400">Read</span>
                        <input
                          type="checkbox"
                          disabled={!can('roles.create_update')}
                          checked={activePermResources.every(res => {
                            const readAct = res.actions.find(a => a.key.endsWith('.read'));
                            return !readAct || !!defaultsFormData[readAct.key];
                          })}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updated = { ...defaultsFormData };
                            activePermResources.forEach(res => {
                              const readAct = res.actions.find(a => a.key.endsWith('.read'));
                              if (readAct) updated[readAct.key] = val;
                            });
                            setDefaultsFormData(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition duration-150"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[9px] font-extrabold tracking-widest text-slate-400">Edit / Create</span>
                        <input
                          type="checkbox"
                          disabled={!can('roles.create_update')}
                          checked={activePermResources.every(res => {
                            const editAct = res.actions.find(a => a.key.endsWith('.create_update'));
                            return !editAct || !!defaultsFormData[editAct.key];
                          })}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updated = { ...defaultsFormData };
                            activePermResources.forEach(res => {
                              const editAct = res.actions.find(a => a.key.endsWith('.create_update'));
                              if (editAct) updated[editAct.key] = val;
                            });
                            setDefaultsFormData(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition duration-150"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[9px] font-extrabold tracking-widest text-slate-400">Delete</span>
                        <input
                          type="checkbox"
                          disabled={!can('roles.create_update')}
                          checked={activePermResources.every(res => {
                            const delAct = res.actions.find(a => a.key.endsWith('.delete'));
                            return !delAct || !!defaultsFormData[delAct.key];
                          })}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updated = { ...defaultsFormData };
                            activePermResources.forEach(res => {
                              const delAct = res.actions.find(a => a.key.endsWith('.delete'));
                              if (delAct) updated[delAct.key] = val;
                            });
                            setDefaultsFormData(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition duration-150"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activePermGroups.map((group) => {
                    const groupResourceKeys = group.resources.flatMap(r => r.actions.map(a => a.key));
                    const isGroupAllChecked = groupResourceKeys.every(k => defaultsFormData[k] === true);

                    return (
                      <React.Fragment key={group.groupKey}>
                        {/* Group Header */}
                        <tr className="bg-slate-50/50 border-y border-slate-100/80">
                          <td colSpan="4" className="px-6 py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-teal-600 rounded-full inline-block"></span>
                                <div>
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{group.groupName}</span>
                                  <span className="text-[10px] text-slate-500 ml-2.5 font-medium hidden sm:inline">({group.description})</span>
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`check-group-${group.groupKey}`}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                                    isGroupAllChecked 
                                      ? 'bg-teal-50 border-teal-200 text-teal-700' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  } text-[10px] font-extrabold cursor-pointer select-none transition-all active:scale-95`}
                                >
                                  <input
                                    type="checkbox"
                                    id={`check-group-${group.groupKey}`}
                                    disabled={!can('roles.create_update')}
                                    checked={isGroupAllChecked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const updated = { ...defaultsFormData };
                                      groupResourceKeys.forEach(k => {
                                        updated[k] = checked;
                                      });
                                      setDefaultsFormData(updated);
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                                  />
                                  Check Group All
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Resource Rows */}
                        {group.resources.map((res) => {
                          const readAct = res.actions.find(a => a.key.endsWith('.read'));
                          const editAct = res.actions.find(a => a.key.endsWith('.create_update'));
                          const delAct = res.actions.find(a => a.key.endsWith('.delete'));

                          return (
                            <tr key={res.key} className="hover:bg-slate-50/40 transition-colors duration-150">
                              <td className="px-6 py-4 pl-10">
                                <div className="text-xs font-bold text-slate-700">{res.label}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">{res.description}</div>
                              </td>
                              {/* Read */}
                              <td className="px-4 py-4 text-center border-l border-slate-100/50">
                                {readAct ? (
                                  <div className="flex justify-center">
                                    <input
                                      type="checkbox"
                                      disabled={!can('roles.create_update')}
                                      checked={!!defaultsFormData[readAct.key]}
                                      onChange={(e) => {
                                        setDefaultsFormData(prev => ({
                                          ...prev,
                                          [readAct.key]: e.target.checked
                                        }));
                                      }}
                                      className="w-4.5 h-4.5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition-all duration-150"
                                    />
                                  </div>
                                ) : (
                                  <span className="inline-block w-4 h-4 rounded-full bg-slate-100 text-slate-300 text-[10px] font-bold select-none leading-4">-</span>
                                )}
                              </td>
                              {/* Edit */}
                              <td className="px-4 py-4 text-center border-l border-slate-100/50">
                                {editAct ? (
                                  <div className="flex justify-center">
                                    <input
                                      type="checkbox"
                                      disabled={!can('roles.create_update')}
                                      checked={!!defaultsFormData[editAct.key]}
                                      onChange={(e) => {
                                        setDefaultsFormData(prev => ({
                                          ...prev,
                                          [editAct.key]: e.target.checked
                                        }));
                                      }}
                                      className="w-4.5 h-4.5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition-all duration-150"
                                    />
                                  </div>
                                ) : (
                                  <span className="inline-block w-4 h-4 rounded-full bg-slate-100 text-slate-300 text-[10px] font-bold select-none leading-4">-</span>
                                )}
                              </td>
                              {/* Delete */}
                              <td className="px-4 py-4 text-center border-l border-slate-100/50">
                                {delAct ? (
                                  <div className="flex justify-center">
                                    <input
                                      type="checkbox"
                                      disabled={!can('roles.create_update')}
                                      checked={!!defaultsFormData[delAct.key]}
                                      onChange={(e) => {
                                        setDefaultsFormData(prev => ({
                                          ...prev,
                                          [delAct.key]: e.target.checked
                                        }));
                                      }}
                                      className="w-4.5 h-4.5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed transition-all duration-150"
                                    />
                                  </div>
                                ) : (
                                  <span className="inline-block w-4 h-4 rounded-full bg-slate-100 text-slate-300 text-[10px] font-bold select-none leading-4">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Footer */}
            <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl border-t border-gray-150 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-gray-500">
                {!can('roles.create_update') && "⚠️ Read-only Mode: You do not have permissions to edit role configurations."}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDefaultsViewMode('list')}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition active:scale-95"
                >
                  {can('roles.create_update') ? 'Cancel' : 'Back'}
                </button>
                {can('roles.create_update') && (
                  <button
                    type="button"
                    onClick={handleSaveDefaults}
                    className="px-6 py-2 bg-[#004e59] hover:bg-[#003840] text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <FiSave className="h-4 w-4" />
                    Save Defaults
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Create Custom Role Popup Dialog */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-2xl bg-white scale-100 transition-all">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add Custom Platform Role</h3>
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role Key (Internal ID)</label>
                <input
                  type="text"
                  placeholder="e.g. billing_officer"
                  value={newRoleKey}
                  onChange={(e) => setNewRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Only lowercase letters, numbers, and underscores allowed.</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Billing Officer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-6 border-t border-gray-150 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowCreateRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomRole}
                className="px-6 py-2 bg-[#004e59] hover:bg-[#003840] text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Role Display Name Modal */}
      {showRenameModal && renameTarget && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative mx-auto p-6 border w-full max-w-sm shadow-2xl rounded-2xl bg-white scale-100 transition-all">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FiEdit2 className="h-4.5 w-4.5 text-teal-600" />
                Rename Role
              </h3>
              <button
                onClick={() => { setShowRenameModal(false); setRenameTarget(null); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Role Key (Read-only)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-mono select-all">
                  {renameTarget.role}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameRole(); }}
                  placeholder="Enter new display name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-6 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setShowRenameModal(false); setRenameTarget(null); }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameRole}
                className="px-5 py-2 bg-[#004e59] hover:bg-[#003840] text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <FiSave className="h-4 w-4" />
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRolePermissions;
