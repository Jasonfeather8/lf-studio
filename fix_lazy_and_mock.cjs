const fs = require('fs');

let adminCard = fs.readFileSync('src/components/patients/AdminPrescriptionCard.tsx', 'utf8');
adminCard = adminCard.replace(
  "const { data: exercises } = usePrescriptionExercisesQuery(isExpanded ? presc.id : null);",
  "const { data: exercises } = usePrescriptionExercisesQuery(presc.id);"
);
fs.writeFileSync('src/components/patients/AdminPrescriptionCard.tsx', adminCard);

let mockPrescriptions = fs.readFileSync('src/mocks/prescriptions.ts', 'utf8');
mockPrescriptions = mockPrescriptions.replace(/'exe-rotator-cuff'/g, "'exe-rotacao-externa'");
mockPrescriptions = mockPrescriptions.replace(/'exe-cat-cow'/g, "'exe-gato-camelo'");
mockPrescriptions = mockPrescriptions.replace(/'exe-dead-bug'/g, "'exe-preensao-isometr'");
mockPrescriptions = mockPrescriptions.replace(/'exe-quad-isom'/g, "'exe-extensao-terminal'");
mockPrescriptions = mockPrescriptions.replace(/'exe-bridges'/g, "'exe-agachamento-gl'");

fs.writeFileSync('src/mocks/prescriptions.ts', mockPrescriptions);
