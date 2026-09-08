import { Patient } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const patientService = {
  getAll: async (page = 1, pageSize = 50): Promise<{ data: Patient[], total: number }> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data as Patient[], total: count || 0 };
  },

  getById: async (id: string): Promise<Patient | undefined> => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return undefined;
    return data as Patient;
  },

  create: async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    if (error) throw error;
    return data as Patient;
  },

  update: async (id: string, updates: Partial<Patient>): Promise<Patient> => {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Patient;
  },

  delete: async (id: string): Promise<Patient> => {
    return patientService.update(id, { status: 'inativo' });
  }
};