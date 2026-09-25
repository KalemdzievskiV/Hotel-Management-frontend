import { format } from 'date-fns';
import { BillingInterval, BillingOverview, Plan, SubscriptionEvent, SubscriptionStatus } from '@/types';

export function formatMoney(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export const formatDate = (value: string | null | undefined) => (value ? format(new Date(value), 'd MMM yyyy') : '—');

export const limitText = (value: number | null, noun: string) =>
  value === null ? `Unlimited ${noun}s` : `${value} ${noun}${value === 1 ? '' : 's'}`;

/** The plan's price for the interval, and what that works out to per month */
export function planPrice(plan: Plan, interval: BillingInterval) {
  const price = interval === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  return {
    price,
    perMonth: interval === 'Yearly' ? plan.yearlyPrice / 12 : plan.monthlyPrice,
    label: plan.monthlyPrice === 0 ? 'Free' : `${formatMoney(price, plan.currency)} / ${interval === 'Yearly' ? 'year' : 'month'}`,
  };
}

/** The lines listed on a plan card */
export function planFeatures(plan: Plan) {
  return [
    limitText(plan.maxHotels, 'hotel'),
    limitText(plan.maxRooms, 'room'),
    `${limitText(plan.maxStaff, 'staff account')} besides you`,
    'Reservations, calendar, walk-ins and online booking',
    'Housekeeping',
    plan.inventory ? 'Inventory' : 'Inventory (view only)',
    plan.fullReports ? 'Full reports' : `Reports for the last ${plan.reportHistoryDays} days`,
  ];
}

export const statusLabels: Record<SubscriptionStatus, string> = {
  Active: 'Active',
  Trialing: 'Free trial',
  PastDue: 'Payment failed',
  Expired: 'Expired',
};

export const statusBadgeClass: Record<SubscriptionStatus, string> = {
  Active: 'bg-green-100 text-green-800 hover:bg-green-100',
  Trialing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  PastDue: 'bg-red-100 text-red-800 hover:bg-red-100',
  Expired: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
};

/** One line describing where the subscription stands, e.g. "Trial ends 12 Oct 2026 (5 days left)" */
export function subscriptionSummary(billing: Pick<BillingOverview,
  'status' | 'currentPlan' | 'accessUntil' | 'graceUntil' | 'daysLeft' | 'cancelAtPeriodEnd' | 'source' | 'scheduledPlan'>) {
  const left = billing.daysLeft !== null ? ` (${billing.daysLeft} day${billing.daysLeft === 1 ? '' : 's'} left)` : '';
  if (billing.currentPlan === 'Free')
    return billing.status === 'Expired' ? 'Your previous plan has ended; you are on the Free plan' : 'Free plan';
  switch (billing.status) {
    case 'Trialing':
      return `Trial ends ${formatDate(billing.accessUntil)}${left}`;
    case 'PastDue':
      return `The last payment failed. The plan keeps working until ${formatDate(billing.graceUntil)}${left}`;
    default:
      if (billing.cancelAtPeriodEnd)
        return `Cancelled: ends ${formatDate(billing.accessUntil)}${left}`;
      if (billing.source === 'Manual')
        return `Paid by bank transfer until ${formatDate(billing.accessUntil)}${left}`;
      if (billing.source === 'None')
        return `Free access until ${formatDate(billing.accessUntil)}${left}`;
      return `Renews ${formatDate(billing.accessUntil)}${billing.scheduledPlan ? `, then moves to ${billing.scheduledPlan}` : ''}`;
  }
}

const eventLabels: Record<SubscriptionEvent['type'], string> = {
  TrialStarted: 'Trial started',
  TrialExtended: 'Trial extended',
  Subscribed: 'Subscribed',
  Renewed: 'Renewed',
  PaymentFailed: 'Payment failed',
  GraceGranted: 'Grace period extended',
  Expired: 'Moved to Free',
  CancelScheduled: 'Cancelled',
  CancelReverted: 'Cancellation undone',
  PlanChanged: 'Plan changed',
  Extended: 'Extended',
  ManualPayment: 'Bank transfer recorded',
  AccessGranted: 'Free access granted',
  Downgraded: 'Free plan',
};

export const eventLabel = (event: SubscriptionEvent) => eventLabels[event.type] ?? event.type;
