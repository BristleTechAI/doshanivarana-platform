// @ts-nocheck
import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@devaseva/core';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Could be a fancy spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // PRO Dashboard should only be accessible to PRO
  if (role !== UserRole.PRO) {
     return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
