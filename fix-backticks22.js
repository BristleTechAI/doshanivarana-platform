const fs = require('fs');

const files = [
  'admin-panel/admin/src/app/components/pages/Recordings.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
});

console.log('Fixed backticks in Admin Recordings');
