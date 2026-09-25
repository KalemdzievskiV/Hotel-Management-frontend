'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/lib/api/billing';
import { BillingInterval } from '@/types';
import PlanCards, { IntervalToggle } from '@/components/billing/PlanCards';

const questions = [
  {
    q: 'What happens when the trial ends?',
    a: "You move to the Free plan unless you choose a paid one. Nothing is deleted: rooms, reservations and guests stay, you just can't add more than the Free plan allows.",
  },
  {
    q: 'Do I need a card to start?',
    a: 'No. The 30-day trial of Pro starts as soon as you sign up, without any payment details.',
  },
  {
    q: 'Can I change or cancel my plan later?',
    a: 'Yes, at any time from Billing. Upgrades apply straight away; downgrades and cancellations take effect at the end of the period you paid for.',
  },
  {
    q: 'Can I pay by bank transfer?',
    a: 'Yes. Contact us and we will send an invoice; your plan is activated when the payment arrives.',
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('Monthly');
  const { data: plans, isLoading, isError } = useQuery({ queryKey: ['plans'], queryFn: billingApi.getPlans });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/pricing" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg" aria-hidden="true">🏨</span>
          Hotel Manager
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-gray-700 hover:text-gray-900">Sign in</Link>
          <Link href="/register-hotel" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Start free trial</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Run your hotel from one place</h1>
          <p className="mt-4 text-lg text-gray-600">
            Reservations, walk-ins, housekeeping and payments. Start with every feature free for 30 days, then pick the plan that fits.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <IntervalToggle value={interval} onChange={setInterval} />
        </div>

        {isLoading && <p className="text-center text-gray-500">Loading plans…</p>}
        {isError && <p className="text-center text-red-600">Plans couldn&apos;t be loaded. Please try again later.</p>}
        {plans && (
          <PlanCards
            plans={plans}
            interval={interval}
            action={plan => (
              <Link
                href="/register-hotel"
                className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
                  plan.plan === 'Starter' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {plan.monthlyPrice === 0 ? 'Start for free' : 'Start 30-day free trial'}
              </Link>
            )}
          />
        )}

        <p className="mt-6 text-center text-sm text-gray-500">Prices in euros. VAT may apply depending on your country.</p>

        <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-gray-900">Questions</h2>
          <dl className="mt-6 divide-y divide-gray-200">
            {questions.map(item => (
              <div key={item.q} className="py-5">
                <dt className="font-semibold text-gray-900">{item.q}</dt>
                <dd className="mt-2 text-gray-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
