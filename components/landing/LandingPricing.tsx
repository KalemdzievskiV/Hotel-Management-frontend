'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { billingApi } from '@/lib/api/billing';
import { BillingInterval, Plan } from '@/types';
import { formatMoney, planFeatures, planPrice } from '@/components/billing/planDisplay';

const blurbs: Record<Plan['plan'], string> = {
  Free: 'For a few rooms you run yourself.',
  Starter: 'For a guesthouse or small hotel with a team.',
  Pro: 'For owners running more than one property.',
};

export default function LandingPricing() {
  const [interval, setInterval] = useState<BillingInterval>('Monthly');
  const { data: plans, isLoading, isError } = useQuery({ queryKey: ['plans'], queryFn: billingApi.getPlans });

  return (
    <div>
      <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border border-[var(--rule)] bg-white p-1 text-sm">
        {(['Monthly', 'Yearly'] as const).map(value => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={interval === value}
            onClick={() => setInterval(value)}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
              interval === value ? 'bg-[var(--ink)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {value}
            {value === 'Yearly' && (
              <span className={`ml-1.5 text-xs ${interval === value ? 'text-emerald-300' : 'text-emerald-700'}`}>2 months free</span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-10 grid gap-5 md:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="h-[30rem] animate-pulse rounded-3xl bg-white/70" />)}
        </div>
      )}
      {isError && (
        <p className="mt-10 text-[var(--muted)]">
          Plans couldn&apos;t be loaded right now. <Link href="/pricing" className="underline">See the pricing page</Link>.
        </p>
      )}

      {plans && (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map(plan => {
            const { price, perMonth } = planPrice(plan, interval);
            const featured = plan.plan === 'Starter';
            return (
              <section
                key={plan.plan}
                aria-labelledby={`landing-plan-${plan.plan}`}
                className={`relative flex flex-col rounded-3xl p-7 ${
                  featured ? 'bg-[var(--ink)] text-white shadow-xl shadow-black/10' : 'border border-[var(--rule)] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 id={`landing-plan-${plan.plan}`} className="text-lg font-semibold">{plan.name}</h3>
                  {featured && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium">Most popular</span>}
                </div>
                <p className={`mt-1 text-sm ${featured ? 'text-white/70' : 'text-[var(--muted)]'}`}>{blurbs[plan.plan]}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-serif text-6xl leading-none">{formatMoney(price, plan.currency)}</span>
                  <span className={`text-sm ${featured ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                    {price === 0 ? 'forever' : interval === 'Yearly' ? '/ year' : '/ month'}
                  </span>
                </p>
                <p className={`mt-2 h-5 text-sm ${featured ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                  {interval === 'Yearly' && price > 0 ? `${formatMoney(Math.round(perMonth * 100) / 100, plan.currency)} a month` : ''}
                </p>
                <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 text-sm ${featured ? 'border-white/15' : 'border-[var(--rule)]'}`}>
                  {planFeatures(plan).map(feature => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? 'text-emerald-300' : 'text-[var(--accent)]'}`} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register-hotel"
                  className={`mt-8 block rounded-full px-4 py-3 text-center text-sm font-semibold transition-colors ${
                    featured ? 'bg-white text-[var(--ink)] hover:bg-white/90' : 'border border-[var(--ink)]/15 text-[var(--ink)] hover:bg-[var(--paper)]'
                  }`}
                >
                  {plan.monthlyPrice === 0 ? 'Start for free' : 'Start 30-day free trial'}
                </Link>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-sm text-[var(--muted)]">
        Every new account gets Pro free for 30 days, then moves to Free unless you pick a plan. Prices in euros; VAT may apply.
      </p>
    </div>
  );
}
