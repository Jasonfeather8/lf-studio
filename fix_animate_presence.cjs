const fs = require('fs');

let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

// Replace the fragment inside the bottom sheet modal with a div with a key
file = file.replace(
  "{showSuccessModal && (\n          <>",
  "{showSuccessModal && (\n          <div key=\"success-modal\">"
);

// We need to find the matching </> and replace it with </div>
// The closing </> is right before </AnimatePresence> for the portal
file = file.replace(
  "          </>\n        )}\n</AnimatePresence>,",
  "          </div>\n        )}\n</AnimatePresence>,"
);

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
