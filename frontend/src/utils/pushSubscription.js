import api from './api';

const SW_PATH = '/sw.js';
const STORAGE_KEY = 'keyhost_push_subscribed';

// Convert base64 VAPID key to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service Workers not supported in this browser');
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH);
    console.log('[Push] Service Worker registered:', reg.scope);
    return reg;
  } catch (err) {
    console.error('[Push] Service Worker registration failed:', err);
    return null;
  }
}

// Check if push is supported and permission is granted
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export function isSubscribed() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

// Subscribe user to push notifications
export async function subscribeToPush() {
  try {
    if (!isPushSupported()) {
      console.warn('[Push] Push not supported');
      return false;
    }

    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] Notification permission denied');
      return false;
    }

    // 2. Get VAPID public key from backend
    const { data } = await api.get('/push/vapid-public-key');
    if (!data.publicKey) throw new Error('No VAPID public key returned');

    // 3. Get or create service worker registration
    let reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (!reg) {
      reg = await navigator.serviceWorker.register(SW_PATH);
    }
    await navigator.serviceWorker.ready;

    // 4. Subscribe via PushManager
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey)
    });

    // 5. Send subscription to backend
    const subJson = subscription.toJSON();
    await api.post('/push/subscribe', {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
      userAgent: navigator.userAgent
    });

    localStorage.setItem(STORAGE_KEY, 'true');
    console.log('[Push] ✅ Subscribed successfully');
    return true;
  } catch (err) {
    console.error('[Push] Subscribe error:', err.message || err);
    return false;
  }
}

// Unsubscribe user from push notifications
export async function unsubscribeFromPush() {
  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (reg) {
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await api.delete('/push/unsubscribe', { data: { endpoint } });
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Push] Unsubscribed');
    return true;
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err.message || err);
    return false;
  }
}
