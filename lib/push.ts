import { notificationsApi } from '@/lib/api/notifications';

/**
 * Browser push for the web app. For now the server only sends new online bookings and
 * check-in / check-out reminders this way. On iPhone it works only once the site is added to the Home Screen and opened from
 * there; it then keeps working when the app is closed.
 */
export type WebPushState = 'loading' | 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on';

const SERVICE_WORKER = '/sw.js';

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER);
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** The VAPID key comes as base64url; subscribe() wants the raw bytes */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export async function getWebPushState(): Promise<WebPushState> {
  if (!isSupported()) return isIos() && !isInstalled() ? 'needs-install' : 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return (await currentSubscription()) ? 'on' : 'off';
}

/** Must run from a click: browsers (Safari especially) only show the permission prompt then */
export async function enableWebPush(): Promise<WebPushState> {
  // Ask first, before any network call, so the click still counts as the user's gesture
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';

  const key = await notificationsApi.getWebPushKey();
  if (!key) throw new Error('Notifications are not set up on the server yet');

  const registration = await navigator.serviceWorker.register(SERVICE_WORKER);
  await navigator.serviceWorker.ready;

  // A subscription made with an older server key can't be reused
  await (await registration.pushManager.getSubscription())?.unsubscribe();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(key),
  });
  await notificationsApi.registerWebPush(subscription.toJSON(), timeZone());
  return 'on';
}

export async function disableWebPush(): Promise<WebPushState> {
  const subscription = await currentSubscription();
  if (subscription) {
    await notificationsApi.unregisterWebPush(subscription.endpoint).catch(() => undefined);
    await subscription.unsubscribe();
  }
  return 'off';
}

/** Asks the server to push to this browser now; throws with the reason when it can't */
export async function sendTestWebPush(): Promise<void> {
  const subscription = await currentSubscription();
  if (!subscription) throw new Error('Notifications are off on this device');
  await notificationsApi.sendTestWebPush(subscription.endpoint);
}

/** On every dashboard load: keeps this browser linked to whoever is signed in now */
export async function syncWebPush(): Promise<void> {
  if (!isSupported() || Notification.permission !== 'granted') return;
  const subscription = await currentSubscription();
  if (subscription) await notificationsApi.registerWebPush(subscription.toJSON(), timeZone());
}

/** On sign-out (while the token still works): stop this user's pushes to this browser */
export async function forgetWebPushForUser(): Promise<void> {
  if (!isSupported()) return;
  const subscription = await currentSubscription();
  if (subscription) await notificationsApi.unregisterWebPush(subscription.endpoint);
}
