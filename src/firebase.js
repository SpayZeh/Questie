import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB6OtQi_8Wv16mQcnBm_1OqTqp5oG6vf5M',
  authDomain: 'questie-c51f2.firebaseapp.com',
  projectId: 'questie-c51f2',
  storageBucket: 'questie-c51f2.firebasestorage.app',
  messagingSenderId: '1037902322189',
  appId: '1:1037902322189:web:715126f726246323e21344',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
