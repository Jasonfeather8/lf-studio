"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CheckCircle2, AlertCircle, MessageCircle, Clock } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { usePatientAdherenceQuery, usePrescriptionsQuery, useExercisesQuery } from '../../hooks';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientHistoryDrawer() {
  const { isHistoryDrawerOpen, setHistoryDrawerOpen, activePatientId, activePrescriptionId } = useUIStore();
  
  // Queries
  const { data: adherences } = usePatientAdherenceQuery(activePatientId, activePrescriptionId);
  const { data: prescriptionsData } = usePrescriptionsQuery();
  const { data: exercisesData } = useExercisesQuery();

  // Helper para normalizar lista de exercícios (lida com objeto paginado ou array antigo)
  const exercises = useMemo(() => {
    if (!exercisesData) return [];
    if (Array.isArray(exercisesData)) return exercisesData;
    return exercisesData.data || [];
  }, [exercisesData]);

  // Helper para normalizar prescrições
  const prescriptions = useMemo(() => {
    if (!prescriptionsData) return [];
    if (Array.isArray(prescriptionsData)) return prescriptionsData;
    return prescriptionsData.data || [];
  }, [prescriptionsData]);

  const activePrescTitle = useMemo(() => {
    if (!activePrescriptionId || prescriptions.length === 0) return 'Histórico Geral';
    return prescriptions.find(p => p.id === activePrescriptionId)?.titulo || 'Histórico';
  }, [activePrescriptionId, prescriptions]);

  const timelineData = useMemo(() => {
    if (!activePatientId || prescriptions.length === 0 || exercises.length === 0) return [];

    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      const activePrescsForDay = prescriptions.filter(p => 
        p.patient_id === activePatientId &&
        p.status === 'ativo' &&
        p.data_inicio <= dateStr &&
        (!p.data_fim || p.data_fim >= dateStr) &&
        p.dias_semana.includes(dayOfWeek) &&
        (!activePrescriptionId || p.id === activePrescriptionId)
      );

      const dayAdherences = (adherences as any[])?.filter(a => 
        isSameDay(parseISO(a.data_execucao), date)
      ) || [];

      const events: { type: 'done' | 'missed'; time: string; exerciseName: string; borg?: any; comment?: any; id: string }[] = dayAdherences.map(adh => {
        const exId = adh.prescription_exercises?.exercise_id;
        const exerciseInfo = exercises.find(e => e.id === exId);

        return {
          type: 'done' as const,
          time: format(parseISO(adh.data_execucao), 'HH:mm'),
          exerciseName: exerciseInfo?.nome || 'Exercício realizado',
          borg: adh.borg_rating,
          comment: adh.dor_relato,
          id: adh.id
        };
      });

      if (events.length === 0 && activePrescsForDay.length > 0 && !isSameDay(date, today)) {
        events.push({
          type: 'missed' as const,
          time: '--:--',
          exerciseName: 'Sessão Prescrita Não Realizada',
          borg: undefined,
          comment: undefined,
          id: `missed-${dateStr}`
        });
      }

      if (events.length > 0 || isSameDay(date, today)) {
        days.push({
          date: dateStr,
          displayDate: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
          isToday: isSameDay(date, today),
          events
        });
      }
    }
    return days;
  }, [activePatientId, activePrescriptionId, adherences, prescriptions, exercises]);

  return (
    <AnimatePresence>
      {isHistoryDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHistoryDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl z-[70] flex flex-col border-l border-neutral-100 dark:border-neutral-800"
          >
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0a5c4e] dark:text-[#52bfa6]" />
                  {activePrescTitle}
                </h3>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Linha do Tempo de Adesão</p>
              </div>
              <button
                onClick={() => setHistoryDrawerOpen(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              {timelineData.map((day, idx) => (
                <div key={day.date} className="relative">
                  {idx !== timelineData.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-32px] w-0.5 bg-neutral-100 dark:bg-neutral-800" />
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 ${day.isToday ? 'bg-[#0a5c4e] border-teal-100 dark:border-teal-900' : 'bg-neutral-200 border-white dark:bg-neutral-700 dark:border-neutral-900'}`}>
                      {day.isToday && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${day.isToday ? 'text-[#0a5c4e] dark:text-[#52bfa6]' : 'text-neutral-400'}`}>
                      {day.isToday ? 'Hoje • ' : ''}{day.displayDate}
                    </span>
                  </div>

                  <div className="pl-9 space-y-4">
                    {day.events.map((event) => (
                      <div 
                        key={event.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          event.type === 'done' 
                            ? 'bg-white dark:bg-neutral-850 border-neutral-100 dark:border-neutral-800 shadow-sm' 
                            : 'bg-neutral-50 dark:bg-neutral-900 border-dashed border-neutral-200 dark:border-neutral-800 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {event.type === 'done' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <h4 className={`text-xs font-bold ${event.type === 'done' ? 'text-neutral-800 dark:text-white' : 'text-neutral-500'}`}>
                              {event.exerciseName}
                            </h4>
                          </div>
                          <span className="text-[9px] font-black text-neutral-400">{event.time}</span>
                        </div>

                        {event.type === 'done' && (
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-lg">
                                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase">Esforço:</span>
                                <span className="text-xs font-black text-teal-700 dark:text-teal-300">{event.borg || 'N/A'}</span>
                              </div>
                              {event.comment && (
                                <div className="flex items-center gap-1 text-amber-600">
                                  <MessageCircle className="w-3 h-3" />
                                  <span className="text-[10px] font-bold">Relato de Dor</span>
                                </div>
                              )}
                            </div>
                            {event.comment && (
                              <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 italic">
                                &ldquo;{event.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
               <button 
                onClick={() => setHistoryDrawerOpen(false)}
                className="w-full py-3.5 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
               >
                 Fechar Histórico
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}