require('dotenv').config({ path: 'packages/backend/.env' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

console.log('Config:', firebaseConfig);

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log('Firebase initialized successfully!');
  process.exit(0);
} catch (e) {
  console.error('Firebase initialization failed:', e);
  process.exit(1);
}
