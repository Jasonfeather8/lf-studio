const fs = require('fs');
let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

if (!file.includes("CheckCircle")) {
  file = file.replace(
    "import { \n  Users, Search, UserPlus, Filter, X, Save, Edit3, Trash2,\n  MapPin, Phone, Mail, Calendar, Activity, ChevronRight,",
    "import { \n  Users, Search, UserPlus, Filter, X, Save, Edit3, Trash2,\n  MapPin, Phone, Mail, Calendar, Activity, ChevronRight, CheckCircle,"
  );
}

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
