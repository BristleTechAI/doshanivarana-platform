const fs = require('fs');

const file = 'admin-panel/admin/src/app/components/pages/Bookings.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);

console.log('Fixed backticks in Admin panel bookings');
