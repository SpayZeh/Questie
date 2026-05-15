importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB6OtQi_8Wv16mQcnBm_1OqTqp5oG6vf5M',
  authDomain: 'questie-c51f2.firebaseapp.com',
  projectId: 'questie-c51f2',
  storageBucket: 'questie-c51f2.firebasestorage.app',
  messagingSenderId: '1037902322189',
  appId: '1:1037902322189:web:715126f726246323e21344',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'hey questie!';
  const body  = payload.notification?.body  || 'new quest just dropped!';
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'new-quest',
    renotify: true,
  });
});
