import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BunnyVideo } from '../../types';
import { getBunnyThumbnailUrl } from '../../services/bunnyVideoService';

interface BunnyThumbnailProps {
  video: BunnyVideo | null | undefined;
  alt: string;
  className?: string;
}

export default function BunnyThumbnail({ video, alt, className = '' }: BunnyThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const thumbnailUrl = getBunnyThumbnailUrl(video);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [thumbnailUrl]);

  if (!thumbnailUrl || hasError) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="text-[9px] font-bold uppercase tracking-wider">Aguardando miniatura</span>
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 ${className}`}>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Carregando miniatura</span>
        </div>
      )}
      <img
        src={thumbnailUrl}
        alt={alt}
        title={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
      />
    </>
  );
}
