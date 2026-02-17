import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/cookieUtils';

const ProtectedRoute = ({ children, roles }) => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0) {
    const role = (getUserRole() || '').toLowerCase();
    if (!roles.map(r => r.toLowerCase()).includes(role)) {
      // Redirect providers to provider dashboard, customers to customer dashboard
      const userRole = getUserRole() || '';
      const redirectPath = (userRole === 'SERVICE_PROVIDER' || userRole === 'ADMIN') ? '/provider' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }
  return children;
};

export default ProtectedRoute;



