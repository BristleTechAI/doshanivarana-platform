require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
const fetch = require('node-fetch');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);

async function runFullTest() {
  console.log('--- Starting Full Delivery Workflow Test ---');
  const deliveryId = 'del_test_mock_123';
  const templeId = 'temple_test_mock_999';
  
  try {
    console.log(`\n1. Creating dummy delivery document in Firestore (${deliveryId})...`);
    const deliveryRef = doc(firestoreDb, 'deliveries', deliveryId);
    await setDoc(deliveryRef, {
      id: deliveryId,
      bookingId: 'book_mock_123',
      devoteeName: 'Test Devotee',
      mobile: '9876543210',
      address: 'Test Address',
      pincode: '110030',
      poojaName: 'Test Pooja',
      templeId: templeId,
      status: 'PACKED' // Simulating it's ready to ship
    });
    console.log('Document created.');
    
    console.log('\n2. Hitting our backend to create Shiprocket pickup (Admin Flow)...');
    // SKIPPED: Already created previously
    /*
    const pickupRes = await fetch('http://localhost:3001/api/shiprocket/create-pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templeId,
        name: 'Test Temple',
        email: 'test@temple.com',
        phone: '9876543210',
        address: '123 Temple St',
        city: 'Varanasi',
        state: 'UP',
        pincode: '221001'
      })
    });
    const pickupData = await pickupRes.json();
    console.log('Pickup API Response:', pickupData);
    */
    
    console.log('\n3. Hitting our backend to create Shiprocket order (Pro Panel Flow)...');
    const orderRes = await fetch('http://localhost:3001/api/shiprocket/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryId,
        bookingId: 'book_mock_123',
        devoteeName: 'Test Devotee',
        mobile: '9876543210',
        address: 'Test Address',
        pincode: '110030',
        weight: '0.5',
        length: '10',
        width: '10',
        height: '10',
        poojaName: 'Test Pooja',
        templeId
      })
    });
    const orderData = await orderRes.json();
    console.log('Order API Response:', orderData);
    
    console.log('\n4. Verifying Firestore document was updated successfully...');
    const updatedDoc = await getDoc(deliveryRef);
    const docData = updatedDoc.data();
    
    console.log('Updated Document Data:', {
      status: docData.status,
      trackingNumber: docData.trackingNumber,
      courier: docData.courier,
      trackingUrl: docData.trackingUrl
    });
    
    if (docData.status === 'SHIPPED' && docData.trackingNumber) {
      console.log('\nSUCCESS! The entire delivery workflow works perfectly!');
    } else {
      console.log('\nFAILED: Document was not updated properly.');
    }
    
  } catch (err) {
    console.error('Test script error:', err);
  }
  
  process.exit(0);
}

runFullTest();
