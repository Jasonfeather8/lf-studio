const fs = require('fs');

const content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const s1 = content.indexOf('{/* 1. LOGIN (Tela 1.0) */}');
const s2 = content.indexOf('{/* 2. CADASTRO PACIENTE (Tela 1.1) */}');
const s3 = content.indexOf('{/* 3. CADASTRO PROFISSIONAL (Tela 1.2) */}');
const end = content.lastIndexOf('</div>');

const view1 = content.substring(s1, s2);
const view2 = content.substring(s2, s3);
const view3 = content.substring(s3, end);

let newPage = content.substring(0, s1) + `
      {view === 'login' && <LoginForm setView={setView} />}
      {view === 'register-patient' && <RegisterPatientForm setView={setView} />}
      {view === 'register-physio' && <RegisterPhysioForm setView={setView} />}
` + content.substring(end);

fs.writeFileSync('src/pages/Login.tsx', newPage);
fs.writeFileSync('src/components/login/LoginForm.tsx', view1);
fs.writeFileSync('src/components/login/RegisterPatientForm.tsx', view2);
fs.writeFileSync('src/components/login/RegisterPhysioForm.tsx', view3);
