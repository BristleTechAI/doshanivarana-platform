const fetch = require('node-fetch');

async function testFlow() {
  console.log('Testing Shiprocket delivery flow...');
  
  // 1. Create Pickup Location (simulating Admin Panel action)
  console.log('\n--- Step 1: Creating Pickup Location ---');
  try {
    const pickupRes = await fetch('http://localhost:3001/api/shiprocket/create-pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templeId: 'temple_test_01',
        name: 'Test Temple Admin',
        email: 'test@doshanivarana.com',
        phone: '9876543210',
        address: '123 Test Street, Holy City',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221001'
      })
    });
    
    const pickupData = await pickupRes.json();
    console.log('Pickup Location Result:', pickupData);
  } catch (err) {
    console.error('Error creating pickup:', err.message);
  }

  // 2. Dispatch Order (simulating Pro Panel action)
  console.log('\n--- Step 2: Creating Order/Shipment ---');
  try {
    const orderRes = await fetch('http://localhost:3001/api/shiprocket/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryId: 'del_test_999',
        bookingId: 'book_test_999',
        devoteeName: 'Test Devotee',
        mobile: '9876543210',
        address: '456 Devotee Lane, City',
        pincode: '110030',
        weight: '0.5',
        length: '10',
        width: '10',
        height: '10',
        poojaName: 'Test Pooja',
        templeId: 'temple_test_01'
      })
    });
    
    const orderData = await orderRes.json();
    console.log('Create Order Result:', orderData);
    
    // 3. If tracking was generated, let's try to track it
    if (orderData.awbNumber) {
      console.log('\n--- Step 3: Tracking AWB ---');
      const trackRes = await fetch(`http://localhost:3001/api/shiprocket/track/${orderData.awbNumber}`);
      const trackData = await trackRes.json();
      console.log('Track Result:', trackData);
    }
  } catch (err) {
    console.error('Error in dispatch/track:', err.message);
  }
}

testFlow();
