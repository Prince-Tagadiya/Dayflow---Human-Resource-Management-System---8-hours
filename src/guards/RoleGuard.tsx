import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { role, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Replace with proper loading spinner
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Logged in but insufficient permissions
    // Redirect logic could be smarter (e.g. to /dashboard)
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
);

export const EmployeeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // Employees and Admins can usually access basic employee features, 
  // or restrict purely to employee. Assumption: Admins have access to everything.
  <RoleGuard allowedRoles={['employee', 'admin']}>{children}</RoleGuard>
);
