import { AlertCircle, Clock3, Loader2, Video } from 'lucide-react';
import Modal from '../Modal';
import { useExerciseVideoQuery } from '../../hooks';
import { Exercise } from '../../types';
import { getBunnyEmbedUrl } from '../../services/bunnyVideoService';
import { getVideoInfo } from '../../utils/video';

interface Props {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

const getBunnyStatusLabel = (status: number | undefined): string => {
  if (status === undefined) return 'Indisponível';
  if ([0, 1, 2, 6, 7].includes(status)) return 'Processando';
  if (status === 3) return 'Concluído';
  if ([5, 8].includes(status)) return 'Erro';
  return 'Indisponível';
};

export default function ExerciseVideoPlayerModal({ exercise, isOpen, onClose }: Props) {
  const bunnyVideoQuery = useExerciseVideoQuery(exercise?.id);

  if (!exercise) return null;

  const video = getVideoInfo(exercise.midia_url);
  const bunnyEmbedUrl = bunnyVideoQuery.data ? getBunnyEmbedUrl(bunnyVideoQuery.data) : null;
  const isEmbedVideo = video.provider === 'youtube' || video.provider === 'vimeo';
  const bunnyStatus = bunnyVideoQuery.data?.bunny_status;
  const bunnyStatusLabel = getBunnyStatusLabel(bunnyStatus);
  const isBunnyProcessing = bunnyStatus !== undefined && [0, 1, 2, 6, 7].includes(bunnyStatus);

  const playerContent = bunnyEmbedUrl ? (
    <iframe
      src={bunnyEmbedUrl}
      className="w-full h-full"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      title={`Vídeo Bunny do exercício ${exercise.nome}`}
    />
  ) : isEmbedVideo ? (
    <iframe
      src={video.embedUrl}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={`${video.provider === 'youtube' ? 'YouTube' : 'Vimeo'} do exercício ${exercise.nome}`}
    />
  ) : bunnyVideoQuery.isLoading ? (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center text-white">
      <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
      <p className="text-xs font-black uppercase tracking-widest">Carregando status do vídeo</p>
    </div>
  ) : bunnyVideoQuery.data && bunnyStatus !== 3 ? (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center text-white">
      {isBunnyProcessing ? (
        <Clock3 className="h-8 w-8 text-teal-300" />
      ) : (
        <AlertCircle className="h-8 w-8 text-amber-300" />
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
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise.nome} maxWidth="xl">
      <div className="space-y-4 pt-1">
        <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-black relative shadow-lg border border-neutral-100 dark:border-neutral-800">
          {playerContent}
        </div>
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 leading-relaxed">
          {exercise.descricao}
        </p>
      </div>
    </Modal>
  );
}
