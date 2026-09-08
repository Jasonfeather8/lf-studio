import { supabase } from '@/integrations/supabase/client';
import { PainAlert, DashboardChartData, RecentWorkout } from '../types';

export const dashboardService = {
  
  getPainReports: async (): Promise<PainAlert[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let query = supabase
        .from('patient_adherence')
        .select(`
          id,
          patient_id,
          borg_rating,
          dor_relato,
          sentiu_dor,
          data_execucao,
          prescription_exercises!inner (
            prescription_id
          ),
          patients!inner (
            physio_id,
            patologia_principal,
            profiles:profile_id (
              nome_completo,
              avatar_url
            )
          )
        `)
        .gte('data_execucao', sevenDaysAgo.toISOString())
        .eq('sentiu_dor', true)
        .order('data_execucao', { ascending: false });

      if (userId) {
        query = query.eq('patients.physio_id', userId);
      }

      const { data: adherences, error: aError } = await query;

      if (aError) {
        console.error('[DashboardService] Erro na query de alertas:', aError);
        return [];
      }

      return (adherences || []).map((a: any) => ({
        id: a.id,
        patientId: a.patient_id,
        prescriptionId: a.prescription_exercises?.prescription_id, // Vinculando a prescrição
        name: a.patients?.profiles?.nome_completo || 'Paciente Desconhecido',
        eva: a.borg_rating || 5,
        patologia: a.patients?.patologia_principal || 'Geral',
        relato: a.dor_relato || `Esforço elevado (Borg ${a.borg_rating}).`,
        data: new Date(a.data_execucao).toLocaleDateString('pt-BR'),
        time: new Date(a.data_execucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date(a.data_execucao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ')',
        avatar: a.patients?.profiles?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      }));
    } catch (e) {
      console.error('Error fetching pain reports:', e);
      return [];
    }
  },

  getChartData: async (): Promise<DashboardChartData[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return [];

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const { data: adherences, error } = await supabase
        .from('patient_adherence')
        .select('data_execucao, patients!inner(physio_id)')
        .eq('patients.physio_id', userId)
        .gte('data_execucao', last7Days[0]);

      if (error) throw error;

      // Buscar prescrições ativas para calcular meta prescrita diária real
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('id, dias_semana, data_inicio, data_fim, prescription_exercises(id, dias_semana)')
        .eq('physio_id', userId)
        .eq('status', 'ativo');

      return last7Days.map(date => {
        const dayAdherences = (adherences || []).filter(a => a.data_execucao.startsWith(date));
        const dayDate = new Date(date + 'T00:00:00');
        const dayOfWeek = dayDate.getDay();
        const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        const completed = dayAdherences.length;

        let prescribed = 0;
        (prescriptions || []).forEach((p: any) => {
          if (p.data_inicio > date) return;
          if (p.data_fim && p.data_fim < date) return;
          const pDays = p.dias_semana || [];

          (p.prescription_exercises || []).forEach((pe: any) => {
            const peDays = pe.dias_semana || [];
            if (peDays.length > 0 ? peDays.includes(dayOfWeek) : pDays.includes(dayOfWeek)) {
              prescribed++;
            }
          });
        });

        const effectivePrescribed = prescribed > 0 ? prescribed : (completed > 0 ? completed : 0);
        
        return {
          label: dayLabel,
          pct: effectivePrescribed > 0 ? Math.min(100, Math.round((completed / effectivePrescribed) * 100)) : 0,
          completed,
          prescribed: effectivePrescribed
        };
      });
    } catch (e) {
      console.error('Error fetching chart data:', e);
      return [];
    }
  },

  getRecentWorkouts: async (): Promise<RecentWorkout[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('patient_adherence')
        .select(`
          id,
          patient_id,
          data_execucao,
          prescription_exercises (
            local_execucao,
            prescriptions (
              titulo
            )
          ),
          patients!inner (
            physio_id,
            profiles:profile_id (
              nome_completo,
              avatar_url
            )
          )
        `)
        .eq('patients.physio_id', userId)
        .gte('data_execucao', sevenDaysAgo.toISOString())
        .order('data_execucao', { ascending: false })
        .limit(6);

      if (error) {
        console.error('[DashboardService] Error fetching recent workouts:', error);
        return [];
      }

      return (data || []).map((a: any) => ({
        id: a.id,
        patientId: a.patient_id,
        name: a.patients?.profiles?.nome_completo || 'Paciente',
        protocol: a.prescription_exercises?.prescriptions?.titulo || 'Treino Realizado',
        date: new Date(a.data_execucao).toLocaleDateString('pt-BR'),
        time: new Date(a.data_execucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: a.prescription_exercises?.local_execucao || 'Estúdio',
        avatar: a.patients?.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + a.patients?.profiles?.nome_completo
      }));
    } catch (e) {
      console.error('Error fetching recent workouts:', e);
      return [];
    }
  },

  getPatientExercises: async (filter: 'hoje' | 'amanha' | 'depois' = 'hoje'): Promise<any[]> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data: patient, error: pError } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (pError || !patient) return [];

      const targetDate = new Date();
      if (filter === 'amanha') targetDate.setDate(targetDate.getDate() + 1);
      else if (filter === 'depois') targetDate.setDate(targetDate.getDate() + 2);
      
      const targetDateString = targetDate.toISOString().split('T')[0];
      const currentDay = targetDate.getDay(); 

      const { data: prescriptions, error: prError } = await supabase
        .from('prescriptions')
        .select(`
          id,
          titulo,
          data_inicio,
          data_fim,
          dias_semana,
          prescription_exercises (
            id,
            exercise_id,
            series,
            repeticoes,
            tempo_descanso,
            local_execucao,
            ordem,
            dias_semana,
            exercises (
              nome,
              descricao,
              midia_url,
              tags_aparelho,
              tags_patologia,
              tags_objetivo
            )
          )
        `)
        .eq('patient_id', patient.id)
        .eq('status', 'ativo');

      if (prError || !prescriptions) return [];

      const startOfDay = new Date(targetDateString + 'T00:00:00Z').toISOString();
      const endOfDay = new Date(targetDateString + 'T23:59:59Z').toISOString();

      const { data: dailyAdherences } = await supabase
        .from('patient_adherence')
        .select('prescription_exercise_id')
        .eq('patient_id', patient.id)
        .gte('data_execucao', startOfDay)
        .lt('data_execucao', endOfDay);

      const completedIds = new Set(dailyAdherences?.map(a => a.prescription_exercise_id) || []);

      const allExercises: any[] = [];
      
      prescriptions.forEach((p: any) => {
        if (p.data_inicio > targetDateString) return;
        if (p.data_fim && p.data_fim < targetDateString) return;

        const prescriptionDays = p.dias_semana || [];
        
        p.prescription_exercises.forEach((pe: any) => {
          const exerciseDays = pe.dias_semana || [];
          
          let isForPeriod = false;
          if (exerciseDays.length > 0) {
            isForPeriod = exerciseDays.includes(currentDay);
          } else if (prescriptionDays.length > 0) {
            isForPeriod = prescriptionDays.includes(currentDay);
          } else {
            isForPeriod = true;
          }

          if (isForPeriod) {
            const normalizedLocal = pe.local_execucao === 'estúdio' ? 'estudio' : pe.local_execucao;

            allExercises.push({
              id: pe.id,
              exercise_id: pe.exercise_id,
              nome: pe.exercises?.nome,
              descricao: pe.exercises?.descricao,
              midia_url: pe.exercises?.midia_url,
              series: pe.series,
              repeticoes: pe.repeticoes,
              tempo_descanso: pe.tempo_descanso,
              local_execucao: normalizedLocal,
              ordem: pe.ordem,
              protocolo: p.titulo,
              is_completed: completedIds.has(pe.id),
              aparelho: pe.exercises?.tags_aparelho?.[0],
              patologia: pe.exercises?.tags_patologia?.[0],
              objetivo: pe.exercises?.tags_objetivo?.[0]
            });
          }
        });
      });

      return allExercises.sort((a, b) => a.ordem - b.ordem);
    } catch (e) {
      console.error('Error fetching patient exercises:', e);
      return [];
    }
  }
};