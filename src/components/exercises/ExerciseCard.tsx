import React, { useState } from 'react';
import { CheckCircle2, Clock3, Edit2, Loader2, Play, Trash2, Video, AlertCircle } from 'lucide-react';
import { Exercise } from '../../types';
import { getVideoInfo } from '../../utils/video';
import { useExerciseVideoQuery } from '../../hooks';
import BunnyThumbnail from './BunnyThumbnail';

interface Props {
  ex: Exercise;
  handleOpenEdit: (ex: Exercise, e: React.MouseEvent) => void;
  handleDeleteExercise: (id: string, nome: string, e: React.MouseEvent) => void;
  handleOpenPlayer?: (ex: Exercise, e: React.MouseEvent) => void;
  key?: string;
  readonly?: boolean;
}

const getStatusLabel = (status: number | undefined): string => {
  if (status === undefined) return 'Indisponível';
  if ([0, 1, 2, 6, 7].includes(status)) return 'Processando';
  if (status === 3) return 'Concluído';
  if ([5, 8].includes(status)) return 'Erro';
  return 'Indisponível';
};

export default function ExerciseCard({ ex, handleOpenEdit, handleDeleteExercise, handleOpenPlayer, readonly = false }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { data: bunnyVideo } = useExerciseVideoQuery(ex.id);

  const video = getVideoInfo(ex.midia_url);
  const thumbUrl = video.thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600";
  const isVideo = video.provider === 'youtube' || video.provider === 'vimeo';
  const isBunny = Boolean(bunnyVideo);

  const categoryTag = ex.tags_patologia && ex.tags_patologia.length > 0 
    ? ex.tags_patologia[0].toUpperCase() 
    : 'GERAL';

  const status = bunnyVideo?.bunny_status;
  const isProcessing = status !== undefined && [0, 1, 2, 6, 7].includes(status);
  const isError = status !== undefined && [5, 8].includes(status);
  const statusClass = status === 3
    ? 'text-emerald-700 dark:text-emerald-400'
    : isError
      ? 'text-red-700 dark:text-red-400'
      : 'text-teal-700 dark:text-teal-400';

  return (
    <div
      className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group h-full"
    >
      <div>
        {/* Thumbnail Container */}
        <div className="h-44 bg-[#f4f7f6] dark:bg-neutral-850 rounded-2xl overflow-hidden relative mb-4 border border-neutral-50 dark:border-neutral-800/40">
          {isBunny ? (
            <BunnyThumbnail video={bunnyVideo} alt={ex.nome} className="w-full h-full object-cover" />
          ) : (
            <>
              {/* Loader pulsante enquanto a imagem não carrega */}
              {!isImageLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-bounce"></span>
                  </div>
                </div>
              )}
              <img
                src={thumbUrl}
                alt={ex.nome}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => { setHasError(true); setIsImageLoaded(true); }}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                referrerPolicy="no-referrer"
              />
            </>
          )}

          {/* Ícone de Vídeo Indicativo */}
          {isVideo && (
            <div className="absolute top-3.5 right-3.5 z-10 bg-black/40 backdrop-blur-md p-1.5 rounded-lg text-white">
              <Video className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Category Overlay Tag */}
          <span className="absolute top-3.5 left-3.5 bg-[#0a5c4e]/90 backdrop-blur-xs text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            {categoryTag}
          </span>

          {/* Customised tag indicator if physio created it */}
          {ex.physio_id && (
            <span className="absolute bottom-3.5 right-3.5 bg-[#b3261e] text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              Personalizado
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-black text-neutral-900 dark:text-white leading-snug tracking-tight">
          {ex.nome}
        </h3>
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
          {ex.descricao}
        </p>

        {/* Small tags list at card bottom */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {ex.tags_aparelho && ex.tags_aparelho.map((t) => (
            <span
              key={t}
              className="text-[9px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2.5 py-1 rounded-full uppercase tracking-wider"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {bunnyVideo && (
        <div className={`mt-4 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${statusClass}`} aria-live="polite">
          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : isError ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          <span>{getStatusLabel(status)}</span>
        </div>
      )}

      {/* Actions bottom bar */}
      {(!readonly || handleOpenPlayer) && (
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/40 flex justify-end gap-1">
          {handleOpenPlayer && (
            <button
              type="button"
              onClick={(e) => handleOpenPlayer(ex, e)}
              className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-[#0a5c4e] dark:hover:text-teal-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
              title="Reproduzir vídeo"
              aria-label={`Reproduzir vídeo do exercício ${ex.nome}`}
            >
              <Play className="w-4 h-4 fill-current stroke-[2.2px]" />
            </button>
          )}
          {!readonly && (
            <>
              <button
                type="button"
                onClick={(e) => handleOpenEdit(ex, e)}
                className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
                title="Editar Exercício"
              >
                <Edit2 className="w-4 h-4 stroke-[2.2px]" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteExercise(ex.id, ex.nome, e)}
                className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                title="Remover do Catálogo"
              >
                <Trash2 className="w-4 h-4 stroke-[2.2px]" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
