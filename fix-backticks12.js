const fs = require('fs');

const file = 'pro-panel/src/pages/BookingDetail.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);

console.log('Fixed backticks in PRO panel BookingDetail');
