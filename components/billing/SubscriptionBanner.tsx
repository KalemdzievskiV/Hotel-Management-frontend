'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/lib/api/billing';
import { usePermissions } from '@/hooks/usePermissions';
import { BillingOverview } from '@/types';
import { formatDate } from './planDisplay';

const DISMISSED_KEY = 'subscription-banner-dismissed';

/** What needs the owner's attention, if anything */
function notice(billing: BillingOverview): { tone: 'info' | 'warning' | 'danger'; text: string } | null {
  const days = billing.daysLeft ?? 0;
  const inDays = `${days} day${days === 1 ? '' : 's'}`;

  if (billing.status === 'PastDue')
    return { tone: 'danger', text: `Your last payment failed. Your ${billing.subscribedPlan} plan keeps working until ${formatDate(billing.graceUntil)}.` };
  if (billing.status === 'Trialing' && days <= 7)
    return { tone: 'warning', text: `Your free trial ends in ${inDays}. Choose a plan to keep everything you use now.` };
  if (billing.cancelAtPeriodEnd && days <= 7)
    return { tone: 'warning', text: `Your ${billing.subscribedPlan} plan ends in ${inDays}; after that you move to the Free plan.` };
  if (billing.status === 'Active' && billing.source !== 'Fake' && billing.currentPlan !== 'Free' && days <= 7)
    return { tone: 'warning', text: `Your ${billing.subscribedPlan} access ends in ${inDays}.` };
  if (billing.status === 'Expired')
    return { tone: 'info', text: "Your trial or paid plan has ended, so you're on the Free plan. Nothing was deleted." };
  return null;
}

const toneClasses = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  danger: 'bg-red-50 border-red-200 text-red-900',
};

/**
 * Tells hotel owners when their trial or plan needs attention. Staff don't see it;
 * only the owner can change the plan.
 */
export default function SubscriptionBanner() {
  const pathname = usePathname();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const isOwner = isAdmin && !isSuperAdmin;
  const { data: billing } = useQuery({
    queryKey: ['billing'],
    queryFn: billingApi.getOverview,
    enabled: isOwner,
  });

  if (!isOwner || !billing || pathname.startsWith('/dashboard/billing')) return null;
  const current = notice(billing);
  // Urgent notices can't be dismissed
  if (!current || (dismissed && current.tone !== 'danger')) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // The banner just comes back next time
    }
  };

  return (
    <div role="status" className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${toneClasses[current.tone]}`}>
      <span>{current.text}</span>
      <span className="flex items-center gap-3">
        <Link href="/dashboard/billing" className="font-semibold underline underline-offset-2">
          {billing.status === 'PastDue' ? 'Update payment' : 'See plans'}
        </Link>
        {current.tone !== 'danger' && (
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100">✕</button>
        )}
      </span>
    </div>
  );
}
