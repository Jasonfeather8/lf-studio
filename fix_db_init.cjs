const fs = require('fs');
let db = fs.readFileSync('src/services/db.ts', 'utf8');
db = db.replace(
  "if (!localStorage.getItem(KEYS.PRESCRIPTION_EXERCISES)) {",
  "const localPe = localStorage.getItem(KEYS.PRESCRIPTION_EXERCISES);\n  if (!localPe || localPe.includes('exe-rotator-cuff')) {"
);
fs.writeFileSync('src/services/db.ts', db);
