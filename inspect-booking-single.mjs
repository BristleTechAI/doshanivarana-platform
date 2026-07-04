import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, './pro-panel/.env'), override: true });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function run() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const docIds = ["BK_1781503165326", "iBP9ZZMVFn8kWSIIMUFw"];
  for (const id of docIds) {
    const snap = await getDoc(doc(db, "bookings", id));
    if (snap.exists()) {
      console.log(`Document ${id}:`, JSON.stringify(snap.data(), null, 2));
    }
  }
}

run().catch(console.error);
