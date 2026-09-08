const fs = require('fs');
let file = fs.readFileSync('src/services/dashboardService.ts', 'utf8');

file = file.replace(
  "import { PatientAdherence, Patient, Profile } from '../types';",
  "import { PatientAdherence, Patient, Profile, PainAlert, DashboardChartData, RecentWorkout } from '../types';"
);

file = file.replace(
  "getPainReports: async () => {",
  "getPainReports: async (): Promise<PainAlert[]> => {"
);
file = file.replace(
  "getChartData: async () => {",
  "getChartData: async (): Promise<DashboardChartData[]> => {"
);
file = file.replace(
  "getPatientExercises: async () => {",
  "getPatientExercises: async (): Promise<any[]> => {"
);
file = file.replace(
  "getRecentWorkouts: async () => {",
  "getRecentWorkouts: async (): Promise<RecentWorkout[]> => {"
);

fs.writeFileSync('src/services/dashboardService.ts', file);
