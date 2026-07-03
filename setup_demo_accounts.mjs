import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from admin-panel since both share the same Firebase project
dotenv.config({ path: resolve(__dirname, 'admin-panel/admin/.env'), override: true });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey) {
  console.error("Missing Firebase configuration in admin-panel/admin/.env!");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const demoUsers = [
  {
    email: 'admin@doshanivarana.com',
    password: 'adminPassword123!',
    role: 'ADMIN',
    name: 'Super Admin',
    isActive: true
  },
  {
    email: 'pro@doshanivarana.com',
    password: 'proPassword123!',
    role: 'PRO',
    name: 'PRO Manager 1',
    templeId: 'temple_001',
    isActive: true
  },
  {
    email: 'pro2@doshanivarana.com',
    password: 'proPassword123!',
    role: 'PRO',
    name: 'PRO Manager 2',
    templeId: 'temple_002',
    isActive: true
  }
];

async function setupDemoAccounts() {
  console.log("Setting up Demo Accounts in Firebase...");
  
  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.email} ...`);
      let uid;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        uid = userCredential.user.uid;
        console.log(`✅ Success: ${user.email} created with UID: ${uid}`);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          console.log(`⚠️ User ${user.email} already exists in Auth. Logging in to get UID...`);
          const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
          uid = userCredential.user.uid;
        } else {
          throw authErr;
        }
      }
      
      // Map/Write to Firestore to ensure user profile exists
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.templeId && { templeId: user.templeId }),
        isActive: user.isActive,
        createdAt: new Date().toISOString()
      });
      
      console.log(`✅ Firestore document created/verified for: ${user.email} (UID: ${uid})`);
    } catch (error) {
      console.error(`❌ Failed to process ${user.email}:`, error.message);
    }
  }
  
  console.log("Done.");
  process.exit(0);
}

setupDemoAccounts();
