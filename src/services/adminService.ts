import { supabase } from '@/integrations/supabase/client';

export interface ProfessionalData {
  id: string;
  nome_completo: string;
  email?: string;
  created_at: string;
  role: string;
  pacientes_count: number;
  status: 'ativo' | 'inativo';
}

export const adminService = {
  createPatientUser: async (data: { 
    email: string; 
    password?: string; 
    nome_completo: string;
    documento_cpf: string;
    telefone: string;
    physio_id: string;
  }) => {
    const { data: response, error } = await supabase.functions.invoke('create-user', {
      body: {
        ...data,
        role: 'client'
      }
    });

    if (error) throw error;
    return response.user;
  },

  getAllProfessionals: async (page = 1, pageSize = 50): Promise<{ data: ProfessionalData[], total: number }> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: profiles, error, count } = await supabase
      .from('profiles')
      .select('id, nome_completo, created_at, role, email', { count: 'exact' })
      .in('role', ['physio', 'admin', 'super_admin'])
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Buscamos contagem de pacientes apenas para os profissionais desta página (Performance)
    const profIds = (profiles || []).map(p => p.id);
    const { data: patients, error: pError } = await supabase
      .from('patients')
      .select('physio_id')
      .in('physio_id', profIds)
      .eq('status', 'ativo');

    if (pError) console.error(pError);

    const counts: Record<string, number> = {};
    patients?.forEach(p => {
      if (p.physio_id) {
        counts[p.physio_id] = (counts[p.physio_id] || 0) + 1;
      }
    });

    const data = (profiles || []).map(p => ({
      id: p.id,
      nome_completo: p.nome_completo,
      email: p.email,
      created_at: p.created_at,
      role: p.role,
      pacientes_count: counts[p.id] || 0,
      status: 'ativo' as const
    }));

    return { data, total: count || 0 };
  }
};