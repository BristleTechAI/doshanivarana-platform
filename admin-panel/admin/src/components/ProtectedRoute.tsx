import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@devaseva/core';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Could be a fancy spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Admin Dashboard should only be accessible to ADMIN and SUPER_ADMIN
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
     return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
