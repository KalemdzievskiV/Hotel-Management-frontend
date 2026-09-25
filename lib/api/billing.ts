import apiClient from './client';
import {
  BillingInterval, BillingOverview, FakeCheckout, Plan, SubscriptionDetail, SubscriptionFilter,
  SubscriptionPlan, SubscriptionStats, SubscriptionSummary,
} from '@/types';

// A hotel owner's own subscription
export const billingApi = {
  // GET /api/billing/plans (public)
  getPlans: () => apiClient.get<Plan[]>('/billing/plans').then(r => r.data),

  getOverview: () => apiClient.get<BillingOverview>('/billing').then(r => r.data),

  /** Returns where to send the owner to pay */
  startCheckout: (plan: SubscriptionPlan, interval: BillingInterval) =>
    apiClient.post<{ checkoutUrl: string }>('/billing/checkout', { plan, interval }).then(r => r.data.checkoutUrl),

  changePlan: (plan: SubscriptionPlan) =>
    apiClient.post<BillingOverview>('/billing/change-plan', { plan }).then(r => r.data),

  cancel: () => apiClient.post<BillingOverview>('/billing/cancel').then(r => r.data),

  resume: () => apiClient.post<BillingOverview>('/billing/resume').then(r => r.data),

  // The pretend checkout used until a real payment provider is chosen
  getFakeCheckout: (session: string) =>
    apiClient.get<FakeCheckout>('/billing/fake/checkout', { params: { session } }).then(r => r.data),

  completeFakeCheckout: (session: string, approve: boolean) =>
    apiClient.post<BillingOverview>('/billing/fake/checkout/complete', { approve }, { params: { session } }).then(r => r.data),
};

interface AdminChange {
  reason: string;
}

// SuperAdmin tools for owners' subscriptions
export const adminSubscriptionsApi = {
  list: (filter: SubscriptionFilter = 'All', search?: string) =>
    apiClient.get<SubscriptionSummary[]>('/admin/subscriptions', { params: { filter, search: search || undefined } }).then(r => r.data),

  getStats: () => apiClient.get<SubscriptionStats>('/admin/subscriptions/stats').then(r => r.data),

  get: (ownerId: string) => apiClient.get<SubscriptionDetail>(`/admin/subscriptions/${ownerId}`).then(r => r.data),

  extend: (ownerId: string, change: AdminChange & { days?: number; until?: string }) =>
    apiClient.post<SubscriptionDetail>(`/admin/subscriptions/${ownerId}/extend`, change).then(r => r.data),

  recordManualPayment: (ownerId: string, change: AdminChange & { plan: SubscriptionPlan; until: string; amount: number; reference?: string }) =>
    apiClient.post<SubscriptionDetail>(`/admin/subscriptions/${ownerId}/manual-payment`, change).then(r => r.data),

  grantAccess: (ownerId: string, change: AdminChange & { plan: SubscriptionPlan; until: string }) =>
    apiClient.post<SubscriptionDetail>(`/admin/subscriptions/${ownerId}/grant-access`, change).then(r => r.data),

  changePlan: (ownerId: string, change: AdminChange & { plan: SubscriptionPlan }) =>
    apiClient.post<SubscriptionDetail>(`/admin/subscriptions/${ownerId}/change-plan`, change).then(r => r.data),

  grantGrace: (ownerId: string, change: AdminChange & { days: number }) =>
    apiClient.post<SubscriptionDetail>(`/admin/subscriptions/${ownerId}/grace`, change).then(r => r.data),

  /** Development only: renew or fail the next fake payment now, or run the renew-and-expire job */
  simulate: (action: 'RenewalPaid' | 'RenewalFailed' | 'RunMaintenance', ownerId?: string) =>
    apiClient.post('/billing/fake/simulate', { action, ownerId }).then(r => r.data),
};
