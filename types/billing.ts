// Subscriptions and billing. The API sends these enums as their names.

export type SubscriptionPlan = 'Free' | 'Starter' | 'Pro';
export type SubscriptionStatus = 'Active' | 'Trialing' | 'PastDue' | 'Expired';
export type BillingInterval = 'Monthly' | 'Yearly';
export type BillingSource = 'None' | 'Fake' | 'Manual';
export type SubscriptionEventType =
  | 'TrialStarted' | 'TrialExtended' | 'Subscribed' | 'Renewed' | 'PaymentFailed' | 'GraceGranted'
  | 'Expired' | 'CancelScheduled' | 'CancelReverted' | 'PlanChanged' | 'Extended' | 'ManualPayment'
  | 'AccessGranted' | 'Downgraded';

/** A plan's price and limits; null limits are unlimited */
export interface Plan {
  plan: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  maxHotels: number | null;
  maxRooms: number | null;
  maxStaff: number | null;
  inventory: boolean;
  fullReports: boolean;
  reportHistoryDays: number | null;
}

export interface PlanUsage {
  hotels: number;
  rooms: number;
  staff: number;
}

export interface SubscriptionEvent {
  type: SubscriptionEventType;
  plan: SubscriptionPlan;
  oldAccessUntil: string | null;
  newAccessUntil: string | null;
  amount: number | null;
  reference: string | null;
  reason: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface BillingOverview {
  /** The plan in effect now */
  currentPlan: SubscriptionPlan;
  /** The plan being trialled or paid for */
  subscribedPlan: SubscriptionPlan;
  status: SubscriptionStatus;
  interval: BillingInterval;
  source: BillingSource;
  accessUntil: string | null;
  trialEndsAt: string | null;
  graceUntil: string | null;
  cancelAtPeriodEnd: boolean;
  scheduledPlan: SubscriptionPlan | null;
  daysLeft: number | null;
  canCheckout: boolean;
  limits: Plan;
  usage: PlanUsage;
  plans: Plan[];
  history: SubscriptionEvent[];
}

export interface FakeCheckout {
  plan: SubscriptionPlan;
  planName: string;
  interval: BillingInterval;
  amount: number;
  currency: string;
  expiresAt: string;
}

/** Details the API sends with a 402 when the plan doesn't allow something */
export interface PlanLimitDetails {
  code: 'plan_limit';
  limit: string;
  currentPlan: SubscriptionPlan;
  allowed: number | null;
  upgradeTo: SubscriptionPlan | null;
}

// SuperAdmin

export type SubscriptionFilter = 'All' | 'Trialing' | 'TrialEndingSoon' | 'Paying' | 'PastDue' | 'Manual' | 'Free';

export interface SubscriptionSummary {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerActive: boolean;
  hotels: number;
  rooms: number;
  currentPlan: SubscriptionPlan;
  subscribedPlan: SubscriptionPlan;
  status: SubscriptionStatus;
  source: BillingSource;
  interval: BillingInterval;
  accessUntil: string | null;
  graceUntil: string | null;
  cancelAtPeriodEnd: boolean;
  daysLeft: number | null;
  monthlyRevenue: number;
  createdAt: string;
}

export interface SubscriptionDetail {
  summary: SubscriptionSummary;
  billing: BillingOverview;
}

export interface SubscriptionStats {
  owners: number;
  trialing: number;
  trialsEndingSoon: number;
  paying: number;
  pastDue: number;
  free: number;
  monthlyRevenue: number;
  currency: string;
}

export interface RegisterOwnerDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  country?: string;
}

export interface CreateStaffDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Manager' | 'Housekeeper';
  hotelId: number;
  phoneNumber?: string;
  jobTitle?: string;
}
