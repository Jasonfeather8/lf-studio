import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { useExercisesQuery, useCreateExerciseMutation, useUpdateExerciseMutation, useDeleteExerciseMutation } from '../hooks';
import Button from '../components/ui/Button';
import ExerciseCard from '../components/exercises/ExerciseCard';
import { Search, Plus, Save, ChevronLeft, ChevronRight, Dumbbell, Filter, Youtube, Link as LinkIcon, Video } from 'lucide-react';
import Modal from '../components/Modal';
import { getVideoInfo } from '../utils/video';
import DeviceVideoUpload from '../components/exercises/DeviceVideoUpload';

export default function Exercises() {
  const { openDeleteModal } = useUIStore();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [deviceFile, setDeviceFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'mine' | 'global'>('mine');

  const [selectedApparatus, setSelectedApparatus] = useState('');
  const [selectedPathology, setSelectedPathology] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    midia_url: '',
    tags_aparelho: [] as string[],
    tags_patologia: [] as string[],
    tags_objetivo: [] as string[],
  });

  const itemsPerPage = 12;

  const { data: exercisesResult, isLoading } = useExercisesQuery({
    page: currentPage,
    pageSize: itemsPerPage,
    search: searchQuery,
    aparelho: selectedApparatus,
    patologia: selectedPathology,
    objetivo: selectedObjective,
    physio_id: activeTab === 'mine' ? user?.id : null
  });

  const createExerciseMutation = useCreateExerciseMutation();
  const updateExerciseMutation = useUpdateExerciseMutation();
  const deleteExerciseMutation = useDeleteExerciseMutation();

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedExerciseId(null);
    setDeviceFile(null);
    setFormData({
      nome: '',
      descricao: '',
      midia_url: '',
      tags_aparelho: [],
      tags_patologia: [],
      tags_objetivo: [],
    });
    setExerciseModalOpen(true);
  };

  const handleOpenEdit = (ex: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setSelectedExerciseId(ex.id);
    setDeviceFile(null);
    setFormData({
      nome: ex.nome,
      descricao: ex.descricao,
      midia_url: ex.midia_url,
      tags_aparelho: ex.tags_aparelho || [],
      tags_patologia: ex.tags_patologia || [],
      tags_objetivo: ex.tags_objetivo || [],
    });
    setExerciseModalOpen(true);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedExerciseId) {
      updateExerciseMutation.mutate(
        { id: selectedExerciseId, updates: formData },
        { onSuccess: () => { if (!deviceFile) setExerciseModalOpen(false); } }
      );
    } else {
      createExerciseMutation.mutate(
        { ...formData, status: 'ativo', physio_id: user?.id || null },
        { onSuccess: (exercise) => { setSelectedExerciseId(exercise.id); if (!deviceFile) setExerciseModalOpen(false); } }
      );
    }
  };

  const handleDeleteExercise = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteModal(
      'Remover do Catálogo',
      `Tem certeza de que deseja excluir o exercício "${name}"?`,
      () => { deleteExerciseMutation.mutate(id); }
    );
  };

  const videoInfo = getVideoInfo(formData.midia_url);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-4 border-neutral-100 border-t-primary animate-spin" />
      </div>
    );
  }

  const exercises = exercisesResult?.data || [];
  const totalCount = exercisesResult?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const startResult = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endResult = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f4f7f6] dark:bg-neutral-900/50 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800/40">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar exercícios..."
              className="w-full bg-white dark:bg-neutral-950 border-none rounded-full pl-11 pr-4 py-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#0a5c4e]"
            />
          </div>
          <Button variant="secondary" icon={<Filter />} onClick={() => setIsFilterOpen(!isFilterOpen)} className="rounded-full h-10 px-4 text-xs">
            Filtros
          </Button>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus strokeWidth={2.5} />} className="rounded-full">
          Novo Exercício
        </Button>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-2xl w-fit">
        <button onClick={() => { setActiveTab('mine'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'mine' ? 'bg-white dark:bg-neutral-800 text-[#0a5c4e] dark:text-teal-400 shadow-sm' : 'text-neutral-500'}`}>Meus Exercícios</button>
        <button onClick={() => { setActiveTab('global'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'global' ? 'bg-white dark:bg-neutral-800 text-[#0a5c4e] dark:text-teal-400 shadow-sm' : 'text-neutral-500'}`}>Biblioteca LF</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} ex={ex} handleOpenEdit={handleOpenEdit} handleDeleteExercise={handleDeleteExercise} readonly={activeTab === 'global'} />
        ))}
        {exercises.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-neutral-300 opacity-20" />
            <p className="text-sm font-bold text-neutral-400">Nenhum exercício encontrado</p>
          </div>
        )}
      </div>

      {/* RODAPÉ DE PAGINAÇÃO PADRONIZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-neutral-100 dark:border-neutral-800/40">
        <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
          Mostrando <span className="font-bold text-neutral-700 dark:text-neutral-300">{startResult}</span> a <span className="font-bold text-neutral-700 dark:text-neutral-300">{endResult}</span> de <span className="font-bold text-neutral-700 dark:text-neutral-300">{totalCount}</span> resultados
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 text-neutral-50 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                currentPage === p
                  ? 'bg-[#0a5c4e] text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-400 hover:bg-neutral-50 border border-neutral-100 dark:border-neutral-850'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 text-neutral-50 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Modal isOpen={exerciseModalOpen} onClose={() => setExerciseModalOpen(false)} title={isEditing ? 'Editar Exercício' : 'Novo Exercício'} maxWidth="lg">
        <form onSubmit={handleSaveExercise} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Link do Vídeo (YouTube ou Vimeo)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="url"
                    required={!deviceFile}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.midia_url}
                    onChange={(e) => setFormData({ ...formData, midia_url: e.target.value })}
                    className="w-full bg-[#f4f7f6] dark:bg-neutral-950 border border-transparent dark:border-neutral-850 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-neutral-800 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-[#0a5c4e]"
                  />
                </div>
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400 leading-relaxed">
                  Insira o link completo do vídeo. O sistema identificará automaticamente a capa e o player para o paciente.
                </p>
              </div>
              <DeviceVideoUpload
                exerciseId={selectedExerciseId}
                title={formData.nome}
                file={deviceFile}
                onFileChange={setDeviceFile}
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Prévia Detectada</span>
              <div className="relative h-40 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-100 dark:border-neutral-800 group">
                {formData.midia_url ? (
                  <>
                    <img src={videoInfo.thumbnail} className="w-full h-full object-cover opacity-60" alt="Preview" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        {videoInfo.provider === 'youtube' ? <Youtube className="text-white w-6 h-6" /> : <Video className="text-white w-6 h-6" />}
                      </div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">{videoInfo.provider} detectado</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                    <Video className="w-8 h-8 opacity-20" />
                    <span className="text-[10px] font-bold">Aguardando link...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Nome do Exercício</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-[#f4f7f6] dark:bg-neutral-950 border border-transparent rounded-2xl px-5 py-3.5 text-xs text-neutral-800 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-[#0a5c4e]"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-2">Instruções</label>
            <textarea
              rows={3}
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-[#f4f7f6] dark:bg-neutral-950 border border-transparent rounded-2xl px-5 py-3.5 text-xs text-neutral-800 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-[#0a5c4e] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <Button type="button" variant="ghost" onClick={() => setExerciseModalOpen(false)}>Cancelar</Button>
            <Button type="submit" icon={<Save className="w-4 h-4" />}>Salvar Exercício</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}