const fs = require('fs');

const templesPath = 'admin-panel/admin/src/app/components/pages/Temples.tsx';
let templesContent = fs.readFileSync(templesPath, 'utf8');
templesContent = templesContent.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(templesPath, templesContent);

const poojasPath = 'admin-panel/admin/src/app/components/pages/Poojas.tsx';
let poojasContent = fs.readFileSync(poojasPath, 'utf8');
poojasContent = poojasContent.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(poojasPath, poojasContent);

console.log('Fixed backticks in Temples.tsx and Poojas.tsx');
