import { Prescription, PrescriptionExercise } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const prescriptionService = {
  getAll: async (patientId?: string, page = 1, pageSize = 20): Promise<{ data: Prescription[], total: number }> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('prescriptions')
      .select('*', { count: 'exact' })
      .eq('status', 'ativo') // FILTRO NO BANCO: Apenas ativas
      .order('created_at', { ascending: false })
      .range(from, to);

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as Prescription[], total: count || 0 };
  },

  getById: async (id: string): Promise<Prescription | undefined> => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return undefined;
    return data as Prescription;
  },

  getExercisesByPrescriptionId: async (prescriptionId: string): Promise<PrescriptionExercise[]> => {
    const { data, error } = await supabase
      .from('prescription_exercises')
      .select('*')
      .eq('prescription_id', prescriptionId)
      .order('ordem', { ascending: true });
    if (error) throw error;
    return data as PrescriptionExercise[];
  },

  create: async (
    prescription: Omit<Prescription, 'id'>,
    exercises: Omit<PrescriptionExercise, 'id' | 'prescription_id'>[]
  ): Promise<Prescription> => {
    const { data: newPrescription, error: pError } = await supabase
      .from('prescriptions')
      .insert(prescription)
      .select()
      .single();
    if (pError) throw pError;

    const exercisesToInsert = exercises.map((ex, index) => ({
      ...ex,
      prescription_id: newPrescription.id,
      ordem: ex.ordem || index + 1,
    }));

    const { error: peError } = await supabase
      .from('prescription_exercises')
      .insert(exercisesToInsert);
    if (peError) throw peError;

    return newPrescription as Prescription;
  },

  update: async (
    id: string,
    updates: Partial<Prescription>,
    exercises?: Omit<PrescriptionExercise, 'id' | 'prescription_id'>[]
  ): Promise<Prescription> => {
    const { data: updatedPrescription, error: pError } = await supabase
      .from('prescriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (pError) throw pError;

    if (exercises) {
      const { error: dError } = await supabase
        .from('prescription_exercises')
        .delete()
        .eq('prescription_id', id);
      if (dError) throw dError;

      const exercisesToInsert = exercises.map((ex, index) => ({
        ...ex,
        prescription_id: id,
        ordem: ex.ordem || index + 1,
      }));

      const { error: iError } = await supabase
        .from('prescription_exercises')
        .insert(exercisesToInsert);
      if (iError) throw iError;
    }

    return updatedPrescription as Prescription;
  },

  delete: async (id: string): Promise<Prescription> => {
    return prescriptionService.update(id, { status: 'excluido' });
  }
};