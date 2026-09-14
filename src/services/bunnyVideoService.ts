import { supabase } from '@/integrations/supabase/client';
import { BunnyVideo, BunnyUploadAuthorization } from '@/types';

const isValidHttpsUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value.startsWith('https://')) return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
};

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
    if (!data) return null;

    const video = data as BunnyVideo;
    if (video.bunny_status === 3 && !video.thumbnail_url) {
      try {
        const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-bunny-thumbnail', {
          body: { exerciseId },
        });
        const syncedThumbnailUrl = syncData && typeof syncData === 'object' && !Array.isArray(syncData)
          ? (syncData as { thumbnailUrl?: unknown }).thumbnailUrl
          : undefined;
        if (!syncError && isValidHttpsUrl(syncedThumbnailUrl)) {
          return { ...video, thumbnail_url: syncedThumbnailUrl };
        }
      } catch {
        return video;
      }
    }

    return video;
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

const BUNNY_PULL_ZONE_HOSTNAME = 'vz-b364b372-b44.b-cdn.net';

export const getBunnyThumbnailUrl = (video: BunnyVideo | null | undefined): string | null => {
  if (isValidHttpsUrl(video?.thumbnail_url)) return video.thumbnail_url;
  if (!video?.bunny_library_id || !video.bunny_video_id) return null;
  return `https://${BUNNY_PULL_ZONE_HOSTNAME}/${encodeURIComponent(video.bunny_video_id)}/thumbnail.jpg`;
};

export const getBunnyEmbedUrl = (video: BunnyVideo): string | null => {
  if (video.bunny_status !== 3 || !video.bunny_library_id || !video.bunny_video_id) return null;
  return `https://iframe.mediadelivery.net/embed/${encodeURIComponent(video.bunny_library_id)}/${encodeURIComponent(video.bunny_video_id)}`;
};
