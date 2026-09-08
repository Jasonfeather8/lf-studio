import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService, ExerciseQueryParams } from '../../services/exerciseService';
import { Exercise } from '../../types';
import { KEYS } from '../keys';

export function useExercisesQuery(params?: ExerciseQueryParams) {
  return useQuery({
    queryKey: [...KEYS.EXERCISES, params],
    queryFn: () => exerciseService.getAll(params),
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