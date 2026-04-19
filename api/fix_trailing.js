const fs = require('fs');
const path = require('path');

const files = [
  'web/src/pages/RecordDeath.tsx',
  'web/src/pages/Login.tsx',
  'web/src/pages/Inventory.tsx',
  'web/src/pages/Dashboard.tsx',
  'web/src/components/layout/Shell.tsx'
];

for (const f of files) {
  const fullPath = path.join(__dirname, '..', f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.trim().endsWith('创新')) {
      content = content.replace(/创新\s*$/, '');
      fs.writeFileSync(fullPath, content);
      console.log(`Cleaned ${f}`);
    }
  }
}
