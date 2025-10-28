// Application constants

export const APP_NAME = 'Hotel Management System';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  HOUSEKEEPER: 'Housekeeper',
  GUEST: 'Guest',
} as const;

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
export const MANAGEMENT_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];
export const STAFF_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.HOUSEKEEPER];

export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

export const CURRENCY_SYMBOL = '$';
export const CURRENCY_FORMAT = 'USD';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};
