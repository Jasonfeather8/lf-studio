const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');

types = types.replace(
  "export interface WorkoutSession {\n  id: string;\n  patient_id: string;\n  prescription_id: string;\n  data_inicio: string;\n  data_fim: string;\n  borg_rating: number | null;\n  status: 'concluida' | 'cancelada';\n}",
  ""
);

types = types.replace(
  "export interface SummaryAdherence {\n  physio_id: string;\n  data_referencia: string;\n  total_exercicios_prescritos: number;\n  total_exercicios_concluidos: number;\n}",
  ""
);

const newTypes = `
export interface PainAlert {
  id: string;
  patientId: string;
  name: string;
  eva: number;
  patologia: string;
  relato: string;
  data: string;
  avatar: string;
}

export interface DashboardChartData {
  label: string;
  pct: number;
  completed: number;
  prescribed: number;
}

export interface RecentWorkout {
  id: string;
  patientId: string;
  name: string;
  protocol: string;
  time: string;
  status: string;
  avatar: string;
}
`;

types += newTypes;
fs.writeFileSync('src/types/index.ts', types);
