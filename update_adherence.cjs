const fs = require('fs');

let useAdherence = fs.readFileSync('src/hooks/queries/useAdherence.ts', 'utf8');
useAdherence = useAdherence.replace(
  "mutationFn: ({ prescriptionExerciseId, patId, borgRating }: { prescriptionExerciseId: string; patId: string; borgRating?: number }) => \n      adherenceService.markCompleted(prescriptionExerciseId, patId, borgRating),",
  "mutationFn: ({ prescriptionExerciseId, patId, borgRating, dorRelato }: { prescriptionExerciseId: string; patId: string; borgRating?: number; dorRelato?: string }) => \n      adherenceService.markCompleted(prescriptionExerciseId, patId, borgRating, dorRelato),"
);
fs.writeFileSync('src/hooks/queries/useAdherence.ts', useAdherence);

let adherenceService = fs.readFileSync('src/services/adherenceService.ts', 'utf8');
adherenceService = adherenceService.replace(
  "markCompleted: async (\n    prescriptionExerciseId: string,\n    patientId: string,\n    borgRating?: number\n  ): Promise<PatientAdherence> => {",
  "markCompleted: async (\n    prescriptionExerciseId: string,\n    patientId: string,\n    borgRating?: number,\n    dorRelato?: string\n  ): Promise<PatientAdherence> => {"
);
adherenceService = adherenceService.replace(
  "const newAdherence: PatientAdherence = {\n      id: `adh-${Date.now()}`,\n      prescription_exercise_id: prescriptionExerciseId,\n      patient_id: patientId,\n      data_execucao: new Date().toISOString(),\n      status_sincronizacao: false,\n      borg_rating: borgRating\n    };",
  "const newAdherence: PatientAdherence = {\n      id: `adh-${Date.now()}`,\n      prescription_exercise_id: prescriptionExerciseId,\n      patient_id: patientId,\n      data_execucao: new Date().toISOString(),\n      status_sincronizacao: false,\n      borg_rating: borgRating,\n      dor_relato: dorRelato\n    };"
);
fs.writeFileSync('src/services/adherenceService.ts', adherenceService);
