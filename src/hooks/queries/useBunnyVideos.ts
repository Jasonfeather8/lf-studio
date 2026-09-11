import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { bunnyVideoService } from '../../services/bunnyVideoService';
import { BunnyVideo } from '../../types';

export const BUNNY_VIDEO_KEYS = {
  byExercise: (exerciseId: string) => ['exercise_videos', exerciseId],
};

export function useExerciseVideoQuery(exerciseId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = exerciseId ? BUNNY_VIDEO_KEYS.byExercise(exerciseId) : ['exercise_videos', 'none'];

  const query = useQuery<BunnyVideo | null>({
    queryKey,
    queryFn: () => bunnyVideoService.getByExerciseId(exerciseId as string),
    enabled: !!exerciseId,
    refetchInterval: (current) => {
      const status = current.state.data?.bunny_status;
      return current.state.data && status !== 3 && status !== 5 && status !== 8 ? 5000 : false;
    },
  });

  useEffect(() => {
    if (!exerciseId) return;

    const channel = supabase
      .channel(`exercise-video-${exerciseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exercise_videos', filter: `exercise_id=eq.${exerciseId}` },
        () => { void queryClient.invalidateQueries({ queryKey: BUNNY_VIDEO_KEYS.byExercise(exerciseId) }); },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [exerciseId, queryClient]);

  return query;
}
