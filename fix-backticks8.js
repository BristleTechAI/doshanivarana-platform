const fs = require('fs');

const file = 'pro-panel/src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);

console.log('Fixed backticks in PRO panel Layout');
