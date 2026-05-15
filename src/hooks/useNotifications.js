import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db } from '../firebase.js';

// Paste your VAPID key from:
// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

async function getMessagingInstance() {
  try {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(userId) {
  if (!('Notification' in window)) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return 'unsupported';

    const base = import.meta.env.BASE_URL || '/';
    const swReg = await navigator.serviceWorker.register(`${base}firebase-messaging-sw.js`);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });

    if (token && userId) {
      await updateDoc(doc(db, 'users', userId), { fcmToken: token, notificationsEnabled: true });
    }
    return 'granted';
  } catch (e) {
    console.error('FCM token error:', e);
    return 'error';
  }
}

export function notificationsSupported() {
  return 'Notification' in window;
}

export function notificationsBlocked() {
  return 'Notification' in window && Notification.permission === 'denied';
}
