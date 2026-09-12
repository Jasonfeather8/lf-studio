import { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { BunnyVideo } from '../../types';
import { getBunnyThumbnailUrl } from '../../services/bunnyVideoService';

interface BunnyThumbnailProps {
  video: BunnyVideo | null | undefined;
  alt: string;
  className?: string;
}

type ThumbnailState = 'loading' | 'loaded' | 'unavailable';

export default function BunnyThumbnail({ video, alt, className = '' }: BunnyThumbnailProps) {
  const thumbnailUrl = getBunnyThumbnailUrl(video);
  const [state, setState] = useState<ThumbnailState>(thumbnailUrl ? 'loading' : 'unavailable');
  const isWaiting = !video || [0, 1, 2, 6, 7].includes(video.bunny_status);

  useEffect(() => {
    setState(thumbnailUrl ? 'loading' : 'unavailable');
  }, [thumbnailUrl]);

  if (!thumbnailUrl || state === 'unavailable') {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 ${className}`}>
        <ImageOff className="h-5 w-5" aria-hidden="true" />
        <span className="text-[9px] font-bold uppercase tracking-wider">{isWaiting ? 'Aguardando miniatura' : 'Miniatura indisponível'}</span>
      </div>
    );
  }

  return (
    <>
      {state === 'loading' && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 ${className}`}>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Carregando miniatura</span>
        </div>
      )}
      <img
        src={thumbnailUrl}
        alt={alt}
        title={alt}
        onLoad={() => setState('loaded')}
        onError={() => setState('unavailable')}
        className={`${className} ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
      />
    </>
  );
}
