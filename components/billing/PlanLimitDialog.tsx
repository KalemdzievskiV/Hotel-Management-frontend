'use client';

import Link from 'next/link';
import { usePlanLimitStore } from '@/store/planLimitStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * Shown whenever the API refuses something because of the hotel owner's plan (402).
 * Owners can go straight to their plans; staff are told who can upgrade.
 */
export default function PlanLimitDialog() {
  const { refusal, dismiss } = usePlanLimitStore();
  const { isAdmin } = usePermissions();

  return (
    <Dialog open={refusal !== null} onOpenChange={open => !open && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {refusal?.upgradeTo ? `Available on ${refusal.upgradeTo}` : 'Plan limit reached'}
          </DialogTitle>
          <DialogDescription>{refusal?.message}</DialogDescription>
        </DialogHeader>
        {!isAdmin && (
          <p className="text-sm text-gray-600">Ask the hotel owner to upgrade their plan.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={dismiss}>Not now</Button>
          {isAdmin && (
            <Button asChild onClick={dismiss}>
              <Link href="/dashboard/billing">See plans</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
