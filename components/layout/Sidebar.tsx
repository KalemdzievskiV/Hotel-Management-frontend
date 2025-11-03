'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '@/lib/constants';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[]; // If specified, only show for these roles
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: '📅',
  },
  {
    name: 'Hotels',
    href: '/dashboard/hotels',
    icon: '🏨',
  },
  {
    name: 'Rooms',
    href: '/dashboard/rooms',
    icon: '🛏️',
  },
  {
    name: 'Reservations',
    href: '/dashboard/reservations',
    icon: '📋',
  },
  {
    name: 'Guests',
    href: '/dashboard/guests',
    icon: '👥',
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: '👤',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const canViewItem = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.some(role => user?.roles.includes(role));
  };

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-2xl">🏨</span>
          <span className="ml-2 text-white font-bold text-lg">Hotel Manager</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item) => {
          if (!canViewItem(item)) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info at Bottom */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.roles.join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
