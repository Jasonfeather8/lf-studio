export interface VideoInfo {
  id: string;
  provider: 'youtube' | 'vimeo' | 'raw';
  embedUrl: string;
  thumbnail: string;
}

export const getVideoInfo = (url: string): VideoInfo => {
  if (!url) return { id: '', provider: 'raw', embedUrl: '', thumbnail: '' };

  // YouTube
  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^& \n?#]+)/);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      id,
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      id,
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}`,
      // Nota: Vimeo requer API para thumbs de alta qualidade, usando placeholder ou padrão conhecido se disponível
      thumbnail: `https://vumbnail.com/${id}.jpg`, 
    };
  }

  return {
    id: '',
    provider: 'raw',
    embedUrl: url,
    thumbnail: url,
  };
};