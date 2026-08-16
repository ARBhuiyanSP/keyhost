import useAuthStore from '../store/authStore';

const LEGACY_KEY_MAP = {
  'can_list_properties': 'properties.read',
  'can_use_pms': 'bookings.read',
  'can_use_calendar': 'calendar.read',
  'can_use_hms': 'hms_rooms.read',
  'can_view_earnings': 'earnings.read',
  'can_view_analytics': 'analytics.read',
  'can_manage_reviews': 'reviews.read',
  'can_manage_staff': 'staff.read',
  'can_make_bookings': 'bookings.create_update',
  'can_view_booking_history': 'bookings.read',
  'can_request_refunds': 'refunds.create_update',
  'can_leave_reviews': 'reviews.create_update',
  'can_use_rewards': 'rewards.read',
  'can_view_favorites': 'properties.read',
  'can_access_messages': 'messages.read',

  // HMS Staff action key aliases
  'manage_properties': 'properties.create_update',
  'manage_reservations': 'bookings.create_update',
  'manage_inventory': 'hms_rooms.create_update',
  'manage_housekeeping': 'hms_housekeeping.create_update',
  'manage_food_beverage': 'hms_rooms.create_update',
  'manage_hr': 'hms_hr.create_update',
  'manage_accounts': 'hms_accounts.create_update',
  'manage_billing': 'hms_accounts.create_update',
  'view_analytics': 'analytics.read'
};

const usePermission = () => {
  const { user } = useAuthStore();

  const can = (permission) => {
    if (!user) return false;

    // Super admins always have full unrestricted access — check this FIRST
    // before any platform_permissions object evaluation.
    if (user.user_type === 'admin') return true;

    const platformPerms = user.platform_permissions;

    // Resolve target key (check if an alias exists)
    const targetKey = LEGACY_KEY_MAP[permission] || permission;

    // If staff, we must combine host's platform_permissions and staff's granular permissions
    if (user.user_type === 'staff') {
      // 1. Check if the host has explicitly disabled the parent feature
      const hostPerms = user.host_platform_permissions;
      if (hostPerms && typeof hostPerms === 'object') {
        // If host disabled HMS/PMS, staff cannot use hms rooms/reservations
        if (targetKey.startsWith('hms_') || ['manage_inventory', 'manage_reservations', 'manage_housekeeping', 'manage_food_beverage', 'manage_hr', 'manage_accounts', 'manage_billing'].includes(permission)) {
          if (hostPerms['hms_rooms.read'] === false) return false;
        }
        // General check for host's platform disable
        if (hostPerms[targetKey] === false || hostPerms[permission] === false) {
          return false;
        }
      }

      // 2. Check staff's granular permissions (custom granular perms from hms_employees)
      const perms = user.permissions || {};
      if (perms[permission] !== undefined || perms[targetKey] !== undefined) {
        if (perms['*'] || perms[permission] === true || perms[targetKey] === true) {
          return true;
        }
        return false; // Explicitly defined as false in granular overrides
      }

      // 3. Fallback to staff's own default role platform_permissions (rdp.permissions)
      if (platformPerms && typeof platformPerms === 'object') {
        if (platformPerms[targetKey] !== undefined) {
          return platformPerms[targetKey] === true;
        }
        if (platformPerms[permission] !== undefined) {
          return platformPerms[permission] === true;
        }
      }

      // 4. Fallback for staff basic functions like messages/support if not explicitly disabled by host
      if (['can_access_messages', 'messages.read', 'support.read'].includes(permission)) {
        return true;
      }

      return false;
    }

    // For property owners and guests, if platform_permissions exists, use it as the single source of truth.
    if (platformPerms && typeof platformPerms === 'object') {
      // Check the resolved CRUD key first (e.g. 'support.read')
      if (platformPerms[targetKey] !== undefined) {
        return platformPerms[targetKey] === true;
      }
      // Fallback: check the legacy/original key as stored (e.g. 'can_access_messages')
      if (platformPerms[permission] !== undefined) {
        return platformPerms[permission] === true;
      }
      // Fallback for essential messaging & support features if not explicitly set to false
      if (['can_access_messages', 'messages.read', 'messages.create_update', 'support.read', 'support.create_update'].includes(permission) || ['messages.read', 'support.read'].includes(targetKey)) {
        return true;
      }
      // Key not present in permissions object at all — deny by default
      return false;
    }

    // Default fallbacks for owners and guests when platform_permissions is null
    if (user.user_type === 'property_owner' || user.user_type === 'guest') {
      return true;
    }

    return false;
  };

  return { can };
};

export default usePermission;
