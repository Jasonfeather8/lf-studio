import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionService } from '../../services/prescriptionService';
import { Prescription, PrescriptionExercise } from '../../types';
import { KEYS } from '../keys';

export function usePrescriptionsQuery(patientId?: string | null, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...KEYS.PRESCRIPTIONS, patientId, page, pageSize],
    queryFn: () => prescriptionService.getAll(patientId || undefined, page, pageSize),
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