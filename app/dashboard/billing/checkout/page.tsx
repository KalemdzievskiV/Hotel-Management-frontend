'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { billingApi } from '@/lib/api/billing';
import { getApiErrorMessage } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/components/billing/planDisplay';

export default function FakeCheckoutPage() {
  return (
    <Suspense>
      <FakeCheckout />
    </Suspense>
  );
}

/**
 * The test checkout used until a real payment provider is connected. It stands where the
 * provider's hosted payment page will be; no card details are taken and nothing is charged.
 */
function FakeCheckout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSearchParams().get('session') ?? '';
  const [declined, setDeclined] = useState<string | null>(null);

  const { data: checkout, error } = useQuery({
    queryKey: ['fake-checkout', session],
    queryFn: () => billingApi.getFakeCheckout(session),
    enabled: session !== '',
    retry: false,
  });

  const complete = useMutation({
    mutationFn: (approve: boolean) => billingApi.completeFakeCheckout(session, approve),
    onSuccess: updated => {
      queryClient.setQueryData(['billing'], updated);
      router.push('/dashboard/billing?paid=1');
    },
    onError: failure => setDeclined(getApiErrorMessage(failure, 'The payment did not go through')),
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md space-y-4">
        <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Test checkout.</strong> No payment provider is connected yet, so no card is needed and nothing is charged.
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!session || error ? (
              <p className="text-red-700">{session ? getApiErrorMessage(error, "This checkout link isn't valid") : 'No checkout was started.'}</p>
            ) : !checkout ? (
              <p className="text-gray-500">Loading…</p>
            ) : (
              <>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Plan</dt>
                    <dd className="font-medium text-gray-900">{checkout.planName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Billed</dt>
                    <dd className="font-medium text-gray-900">{checkout.interval.toLowerCase()}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base">
                    <dt className="font-semibold text-gray-900">Due today</dt>
                    <dd className="font-semibold text-gray-900">{formatMoney(checkout.amount, checkout.currency)}</dd>
                  </div>
                </dl>

                {declined && <p role="alert" className="text-sm text-red-700">{declined}</p>}

                <div className="space-y-2">
                  <Button className="w-full" disabled={complete.isPending} onClick={() => complete.mutate(true)}>
                    {complete.isPending ? 'Processing…' : `Pay ${formatMoney(checkout.amount, checkout.currency)}`}
                  </Button>
                  <Button variant="outline" className="w-full" disabled={complete.isPending} onClick={() => complete.mutate(false)}>
                    Try a declined card
                  </Button>
                </div>
              </>
            )}
            <Link href="/dashboard/billing" className="block text-center text-sm text-blue-600 hover:text-blue-700">
              Back to billing
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
