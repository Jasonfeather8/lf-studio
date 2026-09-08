const fs = require('fs');

let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

// Replace the <div key="success-modal"> and its closing </div>
file = file.replace(
  "{showSuccessModal && (\n          <div key=\"success-modal\">",
  "{showSuccessModal && <motion.div key=\"backdrop\""
);

file = file.replace(
  "className=\"fixed inset-0 bg-neutral-950/60 dark:bg-neutral-950/80 z-[100] backdrop-blur-xs\"\n            />",
  "className=\"fixed inset-0 bg-neutral-950/60 dark:bg-neutral-950/80 z-[100] backdrop-blur-xs\"\n            />}\n            {showSuccessModal &&"
);

file = file.replace(
  "          </div>\n        )}\n</AnimatePresence>,",
  "        }\n</AnimatePresence>,"
);

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
