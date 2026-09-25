'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminSubscriptionsApi } from '@/lib/api/billing';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HistoryTable from '@/components/billing/HistoryTable';
import {
  formatDate, formatMoney, statusBadgeClass, statusLabels, subscriptionSummary,
} from '@/components/billing/planDisplay';
import { SubscriptionDetail, SubscriptionFilter, SubscriptionPlan, SubscriptionSummary } from '@/types';

const filters: { value: SubscriptionFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'TrialEndingSoon', label: 'Trial ending soon' },
  { value: 'Trialing', label: 'On trial' },
  { value: 'Paying', label: 'Paying' },
  { value: 'PastDue', label: 'Payment failed' },
  { value: 'Manual', label: 'Bank transfer' },
  { value: 'Free', label: 'Free' },
];

type Action = 'extend' | 'manual-payment' | 'grant-access' | 'change-plan' | 'grace';

const actionLabels: Record<Action, string> = {
  extend: 'Extend',
  'manual-payment': 'Record bank transfer',
  'grant-access': 'Give free access',
  'change-plan': 'Change plan',
  grace: 'Grace period',
};

/** Which actions make sense for this subscription, and why the others don't */
function availability(summary: SubscriptionSummary): Record<Action, string | null> {
  const onFree = summary.currentPlan === 'Free';
  const paysByCard = summary.source === 'Fake' && summary.status === 'Active' && !onFree;
  return {
    extend: summary.status === 'PastDue' ? 'The payment failed; give a grace period instead'
      : onFree ? 'On the Free plan; give access or record a payment instead' : null,
    'manual-payment': paysByCard ? 'Pays by card; extend or change the plan instead' : null,
    'grant-access': paysByCard ? 'Pays by card; extend or change the plan instead' : null,
    'change-plan': onFree ? 'On the Free plan; give access or record a payment instead' : null,
    grace: summary.status === 'PastDue' ? null : 'Only for a failed payment',
  };
}

const dateInput = (date: Date) => format(date, 'yyyy-MM-dd');
/** End of the chosen day, so "until 12 Nov" includes 12 Nov */
const endOfDay = (value: string) => new Date(`${value}T23:59:59`).toISOString();

function ActionForm({ detail, action, onDone }: { detail: SubscriptionDetail; action: Action; onDone: (updated: SubscriptionDetail) => void }) {
  const { showToast } = useToast();
  const { summary } = detail;
  const periodEnd = summary.accessUntil ? new Date(summary.accessUntil) : new Date();
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('14');
  const [until, setUntil] = useState(dateInput(addDays(periodEnd > new Date() ? periodEnd : new Date(), 30)));
  const [plan, setPlan] = useState<SubscriptionPlan>(summary.subscribedPlan === 'Free' ? 'Starter' : summary.subscribedPlan);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const submit = useMutation({
    mutationFn: () => {
      const id = summary.ownerId;
      switch (action) {
        case 'extend':
          return adminSubscriptionsApi.extend(id, { days: Number(days), reason });
        case 'manual-payment':
          return adminSubscriptionsApi.recordManualPayment(id, { plan, until: endOfDay(until), amount: Number(amount), reference: reference || undefined, reason });
        case 'grant-access':
          return adminSubscriptionsApi.grantAccess(id, { plan, until: endOfDay(until), reason });
        case 'change-plan':
          return adminSubscriptionsApi.changePlan(id, { plan, reason });
        case 'grace':
          return adminSubscriptionsApi.grantGrace(id, { days: Number(days), reason });
      }
    },
    onSuccess: updated => {
      showToast(`${actionLabels[action]}: done`, 'success');
      setReason('');
      onDone(updated);
    },
    onError: error => showToast(getApiErrorMessage(error, 'The change was not saved'), 'error'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate();
  };

  const planSelect = (
    <div>
      <Label htmlFor="action-plan">Plan</Label>
      <Select value={plan} onValueChange={value => setPlan(value as SubscriptionPlan)}>
        <SelectTrigger id="action-plan" className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Starter">Starter</SelectItem>
          <SelectItem value="Pro">Pro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
  const untilInput = (
    <div>
      <Label htmlFor="action-until">Until</Label>
      <Input id="action-until" type="date" required value={until} onChange={e => setUntil(e.target.value)} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {action === 'extend' && (
        <div>
          <Label htmlFor="action-days">Days to add</Label>
          <Input id="action-days" type="number" min={1} max={366} required value={days} onChange={e => setDays(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">
            {summary.status === 'Trialing' ? 'Lengthens the trial.' : summary.source === 'Fake'
              ? 'Moves the next card payment later without charging for the extra days.'
              : 'Lengthens the current access.'}
            {' '}Now ends {formatDate(summary.accessUntil)}.
          </p>
        </div>
      )}
      {action === 'manual-payment' && (
        <>
          <div className="grid grid-cols-2 gap-3">{planSelect}{untilInput}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="action-amount">Amount received (EUR)</Label>
              <Input id="action-amount" type="number" min={0.01} step={0.01} required value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="action-reference">Bank reference</Label>
              <Input id="action-reference" value={reference} onChange={e => setReference(e.target.value)} />
            </div>
          </div>
        </>
      )}
      {action === 'grant-access' && <div className="grid grid-cols-2 gap-3">{planSelect}{untilInput}</div>}
      {action === 'change-plan' && (
        <>
          {planSelect}
          <p className="text-xs text-gray-500">
            Applies now.{summary.source === 'Fake' ? " Card payers are charged the new plan's price from their next renewal." : ''}
          </p>
        </>
      )}
      {action === 'grace' && (
        <div>
          <Label htmlFor="action-days">Extra days</Label>
          <Input id="action-days" type="number" min={1} max={90} required value={days} onChange={e => setDays(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">The plan keeps working until {formatDate(summary.graceUntil)} now.</p>
        </div>
      )}
      <div>
        <Label htmlFor="action-reason">Reason</Label>
        <Textarea
          id="action-reason"
          required
          minLength={3}
          maxLength={500}
          rows={2}
          placeholder="Shown in the history, to you and to the owner"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? 'Saving…' : actionLabels[action]}
      </Button>
    </form>
  );
}

function SubscriptionPanel({ ownerId, onClose }: { ownerId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [action, setAction] = useState<Action | null>(null);
  const { data: detail } = useQuery({
    queryKey: ['admin-subscription', ownerId],
    queryFn: () => adminSubscriptionsApi.get(ownerId),
  });

  const onDone = (updated: SubscriptionDetail) => {
    queryClient.setQueryData(['admin-subscription', ownerId], updated);
    queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    setAction(null);
  };

  const simulate = useMutation({
    mutationFn: (paid: boolean) => adminSubscriptionsApi.simulate(paid ? 'RenewalPaid' : 'RenewalFailed', ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription', ownerId] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      showToast('Test payment simulated', 'success');
    },
    onError: error => showToast(getApiErrorMessage(error, 'Simulation failed'), 'error'),
  });

  const available = detail ? availability(detail.summary) : null;

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl [&>*]:min-w-0">
        {!detail || !available ? (
          <DialogHeader>
            <DialogTitle>Loading…</DialogTitle>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-3">
                {detail.summary.ownerName}
                <Badge className={statusBadgeClass[detail.summary.status]}>{statusLabels[detail.summary.status]}</Badge>
              </DialogTitle>
              <DialogDescription>
                {detail.summary.ownerEmail} · {detail.summary.hotels} hotel{detail.summary.hotels === 1 ? '' : 's'}, {detail.summary.rooms} rooms
                {!detail.summary.ownerActive && ' · account deactivated'}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-900">{detail.billing.currentPlan} plan</p>
              <p className="text-gray-700">{subscriptionSummary(detail.billing)}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Change the subscription</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(actionLabels) as Action[]).map(key => (
                  <Button
                    key={key}
                    size="sm"
                    variant={action === key ? 'default' : 'outline'}
                    disabled={available[key] !== null}
                    title={available[key] ?? undefined}
                    onClick={() => setAction(action === key ? null : key)}
                  >
                    {actionLabels[key]}
                  </Button>
                ))}
              </div>
              {action && (
                <div className="mt-4 rounded-lg border p-4">
                  <ActionForm key={action} detail={detail} action={action} onDone={onDone} />
                </div>
              )}
            </div>

            {detail.summary.source === 'Fake' && (
              <div className="rounded-lg border border-dashed border-amber-300 p-3 text-sm">
                <p className="mb-2 text-amber-900">Test payments (fake provider): make the next renewal happen now.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={simulate.isPending} onClick={() => simulate.mutate(true)}>Renewal paid</Button>
                  <Button size="sm" variant="outline" disabled={simulate.isPending} onClick={() => simulate.mutate(false)}>Renewal failed</Button>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">History</h3>
              <div className="overflow-x-auto rounded-lg border">
                <HistoryTable history={detail.billing.history} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * SuperAdmin: every hotel owner's subscription, with tools to extend, record payments and more
 */
export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<SubscriptionFilter>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const { data: stats } = useQuery({ queryKey: ['admin-subscriptions', 'stats'], queryFn: adminSubscriptionsApi.getStats });
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', filter, search],
    queryFn: () => adminSubscriptionsApi.list(filter, search),
  });

  const runJob = useMutation({
    mutationFn: () => adminSubscriptionsApi.simulate('RunMaintenance'),
    onSuccess: (result: { changed: number }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      showToast(`Renewals and expiries processed: ${result.changed} changed`, 'success');
    },
    onError: error => showToast(getApiErrorMessage(error, 'The job could not run'), 'error'),
  });

  const statCards = stats ? [
    { label: 'Owners', value: stats.owners },
    { label: 'On trial', value: stats.trialing, note: stats.trialsEndingSoon ? `${stats.trialsEndingSoon} ending within 7 days` : undefined },
    { label: 'Paying', value: stats.paying },
    { label: 'Payment failed', value: stats.pastDue },
    { label: 'Monthly revenue', value: formatMoney(stats.monthlyRevenue, stats.currency) },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="mt-1 text-gray-600">Hotel owners&apos; plans. Select an owner to extend, record a payment or change their plan.</p>
          </div>
          <Button variant="outline" disabled={runJob.isPending} onClick={() => runJob.mutate()}>
            Run renewals &amp; expiries now
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {statCards.map(card => (
            <Card key={card.label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-gray-600">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.note && <p className="mt-1 text-xs text-amber-700">{card.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2">
            {filters.map(item => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={filter === item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  filter === item.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Input
            type="search"
            aria-label="Search owners"
            placeholder="Search by name or email"
            className="ml-auto w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Card className="py-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Ends</th>
                  <th className="px-4 py-3 font-medium">Hotels / rooms</th>
                  <th className="px-4 py-3 text-right font-medium">Per month</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
                {subscriptions?.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No owners match.</td></tr>
                )}
                {subscriptions?.map(s => (
                  <tr key={s.ownerId} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelected(s.ownerId)}>
                    <td className="px-4 py-3">
                      <button type="button" className="text-left font-medium text-gray-900 hover:underline" onClick={() => setSelected(s.ownerId)}>
                        {s.ownerName}
                      </button>
                      <span className="block text-gray-500">{s.ownerEmail}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-2 text-gray-900">{s.currentPlan}</span>
                      <Badge className={statusBadgeClass[s.status]}>{statusLabels[s.status]}</Badge>
                      {s.source === 'Manual' && <span className="ml-2 text-xs text-gray-500">bank transfer</span>}
                      {s.cancelAtPeriodEnd && <span className="ml-2 text-xs text-amber-700">cancelled</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatDate(s.status === 'PastDue' ? s.graceUntil : s.accessUntil)}
                      {s.daysLeft !== null && <span className="block text-xs text-gray-500">{s.daysLeft} days left</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.hotels} / {s.rooms}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{s.monthlyRevenue ? formatMoney(s.monthlyRevenue) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {selected && <SubscriptionPanel ownerId={selected} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
