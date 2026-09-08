import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adherenceService } from '../../services/adherenceService';
import { KEYS } from '../keys';
import { DASHBOARD_KEYS } from './useDashboard';
import { supabase } from '@/integrations/supabase/client';

export function useAdherenceStatsQuery() {
  return useQuery({
    queryKey: KEYS.ADHERENCE_STATS,
    queryFn: () => adherenceService.getStats(),
  });
}

/**
 * Hook de Histórico Scoped por Prescrição com Filtro de Data no Banco
 */
export function usePatientAdherenceQuery(patientId: string | null, prescriptionId?: string | null, startDate?: string) {
  return useQuery({
    queryKey: ['adherence', patientId, prescriptionId, startDate],
    queryFn: async () => {
      if (!patientId) return [];
      
      let query = supabase
        .from('patient_adherence')
        .select(`
          *,
          prescription_exercises!inner(prescription_id, exercise_id)
        `)
        .eq('patient_id', patientId)
        .order('data_execucao', { ascending: false });

      if (prescriptionId) {
        query = query.eq('prescription_exercises.prescription_id', prescriptionId);
      }

      if (startDate) {
        query = query.gte('data_execucao', startDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

/**
 * Hook para buscar estatísticas de evolução real de um paciente (usado na tela Evolucao)
 */
export function usePatientEvolutionQuery(patientId: string | null, month: number, year: number) {
  return useQuery({
    queryKey: ['patient-evolution', patientId, month, year],
    queryFn: () => adherenceService.getEvolutionStats(patientId!, month, year),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}

export function useMarkCompletedMutation(patientId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prescriptionExerciseId, patId, borgRating, dorRelato, sentiuDor }: { prescriptionExerciseId: string; patId: string; borgRating?: number; dorRelato?: string; sentiuDor: boolean }) =>
      adherenceService.markCompleted(prescriptionExerciseId, patId, sentiuDor, borgRating, dorRelato),
    onSuccess: () => {
      // Invalida estatísticas globais
      queryClient.invalidateQueries({ queryKey: KEYS.ADHERENCE_STATS });
      
      // Invalida dados de evolução
      queryClient.invalidateQueries({ queryKey: ['patient-evolution'] });
      
      // FORÇA A ATUALIZAÇÃO DA LISTA DE EXERCÍCIOS DO DASHBOARD (O que corrige o visual instantâneo)
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.PATIENT_EXERCISES });
      
      // Invalida outros dados de dashboard relacionados
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.RECENT_WORKOUTS });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.CHART_DATA });
      
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['adherence'] });
      }
    },
  });
}