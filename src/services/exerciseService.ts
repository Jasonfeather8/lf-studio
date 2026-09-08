import { Exercise } from '../types';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  aparelho?: string;
  patologia?: string;
  objetivo?: string;
  physio_id?: string | null;
}

export const exerciseService = {
  getAll: async (params?: ExerciseQueryParams): Promise<{ data: Exercise[], total: number }> => {
    const { 
      page = 1, 
      pageSize = 50, 
      search, 
      aparelho, 
      patologia, 
      objetivo, 
      physio_id 
    } = params || {};
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('exercises')
      .select('*', { count: 'exact' })
      .eq('status', 'ativo');

    // Filtro por dono ou global
    if (physio_id !== undefined) {
      if (physio_id === null) {
        query = query.is('physio_id', null);
      } else {
        query = query.eq('physio_id', physio_id);
      }
    }

    if (search) {
      query = query.ilike('nome', `%${search}%`);
    }

    // Filtros de tags no JSONB (usa operador @> do Postgres)
    if (aparelho) {
      query = query.contains('tags_aparelho', [aparelho]);
    }
    if (patologia) {
      query = query.contains('tags_patologia', [patologia]);
    }
    if (objetivo) {
      query = query.contains('tags_objetivo', [objetivo]);
    }

    const { data, error, count } = await query
      .order('nome', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return { data: data as Exercise[], total: count || 0 };
  },

  getById: async (id: string): Promise<Exercise | undefined> => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return undefined;
    return data as Exercise;
  },

  create: async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single();
    if (error) throw error;
    return data as Exercise;
  },

  update: async (id: string, updates: Partial<Exercise>): Promise<Exercise> => {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Exercise;
  },

  delete: async (id: string): Promise<Exercise> => {
    return exerciseService.update(id, { status: 'inativo' });
  }
};