'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { BillingInterval, Plan, SubscriptionPlan } from '@/types';
import { formatMoney, planFeatures, planPrice } from './planDisplay';

export function IntervalToggle({ value, onChange }: { value: BillingInterval; onChange: (value: BillingInterval) => void }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-lg bg-gray-100 p-1 text-sm">
      {(['Monthly', 'Yearly'] as const).map(interval => (
        <button
          key={interval}
          type="button"
          role="radio"
          aria-checked={value === interval}
          onClick={() => onChange(interval)}
          className={`rounded-md px-4 py-1.5 font-medium transition-colors ${
            value === interval ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {interval}
          {interval === 'Yearly' && <span className="ml-1.5 text-xs text-green-700">2 months free</span>}
        </button>
      ))}
    </div>
  );
}

interface PlanCardsProps {
  plans: Plan[];
  interval: BillingInterval;
  /** Marks the plan the viewer is on */
  currentPlan?: SubscriptionPlan;
  /** The plan to draw attention to */
  highlighted?: SubscriptionPlan;
  action: (plan: Plan) => ReactNode;
}

export default function PlanCards({ plans, interval, currentPlan, highlighted = 'Starter', action }: PlanCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {plans.map(plan => {
        const { price, perMonth } = planPrice(plan, interval);
        const isCurrent = plan.plan === currentPlan;
        const isHighlighted = plan.plan === highlighted;
        return (
          <section
            key={plan.plan}
            aria-labelledby={`plan-${plan.plan}`}
            className={`relative flex flex-col rounded-xl border bg-white p-6 ${
              isHighlighted ? 'border-blue-600 shadow-md' : 'border-gray-200'
            }`}
          >
            {isHighlighted && (
              <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <div className="flex items-center justify-between">
              <h3 id={`plan-${plan.plan}`} className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              {isCurrent && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">Your plan</span>}
            </div>
            <p className="mt-4">
              <span className="text-4xl font-bold tracking-tight text-gray-900">{formatMoney(price, plan.currency)}</span>
              <span className="ml-1 text-sm text-gray-500">{price === 0 ? 'forever' : interval === 'Yearly' ? '/ year' : '/ month'}</span>
            </p>
            <p className="mt-1 h-5 text-sm text-gray-500">
              {interval === 'Yearly' && price > 0 ? `${formatMoney(Math.round(perMonth * 100) / 100, plan.currency)} a month` : ''}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-gray-700">
              {planFeatures(plan).map(feature => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">{action(plan)}</div>
          </section>
        );
      })}
    </div>
  );
}
