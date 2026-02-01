import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false, requireRole = null }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.user_type !== 'admin') {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user?.user_type === 'admin' ? '/admin' : 
                        user?.user_type === 'property_owner' ? '/property-owner' : 
                        '/guest';
    return <Navigate to={redirectPath} replace />;
  }

  // Check specific role requirement
  if (requireRole && user?.user_type !== requireRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user?.user_type === 'admin' ? '/admin' : 
                        user?.user_type === 'property_owner' ? '/property-owner' : 
                        '/guest';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
