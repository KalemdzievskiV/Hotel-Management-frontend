'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for store to hydrate
    if (!_hasHydrated) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    if (user.roles.includes('SuperAdmin')) {
      // SuperAdmin goes to system admin dashboard
      router.replace('/dashboard/super-admin');
    } else if (user.roles.includes('Admin') || user.roles.includes('Manager')) {
      // Admin and Manager go to operations dashboard
      router.replace('/dashboard/admin');
    } else if (user.roles.includes('Guest')) {
      // Guest users go to the general dashboard (reservations view)
      router.replace('/dashboard/reservations');
    } else {
      // Fallback - redirect to reservations
      router.replace('/dashboard/reservations');
    }
  }, [user, _hasHydrated, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
