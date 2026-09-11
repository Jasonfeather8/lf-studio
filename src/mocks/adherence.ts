import { PatientAdherence } from '../types';

export const mockAdherence: PatientAdherence[] = [
  // Ricardo Oliveira (Completed sessions for Phase 1)
  {
    id: 'adh-1',
    prescription_exercise_id: 'pre-exe-1', // relates to pre-1
    patient_id: 'pat-ricardo',
    data_execucao: '2026-07-21T10:30:00Z',
    status_sincronizacao: true,
    borg_rating: 4,
    dor_relato: 'Sentiu leve fisgada na lateral do ombro ao estender o braço.',
    sentiu_dor: true
  },
  {
    id: 'adh-2',
    prescription_exercise_id: 'pre-exe-2',
    patient_id: 'pat-ricardo',
    data_execucao: '2026-07-21T10:35:00Z',
    status_sincronizacao: true,
    borg_rating: 4,
    sentiu_dor: false
  },
  {
    id: 'adh-3',
    prescription_exercise_id: 'pre-exe-3',
    patient_id: 'pat-ricardo',
    data_execucao: '2026-07-21T10:45:00Z',
    status_sincronizacao: true,
    borg_rating: 5,
    sentiu_dor: false
  },
  
  {
    id: 'adh-4',
    prescription_exercise_id: 'pre-exe-1',
    patient_id: 'pat-ricardo',
    data_execucao: '2026-07-19T09:15:00Z',
    status_sincronizacao: true,
    borg_rating: 6,
    sentiu_dor: false
  },
  {
    id: 'adh-5',
    prescription_exercise_id: 'pre-exe-2',
    patient_id: 'pat-ricardo',
    data_execucao: '2026-07-19T09:20:00Z',
    status_sincronizacao: true,
    borg_rating: 7,
    sentiu_dor: false
  },

  {
    id: 'adh-6',
    prescription_exercise_id: 'pre-exe-1',
    patient_id: 'pat-ricardo',
    data_execucao: '2026-07-16T18:45:00Z',
    status_sincronizacao: true,
    borg_rating: 8,
    sentiu_dor: false
  },

  // Helena Ferreira
  {
    id: 'adh-7',
    prescription_exercise_id: 'pre-exe-5',
    patient_id: 'pat-helena',
    data_execucao: '2026-07-22T14:00:00Z',
    status_sincronizacao: true,
    borg_rating: 3,
    sentiu_dor: false
  }
];
