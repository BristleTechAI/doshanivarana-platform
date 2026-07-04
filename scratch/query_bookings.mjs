import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function run() {
  const snapshot = await db.collection("bookings")
    .where("templeId", "==", "temple_001")
    .where("isDeleted", "==", false)
    .get();
  console.log(`Total Bookings for temple_001: ${snapshot.size}`);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id} | devoteeName: ${data.devoteeName || data.devoteeDetails?.name} | status: ${data.status || data.bookingStatus} | scheduledDate: ${data.scheduledDate} | paymentStatus: ${data.paymentStatus}`);
  });
  process.exit(0);
}

run().catch(console.error);
