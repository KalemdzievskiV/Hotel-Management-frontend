'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

// Signed-in visitors get a way back to their dashboard instead of the sign-up buttons
export default function NavActions() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const hasHydrated = useAuthStore(s => s._hasHydrated);

  if (hasHydrated && isAuthenticated) {
    return (
      <Link href="/dashboard" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black">
        Open dashboard
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-black/5">
        Sign in
      </Link>
      <Link href="/register-hotel" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-strong)]">
        Start free trial
      </Link>
    </div>
  );
}
