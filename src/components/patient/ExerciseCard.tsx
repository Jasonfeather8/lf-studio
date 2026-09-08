import React from 'react';
import { Play, Check, Target, Dumbbell, Heart } from 'lucide-react';
import { getVideoInfo } from '../../utils/video';

interface ExerciseCardProps {
  exercise: any;
  isCompleted: boolean;
  onClick: () => void;
}

export default function ExerciseCard({ exercise, isCompleted, onClick }: ExerciseCardProps) {
  const video = getVideoInfo(exercise.midia_url);
  const thumbUrl = video.thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80";

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-neutral-900 rounded-3xl p-3 flex items-center gap-4 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-neutral-800 cursor-pointer transition-all active:scale-[0.98] group ${
        isCompleted
          ? 'opacity-60 grayscale-[0.3]'
          : 'hover:shadow-[0_8px_24px_-8px_rgba(13,148,136,0.15)] dark:hover:shadow-none dark:hover:bg-neutral-800'
      }`}
    >
      <img
        src={thumbUrl}
        alt={exercise.nome}
        className="w-20 h-20 rounded-2xl object-cover shadow-sm"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1 min-w-0 py-1">
        <div className="flex flex-wrap gap-1 mb-1.5">
          {exercise.aparelho && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-wider rounded-md border border-blue-100/50 dark:border-blue-800/30">
              <Dumbbell className="w-2 h-2" /> {exercise.aparelho}
            </span>
          )}
          {exercise.patologia && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase tracking-wider rounded-md border border-purple-100/50 dark:border-purple-800/30">
              <Heart className="w-2 h-2" /> {exercise.patologia}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">
          {exercise.nome}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {exercise.series} séries
          </span>
          <span className="bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {exercise.repeticoes} rep
          </span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors mr-1 ${
        isCompleted
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-500 dark:group-hover:text-neutral-900'
      }`}>
        {isCompleted ? <Check className="w-5 h-5 stroke-[2.5px]" /> : <Play className="w-5 h-5 ml-1 fill-current stroke-current" />}
      </div>
    </div>
  );
}