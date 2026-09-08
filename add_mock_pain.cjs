const fs = require('fs');

let mockAdherence = fs.readFileSync('src/mocks/adherence.ts', 'utf8');
mockAdherence = mockAdherence.replace(
  "id: 'adh-1',\n    prescription_exercise_id: 'pre-exe-1', // relates to pre-1\n    patient_id: 'pat-ricardo',\n    data_execucao: '2026-07-21T10:30:00Z',\n    status_sincronizacao: true,\n    borg_rating: 4\n  },",
  "id: 'adh-1',\n    prescription_exercise_id: 'pre-exe-1', // relates to pre-1\n    patient_id: 'pat-ricardo',\n    data_execucao: '2026-07-21T10:30:00Z',\n    status_sincronizacao: true,\n    borg_rating: 4,\n    dor_relato: 'Sentiu leve fisgada na lateral do ombro ao estender o braço.'\n  },"
);
fs.writeFileSync('src/mocks/adherence.ts', mockAdherence);
