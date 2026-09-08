import { PatientExam } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const examService = {
  getAll: async (patientId?: string, page = 1, pageSize = 20): Promise<{ data: PatientExam[], total: number }> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('patient_exams')
      .select('*', { count: 'exact' })
      .order('data_upload', { ascending: false })
      .range(from, to);

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as PatientExam[], total: count || 0 };
  },

  getByPatientId: async (patientId: string): Promise<PatientExam[]> => {
    const { data, error } = await supabase
      .from('patient_exams')
      .select('*')
      .eq('patient_id', patientId)
      .order('data_upload', { ascending: false });
    if (error) throw error;
    return data as PatientExam[];
  },

  uploadFile: async (file: File, patientId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${patientId}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('patient-exams')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('patient-exams')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  create: async (exam: Omit<PatientExam, 'id' | 'data_upload' | 'status_sincronizacao'>): Promise<PatientExam> => {
    const { data, error } = await supabase
      .from('patient_exams')
      .insert(exam)
      .select()
      .single();
    if (error) throw error;
    return data as PatientExam;
  },

  update: async (id: string, updates: Partial<PatientExam>): Promise<PatientExam> => {
    const { data, error } = await supabase
      .from('patient_exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PatientExam;
  },

  delete: async (id: string, fileUrl?: string): Promise<boolean> => {
    // Tenta remover o arquivo do storage caso seja um link do bucket
    if (fileUrl && fileUrl.includes('patient-exams/')) {
      try {
        const parts = fileUrl.split('patient-exams/');
        if (parts[1]) {
          const filePath = decodeURIComponent(parts[1].split('?')[0]);
          await supabase.storage.from('patient-exams').remove([filePath]);
        }
      } catch (e) {
        console.warn('Falha ao remover arquivo do bucket:', e);
      }
    }

    const { error } = await supabase
      .from('patient_exams')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
