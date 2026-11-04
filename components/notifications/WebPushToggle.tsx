'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/Toast';
import { WebPushState, disableWebPush, enableWebPush, getWebPushState, sendTestWebPush } from '@/lib/push';

const HINTS: Partial<Record<WebPushState, string>> = {
  'needs-install': 'On iPhone, first add this site to your Home Screen (Share → Add to Home Screen), open it from there, and turn this on.',
  unsupported: "This browser doesn't support push notifications.",
  denied: 'Notifications are blocked for this site. Allow them in your browser or phone settings, then try again.',
};

/** Turns browser push on/off for this device (new bookings, check-in and check-out reminders) */
export default function WebPushToggle() {
  const { showToast } = useToast();
  const [state, setState] = useState<WebPushState>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getWebPushState().then(setState).catch(() => setState('unsupported'));
  }, []);

  const toggle = async (on: boolean) => {
    setBusy(true);
    try {
      const next = on ? await enableWebPush() : await disableWebPush();
      setState(next);
      if (on && next === 'on') showToast('Notifications are on for this device', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not turn on notifications', 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    try {
      await sendTestWebPush();
      showToast('Test notification sent. It should arrive in a few seconds.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send a test notification', 'error');
    } finally {
      setBusy(false);
    }
  };

  const hint = HINTS[state];

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor="web-push">Push Notifications</Label>
        <p className="text-sm text-muted-foreground">
          {hint ?? 'Get a notification on this device for new online bookings and 30 minutes before each check-in and check-out.'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {state === 'on' && (
          <Button variant="outline" size="sm" disabled={busy} onClick={sendTest}>
            Send test
          </Button>
        )}
        <Switch
          id="web-push"
          checked={state === 'on'}
          disabled={busy || state === 'loading' || !!hint}
          onCheckedChange={toggle}
        />
      </div>
    </div>
  );
}
