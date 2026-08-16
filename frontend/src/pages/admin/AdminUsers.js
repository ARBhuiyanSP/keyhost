import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiEye, FiEdit, FiShield, FiShieldOff, FiX, FiSave, FiUsers, FiBriefcase, FiUserCheck, FiActivity, FiLogIn, FiHome, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import usePermission from '../../hooks/usePermission';
import { getImageUrl } from '../../utils/imageUrl';

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

// Which roles can see each permission GROUP (admin always sees everything)
const ROLE_GROUP_VISIBILITY = {
  property_management: ['property_owner'],
  booking_management:  ['property_owner', 'guest'],
  hms_operations:      ['property_owner'],
  financial_management:['property_owner', 'guest'],
  communication_support:['property_owner', 'guest'],
  user_management:     ['property_owner', 'guest'],
  analytics_reports:   ['property_owner'],
};

// Resource-level overrides — keys not listed are inherited from the group rule above
const ROLE_RESOURCE_VISIBILITY = {
  // Booking group: calendar/ical are host-only
  calendar:           ['property_owner'],
  ical:               ['property_owner'],
  // Financial group: earnings/payouts/deposits are host-only; refunds apply to both
  earnings:           ['property_owner'],
  payouts:            ['property_owner'],
  security_deposits:  ['property_owner'],
  // Communication group: contact_messages are admin/host only
  contact_messages:   ['property_owner'],
  // User management group: users/roles are admin-only; staff is host-only; rewards is guest+host
  users:              [],   // admin only — hidden in per-user modal (admin sees all)
  roles:              [],   // admin only
  staff:              ['property_owner'],
  rewards:            ['property_owner', 'guest'],
};

/**
 * Returns the filtered PERMISSION_GROUPS relevant to a given role.
 * Admin always gets ALL groups unfiltered.
 */
const getGroupsForRole = (userType) => {
  // Always return all permission groups and resources for all users
  return PERMISSION_GROUPS;
};

const AdminUsers = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [filters, setFilters] = useState({
    user_type: '',
    search: '',
    page: 1,
    limit: 10
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const searchTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleFilterChange('search', val);
    }, 300);
  };

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
  const { data: usersData, isLoading, isFetching, refetch } = useQuery(
    ['admin-users', filters],
    () => api.get(`/admin/users?${new URLSearchParams(filters).toString()}`),
    {
      keepPreviousData: true,
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

  const [permissionsUser, setPermissionsUser] = useState(null);
  const [permissionsData, setPermissionsData] = useState({});

  const getInitialPermissions = (user) => {
    const initial = {};
    // Prefer the user's individual platform_permissions if they exist;
    // otherwise fall back to the role-default permissions from the DB.
    const current = user.platform_permissions;
    const roleDefault = rolesData?.find(r => r.role === user.user_type)?.permissions || {};

    const groups = getGroupsForRole(user.user_type);
    groups.forEach(group => {
      group.resources.forEach(res => {
        res.actions.forEach(act => {
          if (current && typeof current === 'object') {
            initial[act.key] = current[act.key] === true;
          } else {
            // No individual override — show the role defaults
            initial[act.key] = roleDefault[act.key] === true;
          }
        });
      });
    });
    return initial;
  };

  const handleManagePermissions = (user) => {
    setPermissionsUser(user);
    setPermissionsData(getInitialPermissions(user));
  };

  const handleSavePermissions = async () => {
    try {
      const response = await api.put(`/admin/users/${permissionsUser.id}/platform-permissions`, {
        platform_permissions: permissionsData
      });

      if (response.data?.success) {
        showSuccess('Platform permissions updated successfully!');
        setPermissionsUser(null);
        refetch();
      } else {
        showError(response.data?.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error saving platform permissions:', error);
      showError('Failed to save permissions. Please try again.');
    }
  };

  // Fetch all platform roles (system + custom)
  const { data: rolesData, refetch: refetchRoles } = useQuery(
    'admin-roles',
    async () => {
      const response = await api.get('/admin/roles');
      return response.data?.data?.roles || [];
    }
  );

  const handleRestoreUserDefaults = async () => {
    try {
      const confirmed = window.confirm('Are you sure you want to restore this user to global role default permissions? This will clear all custom overrides.');
      if (!confirmed) return;

      const response = await api.put(`/admin/users/${permissionsUser.id}/platform-permissions`, {
        platform_permissions: null
      });

      if (response.data?.success) {
        showSuccess('User permissions restored to global defaults!');
        setPermissionsUser(null);
        refetch();
      } else {
        showError(response.data?.message || 'Failed to restore default permissions');
      }
    } catch (error) {
      console.error('Error restoring default permissions:', error);
      showError('Failed to restore default permissions. Please try again.');
    }
  };

  const location = useLocation();

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleImpersonateUser = async (user) => {
    try {
      const isHost = user.user_type === 'property_owner';
      const roleText = isHost ? 'Host' : 'Guest';
      const confirmed = window.confirm(`Are you sure you want to switch to ${user.first_name}'s ${roleText} account?`);
      if (!confirmed) return;

      const response = await api.post(`/admin/users/${user.id}/impersonate`);
      if (response.data?.success) {
        const { token, refreshToken, user: targetUser } = response.data.data;
        
        // 1. Back up current admin auth storage
        const currentAdminAuth = localStorage.getItem('auth-storage');
        localStorage.setItem('admin-impersonator-auth', currentAdminAuth);

        // 2. Set new auth storage for target user
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: targetUser,
            isAuthenticated: true,
            token: token,
            refreshToken: refreshToken
          },
          version: 0
        }));

        // 3. Set dashboard mode to host or guest
        if (targetUser.user_type === 'property_owner') {
          localStorage.setItem('dashboard_role_mode', 'host');
        } else {
          localStorage.setItem('dashboard_role_mode', 'guest');
        }

        showSuccess(`Switched to ${targetUser.first_name}'s account successfully!`);

        // 4. Redirect to appropriate dashboard
        setTimeout(() => {
          if (targetUser.user_type === 'property_owner') {
            window.location.href = '/property-owner';
          } else {
            window.location.href = '/guest';
          }
        }, 800);
      } else {
        showError(response.data?.message || 'Failed to switch user account');
      }
    } catch (error) {
      console.error('Error switching user:', error);
      showError(error.response?.data?.message || 'Failed to switch user account. Please try again.');
    }
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
    const matchedRole = rolesData?.find(r => r.role === userType);
    const displayName = matchedRole ? matchedRole.display_name : userType;

    const colors = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
      property_owner: 'bg-blue-50 text-blue-700 border-blue-200',
      guest: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      staff: 'bg-amber-50 text-amber-700 border-amber-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${colors[userType] || 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
        {displayName}
      </span>
    );
  };

  const getCardAccentClass = (userType) => {
    switch (userType) {
      case 'admin': return 'border-l-4 border-l-purple-500';
      case 'property_owner': return 'border-l-4 border-l-blue-500';
      case 'guest': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  // Compute role-filtered groups for the currently open permissions modal
  const activePermGroups = permissionsUser ? getGroupsForRole(permissionsUser.user_type) : [];
  const activePermResources = activePermGroups.flatMap(g => g.resources);

  if (isLoading) return <LoadingSpinner />;

  const { users = [], pagination = {}, stats = {} } = usersData || {};

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {permissionsUser ? (
          /* Redesigned Custom Permissions Checklist view */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 animate-fade-in">
            {/* Header / Sub actions */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPermissionsUser(null)}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1.5 transition active:scale-95 bg-teal-50 px-3 py-1.5 rounded-lg"
              >
                <FiArrowLeft className="h-4 w-4" />
                Back to Users
              </button>
              <div className="text-xs font-bold text-gray-500">
                Customizing Permissions for: <span className="text-teal-700 uppercase font-black">{permissionsUser.first_name} {permissionsUser.last_name}</span> ({permissionsUser.email})
              </div>
            </div>

            {/* Context Banner */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div>
                <span className="text-slate-500 font-semibold">Base Role: </span>
                <span className="font-bold text-slate-900 capitalize">{permissionsUser.user_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="check-all-platform"
                  checked={Object.values(permissionsData).every(v => v === true)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const updated = {};
                    Object.keys(permissionsData).forEach(k => {
                      updated[k] = checked;
                    });
                    setPermissionsData(updated);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition duration-150"
                />
                <label htmlFor="check-all-platform" className="text-xs font-extrabold text-red-600 cursor-pointer select-none">Check All Permissions</label>
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
                          checked={activePermResources.every(res => {
                            const readAct = res.actions.find(a => a.key.endsWith('.read'));
                            return !readAct || !!permissionsData[readAct.key];
                          })}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updated = { ...permissionsData };
                            activePermResources.forEach(res => {
                              const readAct = res.actions.find(a => a.key.endsWith('.read'));
                              if (readAct) updated[readAct.key] = val;
                            });
                            setPermissionsData(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition duration-150"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[9px] font-extrabold tracking-widest text-slate-400">Edit / Create</span>
                        <input
                          type="checkbox"
                          checked={activePermResources.every(res => {
                            const editAct = res.actions.find(a => a.key.endsWith('.create_update'));
                            return !editAct || !!permissionsData[editAct.key];
                          })}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updated = { ...permissionsData };
                            activePermResources.forEach(res => {
                              const editAct = res.actions.find(a => a.key.endsWith('.create_update'));
                              if (editAct) updated[editAct.key] = val;
                            });
                            setPermissionsData(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition duration-150"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[9px] font-extrabold tracking-widest text-slate-400">Delete</span>
                        <input
                          type="checkbox"
                          checked={activePermResources.every(res => {
                            const delAct = res.actions.find(a => a.key.endsWith('.delete'));
                            return !delAct || !!permissionsData[delAct.key];
                          })}
                          onChange={(e) => {
                            const val = e.target.checked;
                            const updated = { ...permissionsData };
                            activePermResources.forEach(res => {
                              const delAct = res.actions.find(a => a.key.endsWith('.delete'));
                              if (delAct) updated[delAct.key] = val;
                            });
                            setPermissionsData(updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition duration-150"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activePermGroups.map((group) => {
                    const groupResourceKeys = group.resources.flatMap(r => r.actions.map(a => a.key));
                    const isGroupAllChecked = groupResourceKeys.every(k => permissionsData[k] === true);

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
                                    checked={isGroupAllChecked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const updated = { ...permissionsData };
                                      groupResourceKeys.forEach(k => {
                                        updated[k] = checked;
                                      });
                                      setPermissionsData(updated);
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer"
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
                                      checked={!!permissionsData[readAct.key]}
                                      onChange={(e) => {
                                        setPermissionsData(prev => ({
                                          ...prev,
                                          [readAct.key]: e.target.checked
                                        }));
                                      }}
                                      className="w-4.5 h-4.5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition-all duration-150"
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
                                      checked={!!permissionsData[editAct.key]}
                                      onChange={(e) => {
                                        setPermissionsData(prev => ({
                                          ...prev,
                                          [editAct.key]: e.target.checked
                                        }));
                                      }}
                                      className="w-4.5 h-4.5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition-all duration-150"
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
                                      checked={!!permissionsData[delAct.key]}
                                      onChange={(e) => {
                                        setPermissionsData(prev => ({
                                          ...prev,
                                          [delAct.key]: e.target.checked
                                        }));
                                      }}
                                      className="w-4.5 h-4.5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer transition-all duration-150"
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
            <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRestoreUserDefaults}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1 active:scale-95"
              >
                Restore Role Defaults
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPermissionsUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-55 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-6 py-2 bg-[#004e59] hover:bg-[#003840] text-white rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <FiSave className="h-4 w-4" />
                  Save Custom Overrides
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
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
            <div className="relative w-full sm:max-w-md group">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search users by name, email or phone..."
                className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm hover:border-gray-300"
              />
              <FiSearch className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Page size:</span>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm bg-white transition-all duration-200 hover:border-gray-300"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 active:scale-95 disabled:bg-blue-400"
              >
                <FiFilter className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </button>
              {can('roles.read') && (
                <button
                  onClick={() => navigate('/admin/role-permissions')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <FiShield className="h-4 w-4" />
                  Role Defaults
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Users Table (hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative">
          {/* Subtle loading line at the top of the table container */}
          <div 
            className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ${
              isFetching ? 'opacity-100 animate-pulse translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
            style={{ zIndex: 10 }}
          />

          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">
              Users List <span className="text-gray-500 font-normal text-xs ml-2">({pagination?.totalItems || 0} matching)</span>
            </h2>
          </div>

          <div className={`overflow-x-auto transition-all duration-300 ${isFetching ? 'opacity-65 pointer-events-none filter blur-[0.5px]' : 'opacity-100'}`}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">HMS License</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Auto Accept</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Last Login</th>
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
                                src={getImageUrl(user.profile_image)}
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
                              {getUserTypeBadge(user.user_type)}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                        {user.phone || <span className="text-gray-400 font-normal italic">N/A</span>}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          {user.user_type !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleImpersonateUser(user)}
                                className="p-2 text-gray-550 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Switch to User Account"
                              >
                                <FiLogIn className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleManagePermissions(user)}
                                className="p-2 text-gray-550 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Edit Platform Permissions"
                              >
                                <FiShield className="h-4.5 w-4.5" />
                              </button>
                            </>
                          )}
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
                    <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
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
        <div className={`grid grid-cols-1 gap-4 md:hidden mb-6 transition-all duration-300 ${isFetching ? 'opacity-65 pointer-events-none filter blur-[0.5px]' : 'opacity-100'}`}>
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4 hover:shadow-md transition-all duration-200 ${getCardAccentClass(user.user_type)}`}>
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
                      {user.phone && <p className="text-xs text-gray-600 font-semibold mt-0.5">{user.phone}</p>}
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
                    {(user.user_type === 'property_owner' || user.user_type === 'guest') && (
                      <>
                        <button
                          onClick={() => handleImpersonateUser(user)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 hover:text-indigo-855 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <FiLogIn className="h-3.5 w-3.5" /> Switch
                        </button>
                        <button
                          onClick={() => handleManagePermissions(user)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-650 hover:text-purple-855 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <FiShield className="h-3.5 w-3.5" /> Perms
                        </button>
                      </>
                    )}
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
        </>
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
                  <label className="block text-sm font-medium text-gray-700">User Type / Role</label>
                  <select
                    name="user_type"
                    value={editFormData.user_type}
                    onChange={handleEditFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    required
                  >
                    {rolesData?.map(roleItem => (
                      <option key={roleItem.role} value={roleItem.role}>
                        {roleItem.display_name}
                      </option>
                    ))}
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