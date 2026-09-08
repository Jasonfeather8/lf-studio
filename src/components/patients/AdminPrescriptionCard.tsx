import React, { useState } from 'react';
import { 
  Calendar, Clock, Check, MoreVertical, Edit, Copy, Trash2, Dumbbell, AlertTriangle, Timer, CheckCircle, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise } from '../../types';
import { 
  useExercisesQuery,
  usePrescriptionExercisesQuery } from '../../hooks';
import { useUIStore } from '../../store/uiStore';
import { getVideoInfo } from '../../utils/video';

export default function AdminPrescriptionCard({ presc, isKebabOpen, setActiveKebabId, onOpenPrescriptionForm, handleDeletePrescription }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: exercises } = usePrescriptionExercisesQuery(presc.id);
  const { data: allExercises } = useExercisesQuery();
  const { setHistoryDrawerOpen, setActivePrescriptionId } = useUIStore();

  const getExerciseDetails = (exId: string) => {
    return allExercises?.data?.find((e) => e.id === exId);
  };

  const handleOpenHistory = () => {
    setActivePrescriptionId(presc.id);
    setHistoryDrawerOpen(true);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-shadow">
      <div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start gap-3">
          <h4 className="text-sm font-bold text-neutral-800 dark:text-white mb-2 group-hover:text-[#0a5c4e] dark:group-hover:text-[#52bfa6] transition-colors leading-tight">
            {presc.titulo}
          </h4>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveKebabId(isKebabOpen ? null : presc.id)}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {isKebabOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveKebabId(null)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750 rounded-2xl shadow-xl z-50 py-2 text-left"
                  >
                    <button
                      onClick={() => { setActiveKebabId(null); onOpenPrescriptionForm(presc.id, null); }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-200 hover:bg-[#f4f7f6] dark:hover:bg-neutral-750 flex items-center gap-2"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar Treino</span>
                    </button>
                    <button
                      onClick={() => { setActiveKebabId(null); onOpenPrescriptionForm(null, presc.id); }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-[#0a5c4e] dark:text-[#52bfa6] hover:bg-[#f4f7f6] dark:hover:bg-neutral-750 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicar Treino</span>
                    </button>
                    <div className="border-t border-neutral-100 dark:border-neutral-750 my-1" />
                    <button
                      onClick={() => { setActiveKebabId(null); handleDeletePrescription(presc.id, presc.titulo); }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Treino</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-1.5">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-400 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Vigência: {presc.data_inicio} até {presc.data_fim || 'Indeterminada'}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">Exercícios ({exercises?.length || 0})</span>
              <button
                onClick={handleOpenHistory}
                className="flex items-center gap-1.5 text-[10px] font-black text-[#0a5c4e] dark:text-[#52bfa6] hover:underline cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                Ver Histórico de Execução
              </button>
            </div>

            <div className="space-y-2">
              {exercises?.map(ex => {
                const details = getExerciseDetails(ex.exercise_id);
                const video = getVideoInfo(details?.midia_url || '');
                const thumbUrl = video.thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=100&q=80";

                return (
                  <div key={ex.id} className="bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg flex items-center gap-3 border border-neutral-100 dark:border-neutral-800">
                    <img src={thumbUrl} alt="" className="w-10 h-10 object-cover rounded-md" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-neutral-800 dark:text-white line-clamp-1">{details?.nome}</p>
                      <p className="text-[10px] text-neutral-500">{ex.series} séries x {ex.repeticoes} reps</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 uppercase tracking-wider">
          Ativo
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-[#0a5c4e] dark:text-[#52bfa6] hover:underline"
        >
          {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
        </button>
      </div>
    </div>
  );
}