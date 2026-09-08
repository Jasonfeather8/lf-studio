import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/uiStore';
import { usePatientsQuery, usePatientExamsQuery, useCreateExamMutation, useUpdateExamMutation, useDeleteExamMutation } from '../hooks';
import { examService } from '../services/examService';
import { PatientExam } from '../types';
import {
  FileText,
  Trash2,
  Plus,
  ImageIcon,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Edit2
} from 'lucide-react';
import Modal from '../components/Modal';

export default function PatientExams() {
  const { currentUser, openDeleteModal } = useUIStore();
  const { data: patients } = usePatientsQuery();

  // Encontrar o registro de paciente vinculado ao perfil logado
  const patient = patients?.data?.find(p => p.profile_id === currentUser?.id);
  const patientId = patient?.id || null;

  // ESTADO DE PAGINAÇÃO
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: examsData, isLoading } = usePatientExamsQuery(patientId, page, pageSize);
  const createExamMutation = useCreateExamMutation(patientId);
  const updateExamMutation = useUpdateExamMutation(patientId);
  const deleteExamMutation = useDeleteExamMutation(patientId);

  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ESTADOS PARA RENOMEAR
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<PatientExam | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // --- ESTADOS DE UPLOAD ---
  const [dragActive, setDragActive] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sessionUploadedIds, setSessionUploadedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setValidationError("Apenas arquivos PDF, JPEG ou PNG são aceitos. Limite: 10MB.");
      setRawFile(null);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { 
      setValidationError("Arquivo muito grande. O limite máximo é de 10MB.");
      setRawFile(null);
      return false;
    }

    setValidationError('');
    setRawFile(file);

    if (!newTitle) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanName = nameWithoutExt.replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setNewTitle(cleanName);
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleOpenEditModal = (exam: PatientExam) => {
    setEditingExam(exam);
    setEditingTitle(exam.titulo);
    setEditModalOpen(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam || !editingTitle.trim()) return;

    updateExamMutation.mutate(
      { id: editingExam.id, updates: { titulo: editingTitle.trim() } },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setEditingExam(null);
          setEditingTitle('');
          setSuccessMsg('Título do exame atualizado com sucesso!');
        }
      }
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !newTitle.trim()) return;

    if (!rawFile) {
      setValidationError('Por favor, selecione um arquivo para anexar.');
      return;
    }

    try {
      setIsUploading(true);
      setValidationError('');

      // 1. Upload do arquivo real para o Supabase Storage
      const uploadedUrl = await examService.uploadFile(rawFile, patientId);

      // 2. Criação do registro no banco
      const finalTitle = newTitle.trim();

      createExamMutation.mutate(
        { 
          patient_id: patientId, 
          titulo: finalTitle, 
          arquivo_url: uploadedUrl 
        },
        {
          onSuccess: (data) => {
            setIsUploading(false);
            setRawFile(null);
            setModalOpen(false);
            setNewTitle('');
            if (data?.id) setSessionUploadedIds(prev => [...prev, data.id]);
            setSuccessMsg('Exame enviado com sucesso! Fisioterapeuta notificado.');
          },
          onError: () => {
            setIsUploading(false);
            setValidationError('Falha ao registrar exame no banco. Tente novamente.');
          }
        }
      );
    } catch (err: any) {
      setIsUploading(false);
      setValidationError(err.message || 'Falha no envio do arquivo. Verifique sua conexão.');
    }
  };

  const handleDelete = (id: string, fileUrl: string, title: string) => {
    openDeleteModal(
      'Excluir Documento Clínico?',
      `Tem certeza que deseja excluir o exame "${title}"? Esta ação não pode ser desfeita.`,
      () => {
        deleteExamMutation.mutate({ id, fileUrl }, {
          onSuccess: () => setSuccessMsg('Documento excluído com sucesso.')
        });
      }
    );
  };

  const exams = examsData?.data || [];
  const totalExamsCount = examsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalExamsCount / pageSize));

  return (
    <div className="space-y-6 pb-24 animate-fadeIn max-w-md mx-auto px-4">
      <div className="flex flex-col items-center text-center mt-4">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Prontuário de Exames</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
          Gerencie e consulte seus exames anexados e laudos clínicos.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 border border-emerald-200 dark:border-emerald-900/30 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-neutral-100 dark:bg-neutral-900 rounded-[24px] animate-pulse" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6">
          <FileText className="w-8 h-8 mx-auto mb-4 text-neutral-400 opacity-20" />
          <h4 className="text-sm font-bold text-neutral-800 dark:text-white">Nenhum exame cadastrado</h4>
          <p className="text-xs text-neutral-400 mt-1">Toque no botão + para adicionar seus laudos e fotos de exames.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const isPdf = exam.titulo.toLowerCase().endsWith('.pdf') || exam.arquivo_url.includes('.pdf');
            const hasRealUrl = exam.arquivo_url && exam.arquivo_url !== '#';
            const isNew = sessionUploadedIds.includes(exam.id);

            return (
              <div key={exam.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-[24px] shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 bg-[#0a5c4e]/5 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-[#0a5c4e] dark:text-[#52bfa6] shrink-0">
                      {isPdf ? <FileText className="w-5.5 h-5.5" /> : <ImageIcon className="w-5.5 h-5.5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-neutral-900 dark:text-white truncate">{exam.titulo}</h4>
                      <p className="text-[10px] font-bold text-neutral-400 mt-0.5">
                        {new Date(exam.data_upload).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasRealUrl && (
                      <a 
                        href={exam.arquivo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-[#0a5c4e] dark:text-[#52bfa6] hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                        title="Visualizar arquivo"
                      >
                        <ExternalLink size={18}/>
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(exam)}
                      className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                      title="Renomear título"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDelete(exam.id, exam.arquivo_url, exam.titulo)} 
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer"
                      title="Excluir documento"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-100/60 dark:border-neutral-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-400 font-semibold uppercase">Status Clínico</span>
                  {isNew ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full">
                      <Check size={14}/> Enviado agora
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-full">
                      <CheckCheck size={14}/> Sincronizado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINAÇÃO PADRONIZADA */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl disabled:opacity-30 cursor-pointer shadow-sm">
            <ChevronLeft size={18}/>
          </button>
          <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Pág {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl disabled:opacity-30 cursor-pointer shadow-sm">
            <ChevronRight size={18}/>
          </button>
        </div>
      )}

      <div className="fixed bottom-32 left-0 right-0 z-40 max-w-md mx-auto flex justify-end px-6">
        <button 
          onClick={() => { setValidationError(''); setRawFile(null); setNewTitle(''); setModalOpen(true); }} 
          className="w-14 h-14 bg-[#0a5c4e] dark:bg-[#52bfa6] dark:text-neutral-950 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-90"
        >
          <Plus size={24}/>
        </button>
      </div>

      {/* MODAL DE UPLOAD */}
      <Modal isOpen={modalOpen} onClose={() => { if (!isUploading) setModalOpen(false); }} title="Anexar Novo Exame">
        <div className="space-y-5 pt-2">
          <div 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag} 
            onDragLeave={handleDrag} 
            onDrop={handleDrop} 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
              validationError 
                ? 'border-red-500 bg-red-50/40' 
                : rawFile 
                ? 'border-[#0a5c4e] bg-[#0a5c4e]/5' 
                : dragActive 
                ? 'border-[#0a5c4e] bg-[#0a5c4e]/5' 
                : 'border-neutral-200 dark:border-neutral-800 hover:border-[#0a5c4e]'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
              accept=".pdf,.png,.jpg,.jpeg" 
              disabled={isUploading}
            />
            <UploadCloud className="w-8 h-8 text-[#0a5c4e] dark:text-[#52bfa6] mb-2"/>
            {rawFile ? (
              <div>
                <p className="text-xs font-black text-neutral-800 dark:text-white max-w-[280px] truncate">{rawFile.name}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{(rawFile.size / (1024 * 1024)).toFixed(2)} MB - Clique para trocar</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-black">Arraste ou clique para selecionar</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">PDF, PNG, JPG (até 10MB)</p>
              </div>
            )}
          </div>

          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0"/>
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5">
                Título / Identificação do Exame
              </label>
              <input 
                type="text" 
                required 
                disabled={isUploading} 
                placeholder="Ex: Laudo Ressonância Coluna Lombar" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                className="w-full bg-[#f4f7f6] dark:bg-neutral-800 rounded-2xl px-4 py-3.5 text-xs font-semibold focus:outline-none text-neutral-800 dark:text-white"
              />
            </div>

            <button 
              type="submit" 
              disabled={isUploading || !rawFile || !newTitle.trim()} 
              className="w-full bg-[#0a5c4e] dark:bg-[#52bfa6] text-white dark:text-neutral-950 py-3.5 rounded-2xl font-black text-xs cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando para o Storage...</span>
                </>
              ) : (
                <span>Enviar Exame</span>
              )}
            </button>
          </form>
        </div>
      </Modal>

      {/* MODAL DE RENOMEAR EXAME */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Renomear Exame">
        <form onSubmit={handleSaveRename} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5">
              Novo Título do Documento
            </label>
            <input 
              type="text" 
              required 
              placeholder="Ex: Laudo Atualizado Ressonância" 
              value={editingTitle} 
              onChange={(e) => setEditingTitle(e.target.value)} 
              className="w-full bg-[#f4f7f6] dark:bg-neutral-800 border border-transparent focus:border-[#0a5c4e] rounded-xl px-4 py-3 text-xs font-bold outline-none text-neutral-800 dark:text-white" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={!editingTitle.trim() || updateExamMutation.isPending} 
              className="bg-[#0a5c4e] hover:bg-[#07473c] text-white px-5 py-2.5 rounded-xl font-black text-xs transition-opacity hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {updateExamMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Salvar Alteração</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
