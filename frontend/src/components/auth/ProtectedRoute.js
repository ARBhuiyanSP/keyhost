import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute
 * - requireRole: single role string (strict match)
 * - allowedRoles: array of roles that are permitted (e.g. ['guest','property_owner'])
 *   When allowedRoles is provided it takes precedence over requireRole.
 */
const ProtectedRoute = ({ children, requireAdmin = false, requireRole = null, allowedRoles = null }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

  return children;
};

export default ProtectedRoute;
