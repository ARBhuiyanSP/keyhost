/* =====================================================
   Keyhost Homes — Service Worker (sw.js)
   Handles: Push Notifications + Notification Clicks
   ===================================================== */

self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(self.clients.claim());
});

// ── Push Event: Show Notification ─────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Keyhost Homes', body: event.data.text() };
  }

  const title = data.title || 'Keyhost Homes';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'keyhost-notification',
    data: { url: data.url || '/' },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  // ── Broadcast to active clients for foreground sound/UI ──
  const broadcastPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'PUSH_RECEIVED',
          title: title,
          body: options.body
        });
      });
    });

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      broadcastPromise
    ])
  );
});

// ── Notification Click: Navigate to URL ───────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
