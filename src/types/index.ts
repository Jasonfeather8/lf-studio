/**
 * LF Studio Type System (Database Mirror Schema)
 * All interfaces correspond exactly to tables and columns for future Supabase connection.
 */

export type UserRole = 'physio' | 'patient' | 'client' | 'admin' | 'super_admin';

export interface Profile {
  id: string; // UUID, references auth.users
  role: UserRole;
  physio_id?: string | null; // Added for multi-tenancy
  nome_completo: string;
  documento_cpf: string;
  email?: string;
  avatar_url: string;
  telefone: string;
  created_at: string;
}

export interface Patient {
  id: string; // UUID
  profile_id: string; // FK to Profile
  physio_id: string; // FK to Profile (physio)
  patologia_principal: string;
  observacoes_clinicas: string;
  status: 'ativo' | 'inativo'; // Soft Delete
}

export interface Exercise {
  id: string; // UUID
  physio_id: string | null; // FK to Profile (physio), null for global base exercises
  nome: string;
  descricao: string;
  midia_url: string;
  tags_aparelho: string[]; // JSONB in DB
  tags_patologia: string[]; // JSONB in DB
  tags_objetivo: string[]; // JSONB in DB
  status: 'ativo' | 'inativo'; // Soft Delete
}

export interface Prescription {
  id: string; // UUID
  patient_id: string; // FK to Patient
  physio_id: string; // FK to Profile (physio)
  titulo: string;
  data_inicio: string;
  data_fim: string;
  dias_semana: number[]; // Array of weekdays (0-6)
  status: 'ativo' | 'arquivado' | 'excluido'; // Soft Delete
  created_at: string;
}

export interface PrescriptionExercise {
  id: string; // UUID
  prescription_id: string; // FK to Prescription
  exercise_id: string; // FK to Exercise
  series: number;
  repeticoes: number;
  tempo_descanso: number; // in seconds
  local_execucao: 'estúdio' | 'casa';
  ordem: number;
  dias_semana?: number[]; // Optional per-exercise weekdays
}

export interface PatientAdherence {
  id: string; // UUID
  prescription_exercise_id: string; // FK to PrescriptionExercise
  patient_id: string; // FK to Patient
  data_execucao: string; // ISO date string
  status_sincronizacao: boolean; // For offline-first queuing
  borg_rating?: number; // Added: Scale 1-10
  dor_relato?: string;
  sentiu_dor: boolean;
}



export interface PatientExam {
  id: string; // UUID
  patient_id: string; // FK to Patient
  titulo: string;
  arquivo_url: string;
  data_upload: string; // ISO date string
  status_sincronizacao: boolean;
}



export interface PainAlert {
  id: string;
  patientId: string;
  prescriptionId?: string;
  name: string;
  eva: number;
  patologia: string;
  relato: string;
  data: string;
  time?: string;
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
