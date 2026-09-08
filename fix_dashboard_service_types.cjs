const fs = require('fs');

let content = fs.readFileSync('src/services/dashboardService.ts', 'utf8');

content = content.replace("const adherences = db.get('ADHERENCE');", "const adherences = db.get<PatientAdherence>('ADHERENCE');");
content = content.replace("const patients = db.get('PATIENTS');", "const patients = db.get<Patient>('PATIENTS');");
content = content.replace("const profiles = db.get('PROFILES');", "const profiles = db.get<Profile>('PROFILES');");

fs.writeFileSync('src/services/dashboardService.ts', content);
