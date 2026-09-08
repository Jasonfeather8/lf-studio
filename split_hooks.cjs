const fs = require('fs');

const index = fs.readFileSync('src/hooks/index.ts', 'utf8');

// We will just create a new index.ts that exports everything from queries
fs.mkdirSync('src/hooks/queries', { recursive: true });

fs.writeFileSync('src/hooks/queries/useProfiles.ts', `import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../services/profileService';
import { KEYS } from '../keys';

export function useProfilesQuery() {
  return useQuery({
    queryKey: KEYS.PROFILES,
    queryFn: () => profileService.getAll(),
  });
}
`);

fs.writeFileSync('src/hooks/queries/useExercises.ts', `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '../../services/exerciseService';
import { Exercise } from '../../types';
import { KEYS } from '../keys';

export function useExercisesQuery() {
  return useQuery({
    queryKey: KEYS.EXERCISES,
    queryFn: () => exerciseService.getAll(),
  });
}

export function useCreateExerciseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exercise: Omit<Exercise, 'id'>) => exerciseService.create(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.EXERCISES });
    },
  });
}

export function useUpdateExerciseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Exercise> }) =>
      exerciseService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.EXERCISES });
    },
  });
}

export function useDeleteExerciseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exerciseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.EXERCISES });
    },
  });
}
`);

fs.writeFileSync('src/hooks/queries/usePrescriptions.ts', `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionService } from '../../services/prescriptionService';
import { Prescription, PrescriptionExercise } from '../../types';
import { KEYS } from '../keys';

export function usePrescriptionsQuery() {
  return useQuery({
    queryKey: KEYS.PRESCRIPTIONS,
    queryFn: () => prescriptionService.getAll(),
  });
}

export function usePrescriptionExercisesQuery(prescriptionId: string | null) {
  return useQuery({
    queryKey: KEYS.PRESCRIPTION_EXERCISES(prescriptionId || ''),
    queryFn: () => prescriptionService.getExercisesByPrescriptionId(prescriptionId || ''),
    enabled: !!prescriptionId,
  });
}

export function useCreatePrescriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prescription, exercises }: { prescription: Omit<Prescription, 'id'>; exercises: Omit<PrescriptionExercise, 'id' | 'prescription_id'>[] }) => 
      prescriptionService.create(prescription, exercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PRESCRIPTIONS });
    },
  });
}

export function useUpdatePrescriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates, exercises }: { id: string; updates: Partial<Prescription>; exercises?: Omit<PrescriptionExercise, 'id' | 'prescription_id'>[] }) => 
      prescriptionService.update(id, updates, exercises),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.PRESCRIPTIONS });
      queryClient.invalidateQueries({ queryKey: KEYS.PRESCRIPTION_EXERCISES(variables.id) });
    },
  });
}

export function useDeletePrescriptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PRESCRIPTIONS });
    },
  });
}
`);

fs.writeFileSync('src/hooks/queries/useExams.ts', `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../../services/examService';
import { PatientExam } from '../../types';
import { KEYS } from '../keys';

export function usePatientExamsQuery(patientId: string | null) {
  return useQuery({
    queryKey: KEYS.EXAMS(patientId || ''),
    queryFn: () => examService.getByPatientId(patientId || ''),
    enabled: !!patientId,
  });
}

export function useCreateExamMutation(patientId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exam: Omit<PatientExam, 'id' | 'data_upload' | 'status_sincronizacao'>) =>
      examService.create(exam),
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: KEYS.EXAMS(patientId) });
      }
    },
  });
}

export function useDeleteExamMutation(patientId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examService.delete(id),
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: KEYS.EXAMS(patientId) });
      }
    },
  });
}
`);

fs.writeFileSync('src/hooks/queries/useAdherence.ts', `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adherenceService } from '../../services/adherenceService';
import { KEYS } from '../keys';

export function useAdherenceStatsQuery() {
  return useQuery({
    queryKey: KEYS.ADHERENCE_STATS,
    queryFn: () => adherenceService.getStats(),
  });
}

export function usePatientAdherenceQuery(patientId: string | null) {
  return useQuery({
    queryKey: ['adherence', patientId],
    queryFn: () => adherenceService.getByPatientId(patientId || ''),
    enabled: !!patientId,
  });
}

export function useMarkCompletedMutation(patientId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prescriptionExerciseId, patId, borgRating }: { prescriptionExerciseId: string; patId: string; borgRating?: number }) => 
      adherenceService.markCompleted(prescriptionExerciseId, patId, borgRating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.ADHERENCE_STATS });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['adherence', patientId] });
      }
    },
  });
}
`);

fs.writeFileSync('src/hooks/queries/useDashboard.ts', `import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

export const DASHBOARD_KEYS = {
  PAIN_REPORTS: ['dashboard', 'pain_reports'],
  CHART_DATA: ['dashboard', 'chart_data'],
  PATIENT_EXERCISES: ['dashboard', 'patient_exercises'],
  RECENT_WORKOUTS: ['dashboard', 'recent_workouts'],
};

export function useDashboardPainReportsQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.PAIN_REPORTS,
    queryFn: () => dashboardService.getPainReports(),
  });
}

export function useDashboardChartDataQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.CHART_DATA,
    queryFn: () => dashboardService.getChartData(),
  });
}

export function useDashboardPatientExercisesQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.PATIENT_EXERCISES,
    queryFn: () => dashboardService.getPatientExercises(),
  });
}

export function useDashboardRecentWorkoutsQuery() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.RECENT_WORKOUTS,
    queryFn: () => dashboardService.getRecentWorkouts(),
  });
}
`);

fs.writeFileSync('src/hooks/keys.ts', `export const KEYS = {
  PROFILES: ['profiles'],
  PATIENTS: ['patients'],
  EXERCISES: ['exercises'],
  PRESCRIPTIONS: ['prescriptions'],
  PRESCRIPTION_EXERCISES: (pid: string) => ['prescriptions', pid, 'exercises'],
  EXAMS: (pid: string) => ['exams', pid],
  ADHERENCE_STATS: ['adherence_stats'],
};
`);

fs.writeFileSync('src/hooks/queries/usePatients.ts', `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';
import { KEYS } from '../keys';

export function usePatientsQuery() {
  return useQuery({
    queryKey: KEYS.PATIENTS,
    queryFn: () => patientService.getAll(),
  });
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patient: Omit<Patient, 'id'>) => patientService.create(patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PATIENTS });
      queryClient.invalidateQueries({ queryKey: KEYS.ADHERENCE_STATS });
    },
  });
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Patient> }) =>
      patientService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PATIENTS });
    },
  });
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PATIENTS });
      queryClient.invalidateQueries({ queryKey: KEYS.ADHERENCE_STATS });
    },
  });
}
`);

fs.writeFileSync('src/hooks/index.ts', `export * from './queries/useProfiles';
export * from './queries/usePatients';
export * from './queries/useExercises';
export * from './queries/usePrescriptions';
export * from './queries/useExams';
export * from './queries/useAdherence';
export * from './queries/useDashboard';
export * from './keys';
`);
