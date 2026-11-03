// Service worker: shows push notifications from the API and opens the right page on tap.
// It only handles push; it doesn't cache pages.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data && event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Hotel Manager', {
      body: data.body || '',
      tag: data.tag, // the same reminder replaces itself instead of stacking
      icon: '/pwa-icon/192',
      badge: '/pwa-icon/96',
      data: { url: data.url || '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/dashboard', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // Reuse an open app window when there is one
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.navigate(url).then((c) => (c || client).focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
