import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Loader2, UploadCloud } from 'lucide-react';
import * as tus from 'tus-js-client';
import { useExerciseVideoQuery } from '../../hooks';
import { bunnyVideoService } from '../../services/bunnyVideoService';
interface DeviceVideoUploadProps {
  exerciseId: string | null;
  title: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

const getStatusLabel = (status: number | undefined): string => {
  if (status === undefined) return 'Aguardando arquivo';
  if ([0, 1, 2, 6, 7].includes(status)) return 'Processando';
  if (status === 3) return 'Concluído';
  if ([5, 8].includes(status)) return 'Erro';
  return 'Indisponível';
};

const getStatusClasses = (status: number | undefined): string => {
  if (status === 3) return 'text-emerald-700 dark:text-emerald-400';
  if ([5, 8].includes(status || -1)) return 'text-red-700 dark:text-red-400';
  return 'text-teal-700 dark:text-teal-400';
};

export default function DeviceVideoUpload({ exerciseId, title, file, onFileChange }: DeviceVideoUploadProps) {
  const { data: video, error: videoError } = useExerciseVideoQuery(exerciseId);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadKey = useRef<string | null>(null);

  useEffect(() => {
    if (!exerciseId || !file) return;
    const key = `${exerciseId}:${file.name}:${file.size}:${file.lastModified}`;
    if (uploadKey.current === key) return;
    uploadKey.current = key;

    let cancelled = false;
    const startUpload = async () => {
      setError(null);
      setProgress(0);
      setUploading(true);
      try {
        const authorization = await bunnyVideoService.createUploadAuthorization(exerciseId, title);
        if (cancelled) return;

        const upload = new tus.Upload(file, {
          endpoint: 'https://video.bunnycdn.com/tusupload',
          retryDelays: [0, 1000, 3000, 5000],
          uploadSize: file.size,
          metadata: {
            title: title.trim().slice(0, 200),
            filetype: file.type,
          },
          headers: {
            AuthorizationSignature: authorization.authorizationSignature,
            AuthorizationExpire: String(authorization.authorizationExpire),
            VideoId: authorization.videoId,
            LibraryId: authorization.libraryId,
          },
          onError: (uploadError) => {
            if (!cancelled) {
              setError(uploadError.message || 'Não foi possível enviar o vídeo.');
              setUploading(false);
            }
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            if (!cancelled) setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          },
          onSuccess: () => {
            if (!cancelled) {
              setProgress(100);
              setUploading(false);
            }
          },
        });
        upload.start();
      } catch (uploadError) {
        if (!cancelled) {
          setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível iniciar o envio.');
          setUploading(false);
        }
      }
    };

    void startUpload();
    return () => { cancelled = true; };
  }, [exerciseId, file, title]);

  const handleFileChange = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!candidate.type.startsWith('video/')) {
      setError('Selecione um arquivo de vídeo válido.');
      return;
    }
    if (candidate.size === 0 || candidate.size > MAX_FILE_SIZE) {
      setError('O vídeo deve ter entre 1 byte e 2 GB.');
      return;
    }
    setError(null);
    uploadKey.current = null;
    onFileChange(candidate);
  };

  const currentStatus = video?.bunny_status;
  const statusLabel = uploading ? 'Enviando' : getStatusLabel(currentStatus);
  const statusClasses = getStatusClasses(currentStatus);

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900/50 dark:bg-teal-950/20">
      <div className="flex items-center gap-2">
        <UploadCloud className="h-4 w-4 text-teal-700 dark:text-teal-400" />
        <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">Vídeo do dispositivo</span>
      </div>
      <input
        type="file"
        accept="video/*"
        disabled={uploading}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
        className="block w-full text-xs font-semibold text-neutral-600 file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-[10px] file:font-black file:text-teal-700 dark:text-neutral-300 dark:file:bg-neutral-900 dark:file:text-teal-300"
      />
      {!exerciseId && <p className="text-[10px] font-semibold text-neutral-500">Salve o exercício primeiro para iniciar o envio.</p>}
      {file && <p className="truncate text-[10px] font-semibold text-neutral-500">Arquivo: {file.name}</p>}
      {(file || video) && (
        <div className="space-y-2 text-[10px] font-black uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${uploading ? 'text-teal-700 dark:text-teal-400' : statusClasses}`}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : currentStatus === 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : [5, 8].includes(currentStatus || -1) ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
            <span>{uploading ? `${statusLabel} ${progress}%` : statusLabel}</span>
          </div>
          {uploading && <div className="h-1.5 overflow-hidden rounded-full bg-white dark:bg-neutral-800"><div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} /></div>}
          {!uploading && video && <p className="normal-case font-semibold text-neutral-500">{video.bunny_status === 3 ? 'O vídeo está pronto para reprodução.' : video.bunny_status === 5 || video.bunny_status === 8 ? 'O processamento falhou. Envie um novo arquivo.' : 'O Bunny está processando o vídeo.'}</p>}
        </div>
      )}
      {(error || videoError) && <p role="alert" className="text-[10px] font-bold text-red-700 dark:text-red-400">{error || 'Não foi possível consultar o status do vídeo.'}</p>}
    </div>
  );
}
