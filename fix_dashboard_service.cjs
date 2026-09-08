const fs = require('fs');

let content = fs.readFileSync('src/services/dashboardService.ts', 'utf8');

const imports = `import { mockChartData, mockPatientExercises, mockRecentWorkouts, mockPainReports } from '../mocks/dashboard';
import { db } from './db';
import { PatientAdherence, Patient, Profile } from '../types';`;

const newGetPainReports = `
  getPainReports: async () => {
    const adherences = db.get('ADHERENCE');
    const patients = db.get('PATIENTS');
    const profiles = db.get('PROFILES');

    const calculatedReports = adherences
      .filter(a => a.dor_relato || (a.borg_rating && a.borg_rating >= 5))
      .map(a => {
        const patient = patients.find(p => p.id === a.patient_id);
        const profile = profiles.find(p => p.id === patient?.profile_id);
        
        return {
          id: a.id,
          patientId: a.patient_id,
          name: profile?.nome_completo || 'Paciente Desconhecido',
          eva: a.borg_rating || 5,
          patologia: patient?.patologia_principal || 'Geral',
          relato: a.dor_relato || \`Avaliação de esforço/dor elevada (Borg \${a.borg_rating}).\`,
          data: new Date(a.data_execucao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        };
      });

    // Merge calculated with mock if we want, or just return calculated
    // If calculated is empty, return the mock ones for display purposes of the prototype.
    if (calculatedReports.length > 0) {
      // Return both, with calculated first
      const uniqueMocks = mockPainReports.filter(m => !calculatedReports.some(c => c.patientId === m.patientId));
      return db.delay([...calculatedReports, ...uniqueMocks]);
    }
    
    return db.delay(mockPainReports);
  },
`;

content = content.replace("import { mockPainReports, mockChartData, mockPatientExercises, mockRecentWorkouts } from '../mocks/dashboard';\nimport { db } from './db';", imports);
content = content.replace("getPainReports: async () => {\n    return db.delay(mockPainReports);\n  },", newGetPainReports);

fs.writeFileSync('src/services/dashboardService.ts', content);
