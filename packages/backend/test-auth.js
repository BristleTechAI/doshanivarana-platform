require('dotenv').config();
const fetch = require('node-fetch');

async function testAuth() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  
  console.log(`Authenticating with email: [${email}] and password: [${password}] ...`);
  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testAuth();
