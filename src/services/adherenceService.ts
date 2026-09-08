import { PatientAdherence } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';

export const adherenceService = {
  getAll: async (): Promise<PatientAdherence[]> => {
    const { data, error } = await supabase
      .from('patient_adherence')
      .select('*')
      .order('data_execucao', { ascending: false });
    if (error) throw error;
    return data as PatientAdherence[];
  },

  getByPatientId: async (patientId: string): Promise<PatientAdherence[]> => {
    const { data, error } = await supabase
      .from('patient_adherence')
      .select('*')
      .eq('patient_id', patientId)
      .order('data_execucao', { ascending: false });
    if (error) throw error;
    return data as PatientAdherence[];
  },

  markCompleted: async (
    prescriptionExerciseId: string,
    patientId: string,
    sentiuDor: boolean,
    borgRating?: number,
    dorRelato?: string
  ): Promise<PatientAdherence> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: existing, error: eError } = await supabase
      .from('patient_adherence')
      .select('*')
      .eq('prescription_exercise_id', prescriptionExerciseId)
      .eq('patient_id', patientId)
      .gte('data_execucao', today.toISOString())
      .lt('data_execucao', tomorrow.toISOString())
      .maybeSingle();

    if (eError) throw eError;

    if (existing) {
      const { data: updated, error: uError } = await supabase
        .from('patient_adherence')
        .update({ borg_rating: borgRating, dor_relato: dorRelato, sentiu_dor: sentiuDor })
        .eq('id', existing.id)
        .select()
        .single();
      if (uError) throw uError;
      return updated as PatientAdherence;
    }

    const { data: created, error: cError } = await supabase
      .from('patient_adherence')
      .insert({
        prescription_exercise_id: prescriptionExerciseId,
        patient_id: patientId,
        borg_rating: borgRating,
        dor_relato: dorRelato,
        sentiu_dor: sentiuDor,
        data_execucao: new Date().toISOString()
      })
      .select()
      .single();
    
    if (cError) throw cError;
    return created as PatientAdherence;
  },

  getStats: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) return null;

      const { count: activeCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo')
        .eq('physio_id', userId);

      // Cálculo de crescimento mensal real baseado em cadastros de pacientes
      const now = new Date();
      const startCurrentMonth = startOfMonth(now);

      const { count: addedThisMonth } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('physio_id', userId)
        .gte('created_at', startCurrentMonth.toISOString());

      const { count: beforeThisMonth } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('physio_id', userId)
        .lt('created_at', startCurrentMonth.toISOString());

      let growthText = '0% este mês';
      const added = addedThisMonth || 0;
      const before = beforeThisMonth || 0;

      if (before === 0) {
        growthText = added > 0 ? `+${added} novos este mês` : '0% este mês';
      } else {
        const growthPct = Math.round((added / before) * 100);
        growthText = `${growthPct >= 0 ? '+' : ''}${growthPct}% este mês`;
      }

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const { data: recentAdherences } = await supabase
        .from('patient_adherence')
        .select('id, patients!inner(physio_id)')
        .eq('patients.physio_id', userId)
        .gte('data_execucao', last7Days.toISOString());

      const { data: activePrescriptions } = await supabase
        .from('prescriptions')
        .select('id, dias_semana, data_inicio, data_fim, prescription_exercises(id, dias_semana)')
        .eq('physio_id', userId)
        .eq('status', 'ativo');

      // Calcular meta real de exercícios esperados nos últimos 7 dias
      let totalPrescribed7Days = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayOfWeek = d.getDay();
        const dateStr = d.toISOString().split('T')[0];

        (activePrescriptions || []).forEach((p: any) => {
          if (p.data_inicio > dateStr) return;
          if (p.data_fim && p.data_fim < dateStr) return;
          const pDays = p.dias_semana || [];

          (p.prescription_exercises || []).forEach((pe: any) => {
            const peDays = pe.dias_semana || [];
            if (peDays.length > 0 ? peDays.includes(dayOfWeek) : pDays.includes(dayOfWeek)) {
              totalPrescribed7Days++;
            }
          });
        });
      }

      const completedCount = recentAdherences?.length || 0;
      const expectedCount = Math.max(totalPrescribed7Days, completedCount > 0 ? completedCount : 1);
      const rate = totalPrescribed7Days > 0
        ? Math.min(100, Math.round((completedCount / expectedCount) * 100))
        : (completedCount > 0 ? 100 : 0);

      return {
        pacientesAtivosCount: activeCount || 0,
        pacientesAtivosCrescimento: growthText,
        taxaAdesao: `${rate}%`,
        taxaAdesaoLabel: rate >= 75 ? 'Excelente Performance' : rate >= 50 ? 'Adesão Moderada' : 'Atenção Necessária',
        distribuicaoCasos: []
      };
    } catch (e) {
      console.error('Error fetching real stats:', e);
      return null;
    }
  },

  getEvolutionStats: async (patientId: string, month: number, year: number) => {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));

    // 1. Buscar todas as execuções do mês
    const { data: adherences, error: aError } = await supabase
      .from('patient_adherence')
      .select('id, data_execucao, borg_rating, dor_relato')
      .eq('patient_id', patientId)
      .gte('data_execucao', startDate.toISOString())
      .lte('data_execucao', endDate.toISOString());

    if (aError) throw aError;

    // 2. Buscar prescrições ativas para calcular o planejado
    const { data: prescriptions, error: pError } = await supabase
      .from('prescriptions')
      .select('id, dias_semana, data_inicio, data_fim')
      .eq('patient_id', patientId)
      .eq('status', 'ativo');

    if (pError) throw pError;

    // Calcular dias esperados de treino no mês baseados nos dias da semana das prescrições
    let expectedDays = 0;
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    daysInMonth.forEach(day => {
      const dayOfWeek = day.getDay();
      const hasPrescription = prescriptions.some(p => {
        const start = new Date(p.data_inicio);
        const end = p.data_fim ? new Date(p.data_fim) : endDate;
        return day >= start && day <= end && p.dias_semana.includes(dayOfWeek);
      });
      if (hasPrescription) expectedDays++;
    });

    // Agrupar por semana para os gráficos
    const weeks = [1, 2, 3, 4];
    const weeklyData = weeks.map(weekNum => {
      const weekStart = new Date(year, month, (weekNum - 1) * 7 + 1);
      const weekEnd = new Date(year, month, weekNum * 7);
      
      const weekAdherences = adherences.filter(a => {
        const d = new Date(a.data_execucao);
        return d >= weekStart && d <= weekEnd;
      });

      // Média de Borg na semana
      const borgSum = weekAdherences.reduce((acc, curr) => acc + (curr.borg_rating || 0), 0);
      const avgBorg = weekAdherences.length > 0 ? Number((borgSum / weekAdherences.length).toFixed(1)) : 0;

      // Cálculo de adesão semanal (simplificado: se o aluno treinou nos dias esperados)
      let weekExpected = 0;
      eachDayOfInterval({ 
        start: weekStart > startDate ? weekStart : startDate, 
        end: weekEnd < endDate ? weekEnd : endDate 
      }).forEach(day => {
        const dayOfWeek = day.getDay();
        const hasPrescription = prescriptions.some(p => {
          const start = new Date(p.data_inicio);
          const end = p.data_fim ? new Date(p.data_fim) : endDate;
          return day >= start && day <= end && p.dias_semana.includes(dayOfWeek);
        });
        if (hasPrescription) weekExpected++;
      });

      // Sessões únicas na semana
      const uniqueDaysCount = new Set(weekAdherences.map(a => new Date(a.data_execucao).toDateString())).size;

      return {
        semana: `Sem ${weekNum}`,
        dor: avgBorg,
        adesao: weekExpected > 0 ? Math.min(100, Math.round((uniqueDaysCount / weekExpected) * 100)) : 0
      };
    });

    const completedSessions = new Set(adherences.map(a => new Date(a.data_execucao).toDateString())).size;
    const painReportsCount = adherences.filter(a => a.dor_relato || (a.borg_rating && a.borg_rating >= 7)).length;
    const totalAdherenceRate = expectedDays > 0 ? Math.min(100, Math.round((completedSessions / expectedDays) * 100)) : 0;

    return {
      adherenceRate: totalAdherenceRate,
      completedSessions,
      painReportsCount,
      weeklyData
    };
  }
};