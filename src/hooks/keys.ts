export const KEYS = {
  PROFILES: ['profiles'],
  PATIENTS: ['patients'],
  EXERCISES: ['exercises'],
  PRESCRIPTIONS: ['prescriptions'],
  PRESCRIPTION_EXERCISES: (pid: string) => ['prescriptions', pid, 'exercises'],
  EXAMS: (pid: string) => ['exams', pid],
  ADHERENCE_STATS: ['adherence_stats'],
};
