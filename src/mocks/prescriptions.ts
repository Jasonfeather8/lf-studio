import { Prescription, PrescriptionExercise } from '../types';

export const mockPrescriptions: Prescription[] = [
  {
    id: 'pre-ricardo',
    patient_id: 'pat-ricardo',
    physio_id: 'physio-123',
    titulo: 'Protocolo: Pós-Operatório Ombro',
    data_inicio: '2026-06-01',
    data_fim: '2026-09-01',
    dias_semana: [1, 3, 5],
    status: 'ativo',
    created_at: '2026-06-01T00:00:00Z'
  },
  {
    id: 'pre-beatriz',
    patient_id: 'pat-beatriz',
    physio_id: 'physio-123',
    titulo: 'Protocolo: Estabilização Lombar',
    data_inicio: '2026-06-15',
    data_fim: '2026-09-15',
    dias_semana: [2, 4, 6],
    status: 'ativo',
    created_at: '2026-06-15T00:00:00Z'
  },
  {
    id: 'pre-helena',
    patient_id: 'pat-helena',
    physio_id: 'physio-123',
    titulo: 'Protocolo: Fortalecimento MMII',
    data_inicio: '2026-07-01',
    data_fim: '2026-10-01',
    dias_semana: [1, 2, 3, 4, 5],
    status: 'ativo',
    created_at: '2026-07-01T00:00:00Z'
  }
];

export const mockPrescriptionExercises: PrescriptionExercise[] = [
  // Ricardo Oliveira (Pós-Op Ombro)
  {
    id: 'pre-exe-1',
    prescription_id: 'pre-ricardo',
    exercise_id: 'exe-rotacao-externa',
    series: 3,
    repeticoes: 10,
    tempo_descanso: 30,
    local_execucao: 'estúdio',
    ordem: 1
  },
  {
    id: 'pre-exe-2',
    prescription_id: 'pre-ricardo',
    exercise_id: 'exe-gato-camelo',
    series: 2,
    repeticoes: 12,
    tempo_descanso: 45,
    local_execucao: 'casa',
    ordem: 2
  },
  // Beatriz Santos (Estabilização Lombar)
  {
    id: 'pre-exe-3',
    prescription_id: 'pre-beatriz',
    exercise_id: 'exe-preensao-isometr',
    series: 3,
    repeticoes: 10,
    tempo_descanso: 60,
    local_execucao: 'estúdio',
    ordem: 1
  },
  {
    id: 'pre-exe-4',
    prescription_id: 'pre-beatriz',
    exercise_id: 'exe-gato-camelo',
    series: 3,
    repeticoes: 10,
    tempo_descanso: 30,
    local_execucao: 'casa',
    ordem: 2
  },
  // Helena Ferreira (Fortalecimento MMII)
  {
    id: 'pre-exe-5',
    prescription_id: 'pre-helena',
    exercise_id: 'exe-extensao-terminal',
    series: 3,
    repeticoes: 12,
    tempo_descanso: 45,
    local_execucao: 'estúdio',
    ordem: 1
  },
  {
    id: 'pre-exe-6',
    prescription_id: 'pre-helena',
    exercise_id: 'exe-agachamento-gl',
    series: 3,
    repeticoes: 15,
    tempo_descanso: 30,
    local_execucao: 'casa',
    ordem: 2
  }
];
