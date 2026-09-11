import { supabase } from '@/integrations/supabase/client';
import { BunnyVideo, BunnyUploadAuthorization } from '@/types';

export const bunnyVideoService = {
  getByExerciseId: async (exerciseId: string): Promise<BunnyVideo | null> => {
    const { data, error } = await supabase
      .from('exercise_videos')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as BunnyVideo | null;
  },

  createUploadAuthorization: async (exerciseId: string, title: string): Promise<BunnyUploadAuthorization> => {
    const cleanTitle = title.trim();
    if (!exerciseId || !cleanTitle || cleanTitle.length > 200 || /[\u0000-\u001f\u007f]/.test(cleanTitle)) {
      throw new Error('Dados do vídeo inválidos.');
    }

    const { data, error } = await supabase.functions.invoke('create-bunny-video', {
      body: { exerciseId, title: cleanTitle },
    });
    if (error) throw error;
    return data as BunnyUploadAuthorization;
  },
};

export const getBunnyEmbedUrl = (video: BunnyVideo): string | null => {
  if (video.bunny_status !== 3 || !video.bunny_library_id || !video.bunny_video_id) return null;
  return `https://iframe.mediadelivery.net/embed/${encodeURIComponent(video.bunny_library_id)}/${encodeURIComponent(video.bunny_video_id)}`;
};
