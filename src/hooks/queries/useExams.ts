import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../../services/examService';
import { PatientExam } from '../../types';
import { KEYS } from '../keys';

export function usePatientExamsQuery(patientId: string | null, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...KEYS.EXAMS(patientId || ''), page, pageSize],
    queryFn: () => examService.getAll(patientId || '', page, pageSize),
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

export function useUpdateExamMutation(patientId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PatientExam> }) =>
      examService.update(id, updates),
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
    mutationFn: (param: { id: string; fileUrl?: string } | string) => {
      if (typeof param === 'string') {
        return examService.delete(param);
      }
      return examService.delete(param.id, param.fileUrl);
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: KEYS.EXAMS(patientId) });
      }
    },
  });
}
