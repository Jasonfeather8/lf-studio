const fs = require('fs');

const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Find the boundaries
const startChart = content.indexOf('function WeeklyAdherenceChart() {');
const startDashboard = content.indexOf('export default function Dashboard() {');
const startPatientRotina = content.indexOf('function PatientRotinaView() {');

// I can just extract them like this:
const imports = content.substring(0, startChart);

const chartCode = content.substring(startChart, startDashboard);
const dashboardCode = content.substring(startDashboard, startPatientRotina);
const patientRotinaCode = content.substring(startPatientRotina);

fs.writeFileSync('src/components/dashboard/WeeklyAdherenceChart.tsx', 
  imports.replace('import { useUIStore } from \'../store/uiStore\';', 'import { useUIStore } from \'../../store/uiStore\';').replace(/from '\.\.\//g, "from '../../") + "\n" + chartCode + "\nexport default WeeklyAdherenceChart;");

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', 
  imports.replace('import { useUIStore } from \'../store/uiStore\';', 'import { useUIStore } from \'../../store/uiStore\';').replace(/from '\.\.\//g, "from '../../") + "\n" + patientRotinaCode + "\nexport default PatientRotinaView;");

fs.writeFileSync('src/pages/Dashboard.tsx', 
  imports + "\nimport WeeklyAdherenceChart from '../components/dashboard/WeeklyAdherenceChart';\nimport PatientRotinaView from '../components/dashboard/PatientRotinaView';\n\n" + dashboardCode);

