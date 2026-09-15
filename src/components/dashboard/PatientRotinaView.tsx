import React, { useState, useEffect } from 'react';
import PatientHeader from '../../components/patient/PatientHeader';
import ToggleTabs from '../../components/patient/ToggleTabs';
import ExerciseCard from '../../components/patient/ExerciseCard';
import SuccessToast from '../SuccessToast';
import ClinicalFeedbackModal from '../patient/ClinicalFeedbackModal';
import { useUIStore } from '../../store/uiStore';
import {
  useMarkCompletedMutation,
  useDashboardPatientExercisesQuery,
  usePatientsQuery,
  useExerciseVideoQuery,
} from '../../hooks';
import { Calendar, ClipboardList, Loader2, Dumbbell, Heart, Video, AlertCircle, Clock3, ChevronLeft, Check } from 'lucide-react';
import Modal from '../../components/Modal';
import { getVideoInfo } from '../../utils/video';
import { getBunnyEmbedUrl } from '../../services/bunnyVideoService';

/**
 * COMPONENTE PRINCIPAL DA ROTINA
 */
function PatientRotinaView() {
  const { currentUser } = useUIStore();
  const [activeTab, setActiveTab] = useState<'estudio' | 'casa'>('estudio');
  const [timeFilter, setTimeFilter] = useState<'hoje' | 'amanha' | 'depois'>('hoje');

  // Queries e Estado
  const { data: exercisesData, isLoading: isExercisesLoading } = useDashboardPatientExercisesQuery(timeFilter);
  const patientExercises = exercisesData || [];

  const { data: patientsData } = usePatientsQuery();
  const patientRecord = patientsData?.data?.find(p => p.profile_id === currentUser?.id);

  // Filtros de UI
  const filteredExercises = patientExercises.filter(ex => ex.local_execucao === activeTab);
  const todoExercises = filteredExercises.filter(ex => !ex.is_completed);
  const completedExercises = filteredExercises.filter(ex => ex.is_completed);
  
  const [activePlayExercise, setActivePlayExercise] = useState<any | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const markCompletedMutation = useMarkCompletedMutation(patientRecord?.id || null);

  // Gerenciamento de feedback visual
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const handleFinalizeAndSync = async (feedback: { borg: number, dor: boolean, relato: string }) => {
    if (!patientRecord?.id || !activePlayExercise) return;

    try {
      await markCompletedMutation.mutateAsync({
        prescriptionExerciseId: activePlayExercise.id,
        patId: patientRecord.id,
        borgRating: feedback.borg,
        dorRelato: feedback.dor ? feedback.relato : undefined,
        sentiuDor: feedback.dor
      });

      setShowFeedbackModal(false);
      setActivePlayExercise(null);
      setShowSuccessToast(true);
    } catch (err) {
      console.error("[PatientRotina] Erro ao sincronizar:", err);
    }
  };

  const totalInSession = filteredExercises.length;
  const completedInSession = completedExercises.length;

  return (
    <>
      <div className="space-y-4 animate-fade-in max-w-md mx-auto w-full">
        <PatientHeader />
        
        <ToggleTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Barra de Filtro de Tempo */}
        <div className="px-6 flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Sua Agenda</h3>
          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            {['hoje', 'amanha', 'depois'].map((f) => (
              <button 
                key={f}
                onClick={() => setTimeFilter(f as any)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all capitalize ${
                  timeFilter === f 
                    ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-400 shadow-sm scale-105' 
                    : 'text-neutral-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Cards */}
        <div className="px-6 space-y-4 pb-20">
          {isExercisesLoading ? (
             <div className="text-center py-10">
               <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mx-auto" />
             </div>
          ) : filteredExercises.length === 0 ? (
             <div className="text-center py-12 text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-3xl bg-neutral-50/50">
               <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
               <p className="font-bold text-neutral-500 uppercase tracking-widest">Dia de Descanso</p>
             </div>
          ) : (
            <>
              {/* Pendentes */}
              {todoExercises.map((ex) => (
                <ExerciseCard 
                  key={ex.id} 
                  exercise={ex} 
                  isCompleted={false} 
                  onClick={() => setActivePlayExercise(ex)} 
                />
              ))}
              
              {/* Concluídos */}
              {completedExercises.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-3 h-3 text-emerald-500 stroke-[3px]" />
                    <h4 className="text-[11px] uppercase font-black text-emerald-600 tracking-wider">Concluídos</h4>
                  </div>
                  {completedExercises.map((ex) => (
                    <ExerciseCard 
                      key={ex.id} 
                      exercise={ex} 
                      isCompleted={true} 
                      onClick={() => setActivePlayExercise(ex)} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalhes e Player */}
      <ExercisePlayerModal 
        exercise={activePlayExercise} 
        isOpen={!!activePlayExercise && !showFeedbackModal}
        onClose={() => setActivePlayExercise(null)}
        onFinish={() => setShowFeedbackModal(true)}
      />

      {/* Modal de Avaliação Borg/Dor */}
      <ClinicalFeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)}
        onConfirm={handleFinalizeAndSync}
        isLoading={markCompletedMutation.isPending}
      />

      {/* Notificação de Sucesso */}
      <SuccessToast 
        isOpen={showSuccessToast} 
        message="Exercício Registrado!" 
        description={`${completedInSession} de ${totalInSession} concluídos`} 
      />
    </>
  );
}

/**
 * COMPONENTE INTERNO: PLAYER DE VÍDEO E GUIA
 */
function ExercisePlayerModal({ exercise, isOpen, onClose, onFinish }: { exercise: any, isOpen: boolean, onClose: () => void, onFinish: () => void }) {
  const bunnyVideoQuery = useExerciseVideoQuery(exercise?.exercise_id);
  if (!exercise) return null;

  const video = getVideoInfo(exercise.midia_url);
  const bunnyEmbedUrl = bunnyVideoQuery.data ? getBunnyEmbedUrl(bunnyVideoQuery.data) : null;
  const isEmbedVideo = video && (video.provider === 'youtube' || video.provider === 'vimeo');
  const bunnyStatus = bunnyVideoQuery.data?.bunny_status;
  const bunnyStatusLabel = bunnyStatus === 3 ? 'Concluído' : [5, 8].includes(bunnyStatus || -1) ? 'Erro' : [0, 1, 2, 6, 7].includes(bunnyStatus || -1) ? 'Processando' : 'Indisponível';
  const isBunnyProcessing = bunnyStatus !== undefined && [0, 1, 2, 6, 7].includes(bunnyStatus);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise.nome}>
      <div className="space-y-5 pt-1">
        {/* Info do Protocolo */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em] mb-1">
            Protocolo: <span className="text-teal-600 dark:text-teal-400">{exercise.protocolo || 'Geral'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.aparelho && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                <Dumbbell className="w-3 h-3" /> {exercise.aparelho}
              </span>
            )}
            {exercise.patologia && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-black uppercase tracking-wider rounded-lg border border-purple-100/50 dark:border-purple-800/30">
                <Heart className="w-3 h-3" /> {exercise.patologia}
              </span>
            )}
          </div>
        </div>

        {/* Player de Vídeo */}
        <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-black relative shadow-lg border border-neutral-100 dark:border-neutral-800">
          {bunnyEmbedUrl ? (
            <iframe
              src={bunnyEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={exercise.nome}
            />
          ) : isEmbedVideo ? (
            <iframe
              src={video!.embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={exercise.nome}
            />
          ) : bunnyVideoQuery.isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
              <p className="text-xs font-black uppercase tracking-widest">Carregando vídeo</p>
              <p className="text-[11px] text-neutral-400">Buscando o vídeo deste exercício.</p>
            </div>
          ) : bunnyVideoQuery.isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center text-white">
              <AlertCircle className="h-8 w-8 text-amber-300" />
              <p className="text-xs font-black uppercase tracking-widest">Erro ao carregar o vídeo</p>
              <p className="text-[11px] text-neutral-400">Não foi possível consultar o vídeo deste exercício.</p>
            </div>
          ) : bunnyVideoQuery.data && bunnyStatus !== 3 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center text-white">
              {isBunnyProcessing ? (
                <Clock3 className="h-8 w-8 text-teal-300" />
              ) : (
                <Video className="h-8 w-8 text-amber-300" />
              )}
              <p className="text-xs font-black uppercase tracking-widest">Vídeo Bunny: {bunnyStatusLabel}</p>
              <p className="text-[11px] text-neutral-400">
                {isBunnyProcessing ? 'O vídeo ficará disponível quando o processamento for concluído.' : 'O vídeo Bunny não está disponível para reprodução.'}
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center text-white">
              <Video className="h-8 w-8 text-neutral-500" />
              <p className="text-xs font-black uppercase tracking-widest">Vídeo indisponível</p>
              <p className="text-[11px] text-neutral-400">Este exercício não possui um vídeo reproduzível.</p>
            </div>
          )}
        </div>

        {/* Instruções do Fisioterapeuta */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-5 rounded-[24px] border border-emerald-100/80 dark:border-emerald-900/30">
          <h5 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <ClipboardList size={16} /> Guia de Execução
          </h5>
          <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">1</span>
              <p>Realize <span className="text-emerald-600 dark:text-emerald-400 font-black">{exercise.repeticoes} repetições</span>.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">2</span>
              <p>Descanse por <span className="text-emerald-600 dark:text-emerald-400 font-black">{exercise.tempo_descanso} segundos</span>.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">3</span>
              <p>Repita por <span className="text-emerald-600 dark:text-emerald-400 font-black">{exercise.series} séries</span> completas.</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-colors"
          >
            Voltar
          </button>
          <button 
            onClick={onFinish} 
            className="flex-[1.8] py-4 bg-[#0a5c4e] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0a5c4e]/20 active:scale-[0.98] transition-all"
          >
            Finalizei as {exercise.series} séries
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PatientRotinaView;