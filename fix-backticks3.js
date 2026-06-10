const fs = require('fs');

const file = 'user-app/app/booking/[id].tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);

console.log('Fixed backticks in User app');
