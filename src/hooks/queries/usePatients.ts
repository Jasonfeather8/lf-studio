import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services/patientService';
import { adminService } from '../../services/adminService';
import { Patient } from '../../types';
import { KEYS } from '../keys';
import { supabase } from '@/integrations/supabase/client';

export function usePatientsQuery(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: [...KEYS.PATIENTS, page, pageSize],
    queryFn: () => patientService.getAll(page, pageSize),
  });
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { 
      nome_completo: string; 
      documento_cpf: string; 
      telefone: string; 
      email: string; 
      password?: string;
      patologia_principal: string; 
      observacoes_clinicas?: string;
    }) => {
      const currentPhysioId = (await supabase.auth.getUser()).data.user?.id || '';

      const authUser = await adminService.createPatientUser({
        email: data.email,
        password: data.password,
        nome_completo: data.nome_completo,
        documento_cpf: data.documento_cpf,
        telefone: data.telefone,
        physio_id: currentPhysioId
      });

      return patientService.create({
        profile_id: authUser.id,
        physio_id: currentPhysioId,
        patologia_principal: data.patologia_principal,
        observacoes_clinicas: data.observacoes_clinicas || '',
        status: 'ativo'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PATIENTS });
      queryClient.invalidateQueries({ queryKey: KEYS.PROFILES });
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
      queryClient.invalidateQueries({ queryKey: KEYS.PROFILES });
    },
  });
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.update(id, { status: 'inativo' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.PATIENTS });
      queryClient.invalidateQueries({ queryKey: KEYS.ADHERENCE_STATS });
    },
  });
}