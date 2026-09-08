const fs = require('fs');
['RegisterPatientForm', 'RegisterPhysioForm'].forEach(name => {
  let content = fs.readFileSync(`src/components/login/${name}.tsx`, 'utf8');
  content = content.replace('{/* 2. CADASTRO PACIENTE (Tela 1.1) */', '');
  content = content.replace('{/* 3. CADASTRO PROFISSIONAL (Tela 1.2) */', '');
  fs.writeFileSync(`src/components/login/${name}.tsx`, content);
});
