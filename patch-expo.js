const fs = require('fs');
const path = require('path');

function search(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('import(') || content.includes('import (')) {
         console.log("HAS IMPORT:", fullPath);
         if (content.includes('ERR_UNSUPPORTED_ESM_URL_SCHEME') || content.includes('metro.config') || content.includes('configPath') || content.includes('tailwind.config')) {
             console.log("LIKELY CULPRIT:", fullPath);
         }
      }
    }
  }
}

search(path.join(process.cwd(), 'user-app/node_modules/tailwindcss'));
search(path.join(process.cwd(), 'node_modules/tailwindcss'));
search(path.join(process.cwd(), 'node_modules/nativewind'));
search(path.join(process.cwd(), 'node_modules/@tailwindcss'));
search(path.join(process.cwd(), 'node_modules/postcss-load-config'));
search(path.join(process.cwd(), 'node_modules/jiti'));
