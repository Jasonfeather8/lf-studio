const fs = require('fs');
let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

file = file.replace(
  "  Check,\n  X,\n } from 'lucide-react';",
  "  Check,\n  X,\n  CheckCircle,\n } from 'lucide-react';"
);

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
