const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../supabase/seed.sql'),
  path.join(__dirname, '../db/seed.sql')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replaces the invalid 'u' prefix with 'a' for valid UUID hex
  content = content.replace(/'u1000000/g, "'a1000000");
  fs.writeFileSync(file, content);
  console.log(`Fixed UUIDs in ${file}`);
}
