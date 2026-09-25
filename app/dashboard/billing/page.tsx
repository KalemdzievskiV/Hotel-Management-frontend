'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { billingApi } from '@/lib/api/billing';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import PlanCards, { IntervalToggle } from '@/components/billing/PlanCards';
import HistoryTable from '@/components/billing/HistoryTable';
import { formatDate, statusBadgeClass, statusLabels, subscriptionSummary } from '@/components/billing/planDisplay';
import { BillingInterval, BillingOverview, Plan, SubscriptionPlan } from '@/types';

const planOrder: SubscriptionPlan[] = ['Free', 'Starter', 'Pro'];

function UsageBar({ label, used, allowed }: { label: string; used: number; allowed: number | null }) {
  const share = allowed ? Math.min(100, (used / allowed) * 100) : 0;
  const full = allowed !== null && used >= allowed;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={full ? 'font-semibold text-amber-700' : 'text-gray-600'}>
          {used} of {allowed ?? 'unlimited'}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-gray-200"
        role="progressbar"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={allowed ?? undefined}
      >
        {allowed !== null && (
          <div className={`h-2 rounded-full ${full ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${share}%` }} />
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <Billing />
    </Suspense>
  );
}

/**
 * A hotel owner's plan: what it includes, how much of it they use, changing or cancelling it,
 * and the history of their subscription
 */
function Billing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [interval, setInterval] = useState<BillingInterval>('Monthly');
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Always fresh: the payment provider or support may have changed the subscription meanwhile
  const { data: billing, isLoading, isError } = useQuery({ queryKey: ['billing'], queryFn: billingApi.getOverview, staleTime: 0 });

  const onChanged = (updated: BillingOverview, message: string) => {
    queryClient.setQueryData(['billing'], updated);
    showToast(message, 'success');
  };
  const onFailed = (error: unknown) => showToast(getApiErrorMessage(error, 'Something went wrong'), 'error');

  const checkout = useMutation({
    mutationFn: (plan: SubscriptionPlan) => billingApi.startCheckout(plan, interval),
    onSuccess: url => {
      // A real provider's hosted checkout is on another site; the test checkout is a page of this app
      if (/^https?:\/\//.test(url)) window.location.href = url;
      else router.push(url);
    },
    onError: onFailed,
  });
  const changePlan = useMutation({
    mutationFn: billingApi.changePlan,
    onSuccess: (updated, plan) => onChanged(updated,
      updated.scheduledPlan ? `You'll move to ${plan} at your next renewal` : `You're now on ${plan}`),
    onError: onFailed,
  });
  const cancel = useMutation({
    mutationFn: billingApi.cancel,
    onSuccess: updated => {
      setConfirmCancel(false);
      onChanged(updated, `Cancelled. Your plan stays until ${formatDate(updated.accessUntil)}.`);
    },
    onError: onFailed,
  });
  const resume = useMutation({
    mutationFn: billingApi.resume,
    onSuccess: updated => onChanged(updated, 'Your plan will renew as usual'),
    onError: onFailed,
  });
  const busy = checkout.isPending || changePlan.isPending || cancel.isPending || resume.isPending;

  if (isLoading || !billing) {
    return (
      <DashboardLayout>
        <p className="text-gray-500">{isError ? "Billing couldn't be loaded." : 'Loading…'}</p>
      </DashboardLayout>
    );
  }

  const paysAutomatically = !billing.canCheckout;
  const rank = (plan: SubscriptionPlan) => planOrder.indexOf(plan);

  const planAction = (plan: Plan) => {
    const full = 'w-full';
    if (!paysAutomatically) {
      if (plan.plan === 'Free')
        return (
          <Button variant="outline" className={full} disabled>
            {billing.currentPlan === 'Free' ? 'Your plan' : 'Included when a plan ends'}
          </Button>
        );
      return (
        <Button className={full} disabled={busy} onClick={() => checkout.mutate(plan.plan)}>
          Choose {plan.name}
        </Button>
      );
    }
    if (plan.plan === billing.subscribedPlan)
      return billing.scheduledPlan ? (
        <Button variant="outline" className={full} disabled={busy} onClick={() => changePlan.mutate(plan.plan)}>
          Keep {plan.name}
        </Button>
      ) : (
        <Button variant="outline" className={full} disabled>Your plan</Button>
      );
    if (plan.plan === 'Free')
      return (
        <Button variant="outline" className={full} disabled={busy || billing.cancelAtPeriodEnd} onClick={() => setConfirmCancel(true)}>
          {billing.cancelAtPeriodEnd ? 'Moving here when your plan ends' : 'Cancel to move here'}
        </Button>
      );
    if (rank(plan.plan) > rank(billing.subscribedPlan))
      return <Button className={full} disabled={busy} onClick={() => changePlan.mutate(plan.plan)}>Upgrade to {plan.name}</Button>;
    return (
      <Button variant="outline" className={full} disabled={busy || billing.scheduledPlan === plan.plan} onClick={() => changePlan.mutate(plan.plan)}>
        {billing.scheduledPlan === plan.plan ? 'Starts at your next renewal' : `Switch to ${plan.name} at renewal`}
      </Button>
    );
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="mt-1 text-gray-600">Your plan covers all your hotels and their staff.</p>
        </div>

        {searchParams.get('paid') === '1' && billing.status === 'Active' && (
          <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            Payment received. You&apos;re on the {billing.subscribedPlan} plan.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardDescription>Current plan</CardDescription>
              <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
                {billing.currentPlan}
                <Badge className={statusBadgeClass[billing.status]}>{statusLabels[billing.status]}</Badge>
                {billing.status === 'Active' && billing.source === 'Fake' && (
                  <span className="text-sm font-normal text-gray-500">billed {billing.interval.toLowerCase()}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{subscriptionSummary(billing)}</p>
              {billing.status === 'PastDue' && (
                <p className="text-sm text-red-700">
                  Pay again below with another card to keep your plan. Until then nothing changes.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {billing.cancelAtPeriodEnd && paysAutomatically && (
                  <Button disabled={busy} onClick={() => resume.mutate()}>Keep my plan</Button>
                )}
                {paysAutomatically && !billing.cancelAtPeriodEnd && (
                  <Button variant="outline" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel subscription</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What you use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UsageBar label="Hotels" used={billing.usage.hotels} allowed={billing.limits.maxHotels} />
              <UsageBar label="Rooms" used={billing.usage.rooms} allowed={billing.limits.maxRooms} />
              <UsageBar label="Staff" used={billing.usage.staff} allowed={billing.limits.maxStaff} />
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="plans-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="plans-heading" className="text-lg font-semibold text-gray-900">Plans</h2>
            {paysAutomatically ? (
              <p className="text-sm text-gray-600">Billed {billing.interval.toLowerCase()}. Upgrades apply now; other changes at renewal.</p>
            ) : (
              <IntervalToggle value={interval} onChange={setInterval} />
            )}
          </div>
          <PlanCards
            plans={billing.plans}
            interval={paysAutomatically ? billing.interval : interval}
            currentPlan={billing.currentPlan}
            action={planAction}
          />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <HistoryTable history={billing.history} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel your subscription?</DialogTitle>
            <DialogDescription>
              Your {billing.subscribedPlan} plan stays until {formatDate(billing.accessUntil)}. After that you move to the
              Free plan. Nothing is deleted, and you can subscribe again at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>Keep my plan</Button>
            <Button variant="destructive" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
              {cancel.isPending ? 'Cancelling…' : 'Cancel subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
