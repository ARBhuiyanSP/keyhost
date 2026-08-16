import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import usePermission from '../../hooks/usePermission';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute
 * - requireRole: single role string (strict match)
 * - allowedRoles: array of roles that are permitted (e.g. ['guest','property_owner'])
 *   When allowedRoles is provided it takes precedence over requireRole.
 * - requirePermission: permission key to enforce on the user
 */
const ProtectedRoute = ({ children, requireAdmin = false, requireRole = null, allowedRoles = null, requirePermission = null }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const { can } = usePermission();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin bypasses all client-side role and permission checks
  if (user?.user_type === 'admin') {
    return children;
  }

  const dashboardPath = user?.user_type === 'admin' ? '/admin'
    : user?.user_type === 'property_owner' ? '/property-owner'
      : '/guest';

  // Admin check
  if (requireAdmin && user?.user_type !== 'admin') {
    return <Navigate to={dashboardPath} replace />;
  }

  // Multi-role allow list (e.g. guest pages that owners can also use)
  if (allowedRoles && !allowedRoles.includes(user?.user_type)) {
    return <Navigate to={dashboardPath} replace />;
  }

  // Single role check
  if (requireRole && !allowedRoles && user?.user_type !== requireRole) {
    return <Navigate to={dashboardPath} replace />;
  }

  // Permission check
  if (requirePermission && !can(requirePermission)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 min-h-[70vh] rounded-2xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Your account does not have the required permission to view this page. Please contact your system administrator.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
