import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  requiredRoles, 
  requiredPermission,
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  
  // Check roles
  if (requiredRoles) {
    const hasRole = requiredRoles.some(role => 
      user?.roles.includes(role)
    );
    if (!hasRole) return <>{fallback}</>;
  }
  
  // Check permission
  if (requiredPermission) {
    if (!permissions[requiredPermission]) return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
