import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { role, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading User Data...</div>; 
  }

  if (!user) {
    console.log("RoleGuard: No User, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Debugging logs to see why it fails
  if (role && !allowedRoles.includes(role)) {
    console.log(`RoleGuard: Access Denied. User Role: ${role}, Allowed: ${allowedRoles}`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (!role) {
      // Role is still null but user exists? Wait a bit or show error?
      // It might be that the Firestore fetch is still happening in AuthContext.
      // But AuthContext says loading=false.
      // This means the user has NO role in DB or Claims.
      console.log("RoleGuard: User has NO ROLE. Redirecting to login/unauthorized.");
      // Option: Let them through if we are lenient, or block. 
      // STRICT: Block.
      return <Navigate to="/login" replace />;
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
