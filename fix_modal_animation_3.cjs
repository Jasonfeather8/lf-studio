const fs = require('fs');
let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

file = file.replace(
  "            />}\n            {showSuccessModal &&\n            {/* Bottom Sheet container */}\n            <motion.div",
  "            />\n          )}\n          {showSuccessModal && (\n            <motion.div key=\"bottom-sheet\"\n            {/* Bottom Sheet container */}\n"
);

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
