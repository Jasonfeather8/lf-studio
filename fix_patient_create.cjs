const fs = require('fs');

const path = 'src/components/login/RegisterPatientForm.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  `id: \\\`pat-\\\${\\Math.random().toString(36).substring(2, 11)}\\\`, profile_id: profileId,`,
  `profile_id: profileId,`
);
fs.writeFileSync(path, content);
