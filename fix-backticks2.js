const fs = require('fs');

const files = [
  'pro-panel/src/pages/Schedule.tsx',
  'pro-panel/src/pages/AddEditSlot.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
});

console.log('Fixed backticks in PRO panel');
