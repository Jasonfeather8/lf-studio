const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');
content = content.replace(
  "borg_rating?: number; // Added: Scale 1-10\n}",
  "borg_rating?: number; // Added: Scale 1-10\n  dor_relato?: string;\n}"
);
fs.writeFileSync('src/types/index.ts', content);
