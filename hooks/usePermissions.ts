import { useAuthStore } from '@/store/authStore';

export const usePermissions = () => {
  const { user, isSuperAdmin, isAdmin, isManager, isGuest } = useAuthStore();

  const isSuperAdminRole = isSuperAdmin();
  const isAdminRole = isAdmin();
  const isManagerRole = isManager();
  const isGuestRole = isGuest();

  return {
    // Role checks
    isSuperAdmin: isSuperAdminRole,
    isAdmin: isAdminRole,
    isManager: isManagerRole,
    isGuest: isGuestRole,

    // User management (SuperAdmin only)
    canManageUsers: isSuperAdminRole,
    canViewUsers: isSuperAdminRole,
    canCreateUsers: isSuperAdminRole,
    canEditUsers: isSuperAdminRole,
    canDeleteUsers: isSuperAdminRole,
    canAssignRoles: isSuperAdminRole,

    // Hotel management
    canViewHotels: isSuperAdminRole || isAdminRole || isManagerRole,
    canCreateHotels: isSuperAdminRole || isAdminRole,
    canEditHotels: isSuperAdminRole || isAdminRole,
    canDeleteHotels: isSuperAdminRole || isAdminRole,

    // Room management
    canViewRooms: isSuperAdminRole || isAdminRole || isManagerRole,
    canCreateRooms: isSuperAdminRole || isAdminRole || isManagerRole,
    canEditRooms: isSuperAdminRole || isAdminRole || isManagerRole,
    canDeleteRooms: isSuperAdminRole || isAdminRole || isManagerRole,

    // Reservation management
    canViewReservations: true, // All authenticated users can view (backend filters to user's own for Guests)
    canCreateReservations: true, // All authenticated users can create
    canEditReservations: isSuperAdminRole || isAdminRole || isManagerRole || isGuestRole, // Guest can edit their own
    canDeleteReservations: isSuperAdminRole || isAdminRole,
    canViewAllReservations: isSuperAdminRole || isAdminRole || isManagerRole,

    // Guest management
    canViewGuests: isSuperAdminRole || isAdminRole || isManagerRole,
    canManageGuests: isSuperAdminRole || isAdminRole || isManagerRole,

    // System features
    canViewSystemSettings: isSuperAdminRole,
    canViewAuditLogs: isSuperAdminRole,
    canManageSubscriptions: isSuperAdminRole,

    // Dashboard access
    canAccessAdminDashboard: isSuperAdminRole || isAdminRole || isManagerRole,
    canAccessGuestDashboard: isGuestRole,
  };
};
