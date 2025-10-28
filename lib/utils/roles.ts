import { ROLES, ADMIN_ROLES, MANAGEMENT_ROLES, STAFF_ROLES } from '../constants';

export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

export function hasAllRoles(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}

export function isSuperAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, ROLES.SUPER_ADMIN);
}

export function isAdmin(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ADMIN_ROLES);
}

export function isManagement(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, MANAGEMENT_ROLES);
}

export function isStaff(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, STAFF_ROLES);
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 'bg-purple-100 text-purple-800';
    case ROLES.ADMIN:
      return 'bg-blue-100 text-blue-800';
    case ROLES.MANAGER:
      return 'bg-green-100 text-green-800';
    case ROLES.HOUSEKEEPER:
      return 'bg-yellow-100 text-yellow-800';
    case ROLES.GUEST:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
