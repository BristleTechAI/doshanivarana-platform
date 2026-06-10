const fs = require('fs');

const files = [
  'user-app/app/live/[id].tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
});

console.log('Fixed backticks in User App live[id]');
