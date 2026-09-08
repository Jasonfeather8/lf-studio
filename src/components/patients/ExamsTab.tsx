import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, ChevronLeft, ChevronRight, ExternalLink, Loader2, AlertCircle, ImageIcon, Edit2, Check } from 'lucide-react';
import { usePatientExamsQuery, useCreateExamMutation, useUpdateExamMutation, useDeleteExamMutation } from '../../hooks';
import { useUIStore } from '../../store/uiStore';
import { examService } from '../../services/examService';
import { PatientExam } from '../../types';
import Modal from '../Modal';

interface ExamsTabProps {
  activePatientId: string;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function ExamsTab({ activePatientId, page, setPage }: ExamsTabProps) {
  const { data: examsData, isLoading } = usePatientExamsQuery(activePatientId, page, 10);
  const { openDeleteModal } = useUIStore();
  const createExamMutation = useCreateExamMutation(activePatientId);
  const updateExamMutation = useUpdateExamMutation(activePatientId);
  const deleteExamMutation = useDeleteExamMutation(activePatientId);

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para renomear
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<PatientExam | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const exams = examsData?.data || [];
  const total = examsData?.total || 0;
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        setErrorMessage("Apenas arquivos PDF, JPEG ou PNG são aceitos. Limite: 10MB.");
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { 
        setErrorMessage("Arquivo muito grande. O limite máximo é de 10MB.");
        setSelectedFile(null);
        return;
      }

      setErrorMessage('');
      setSelectedFile(file);

      if (!newExamTitle) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        setNewExamTitle(cleanName);
      }
    }
  };

  const handleOpenModal = () => {
    setNewExamTitle('');
    setSelectedFile(null);
    setErrorMessage('');
    setExamModalOpen(true);
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
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Por favor, selecione um arquivo para anexar.');
      return;
    }
    if (!newExamTitle.trim()) {
      setErrorMessage('Por favor, informe o título do documento.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');

      // 1. Upload do arquivo para o bucket patient-exams no Supabase Storage
      const uploadedUrl = await examService.uploadFile(selectedFile, activePatientId);

      // 2. Criação do registro no banco
      const finalTitle = newExamTitle.trim();
      createExamMutation.mutate(
        {
          patient_id: activePatientId,
          titulo: finalTitle,
          arquivo_url: uploadedUrl
        },
        {
          onSuccess: () => {
            setIsUploading(false);
            setExamModalOpen(false);
            setNewExamTitle('');
            setSelectedFile(null);
          },
          onError: (err: any) => {
            setIsUploading(false);
            setErrorMessage('Erro ao salvar informações do exame. Tente novamente.');
            console.error(err);
          }
        }
      );
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Falha ao fazer upload do arquivo. Verifique sua conexão.');
      console.error(err);
    }
  };

  const handleDelete = (id: string, fileUrl: string, title: string) => {
    openDeleteModal(
      'Excluir Documento',
      `Tem certeza de que deseja excluir o exame "${title}"?`,
      () => deleteExamMutation.mutate({ id, fileUrl })
    );
  };

  const isPdf = (title: string, url: string) => {
    return title.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-white">Documentos e Exames Clínicos</h3>
          <p className="text-xs text-neutral-400">Total de {total} arquivo(s) anexado(s)</p>
        </div>
        <button 
          onClick={handleOpenModal} 
          className="bg-[#0a5c4e] hover:bg-[#08493e] text-white px-4.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" /> 
          <span>Anexar Exame</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
          <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Nenhum exame anexado</h4>
          <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
            Clique no botão acima para adicionar laudos, ressonâncias ou fotos de exames do paciente.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
          {exams.map(exam => {
            const hasRealUrl = exam.arquivo_url && exam.arquivo_url !== '#';
            const pdfDoc = isPdf(exam.titulo, exam.arquivo_url);

            return (
              <div key={exam.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-[#0a5c4e] dark:text-[#52bfa6] flex items-center justify-center shrink-0">
                    {pdfDoc ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-white truncate">{exam.titulo}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-400">
                        {new Date(exam.data_upload).toLocaleDateString('pt-BR')} às {new Date(exam.data_upload).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        {pdfDoc ? 'PDF' : 'IMAGEM'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {hasRealUrl && (
                    <a
                      href={exam.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-[#0a5c4e] dark:text-[#52bfa6] hover:bg-teal-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                      title="Abrir arquivo para visualização"
                    >
                      <ExternalLink size={16} />
                      <span className="hidden sm:inline">Visualizar</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenEditModal(exam)}
                    className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                    title="Renomear título do exame"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(exam.id, exam.arquivo_url, exam.titulo)} 
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
                    title="Excluir documento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800/40">
          <p className="text-[11px] text-neutral-400 font-semibold">
            Página <span className="font-bold text-neutral-700 dark:text-neutral-200">{page}</span> de <span className="font-bold text-neutral-700 dark:text-neutral-200">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl disabled:opacity-30 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <ChevronLeft size={16}/>
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page >= totalPages} 
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl disabled:opacity-30 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ANEXAR EXAME */}
      <Modal isOpen={examModalOpen} onClose={() => { if (!isUploading) setExamModalOpen(false); }} title="Anexar Novo Exame">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5">
              Arquivo (PDF, PNG, JPG até 10MB)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                selectedFile 
                  ? 'border-[#0a5c4e] bg-teal-50/20 dark:bg-teal-950/10' 
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-[#0a5c4e]'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <UploadCloud className="w-8 h-8 text-[#0a5c4e] dark:text-[#52bfa6] mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-black text-neutral-800 dark:text-white truncate max-w-[280px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Clique para trocar
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Clique para selecionar o arquivo
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">PDF, JPEG ou PNG</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5">
              Nome / Título do Documento
            </label>
            <input 
              type="text" 
              required 
              disabled={isUploading}
              placeholder="Ex: Ressonância Magnética Joelho Direito" 
              value={newExamTitle} 
              onChange={(e) => setNewExamTitle(e.target.value)} 
              className="w-full bg-[#f4f7f6] dark:bg-neutral-800 border border-transparent focus:border-[#0a5c4e] rounded-xl px-4 py-3 text-xs font-bold outline-none text-neutral-800 dark:text-white" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setExamModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isUploading || !selectedFile || !newExamTitle.trim()} 
              className="bg-[#0a5c4e] hover:bg-[#07473c] text-white px-5 py-2.5 rounded-xl font-black text-xs transition-opacity hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando para o Storage...</span>
                </>
              ) : (
                <span>Salvar Exame</span>
              )}
            </button>
          </div>
        </form>
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
