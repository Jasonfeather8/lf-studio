import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Filter, X, Save, Edit3, Trash2, 
  MapPin, Phone, Mail, Calendar, Activity, ChevronRight, CheckCircle, 
  AlertCircle, Dumbbell, FileText, FileVideo, Shield, Info, MoreVertical,
  Camera, FileUp, ListChecks, Play, Pause, ExternalLink, Timer, ArrowRight,
  TrendingUp, Download, Eye, RefreshCw, BarChart2, MessageCircle
, Edit, Copy, ClipboardList, ChevronLeft, Plus, UploadCloud, UserCheck, RotateCcw, Clock, Check, GripVertical, Loader2, Video} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { Patient, Prescription, PrescriptionExercise, Exercise } from '../../types';
import {
  usePatientsQuery, useCreatePatientMutation, useUpdatePatientMutation, useDeletePatientMutation,
  useExercisesQuery,
  usePrescriptionQuery, useCreatePrescriptionMutation, useUpdatePrescriptionMutation, useDeletePrescriptionMutation,
  usePrescriptionExercisesQuery, usePatientAdherenceQuery, useProfilesQuery, usePatientExamsQuery } from '../../hooks';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from 'recharts';
import Modal from '../Modal';
import { getVideoInfo } from '../../utils/video';

interface PrescriptionFormViewProps {
  editingPrescriptionId: string | null;
  duplicatePrescriptionId: string | null;
  onBack: () => void;
  triggerToast: (message: string, patientId?: string, type?: 'success' | 'info') => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export default function PrescriptionFormView({
  editingPrescriptionId,
  duplicatePrescriptionId,
  onBack,
  triggerToast,
}: PrescriptionFormViewProps) {
  const { activePatientId } = useUIStore();
  const { user, loading: authLoading } = useAuth();
  const targetId = editingPrescriptionId || duplicatePrescriptionId;
  const isEditing = !!editingPrescriptionId;
  const { data: exercisesData, error: exercisesError } = useExercisesQuery();
  const {
    data: prescription,
    isLoading: isPrescriptionLoading,
    error: prescriptionError,
  } = usePrescriptionQuery(targetId);
  const {
    data: prescriptionExercises,
    isLoading: isPrescriptionExercisesLoading,
    error: prescriptionExercisesError,
  } = usePrescriptionExercisesQuery(targetId);

  const [cart, setCart] = useState<{
    exercise_id: string;
    series: number;
    repeticoes: string;
    tempo_descanso: number;
    local_execucao: 'estúdio' | 'casa';
    dias_semana?: number[];
    observacoes?: string;
    ordem: number;
  }[]>([]);

  const [title, setTitle] = useState('Série A - Mobilidade e Força');
  const [dateInicio, setDateInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dateFim, setDateFim] = useState('');
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 3, 5]);

  const weekDays = [
    { value: 0, label: 'D' },
    { value: 1, label: 'S' },
    { value: 2, label: 'T' },
    { value: 3, label: 'Q' },
    { value: 4, label: 'Q' },
    { value: 5, label: 'S' },
    { value: 6, label: 'S' },
  ];

  const toggleDay = (day: number) => {
    setDiasSemana(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const [searchExTerm, setSearchExTerm] = useState('');
  const [selectedApparatus, setSelectedApparatus] = useState('');
  const [selectedPatologia, setSelectedPatologia] = useState('');
  const [activeExTab, setActiveExTab] = useState<'mine' | 'global'>('mine');

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [exConfig, setExConfig] = useState({
    series: 3,
    repeticoes: '12',
    tempo_descanso: 60,
    local_execucao: 'estúdio' as 'estúdio' | 'casa',
    dias_semana: [] as number[],
    observacoes: '',
  });

  const createPrescriptionMutation = useCreatePrescriptionMutation();
  const updatePrescriptionMutation = useUpdatePrescriptionMutation();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!prescription) return;

    setTitle(isEditing ? prescription.titulo : `${prescription.titulo} (Cópia)`);
    setDateInicio(prescription.data_inicio);
    setDateFim(prescription.data_fim || '');
    setDiasSemana(prescription.dias_semana || []);
  }, [prescription, isEditing]);

  useEffect(() => {
    if (!prescriptionExercises) return;

    setCart(prescriptionExercises.map((pe) => ({
      exercise_id: pe.exercise_id,
      series: pe.series,
      repeticoes: String(pe.repeticoes),
      tempo_descanso: pe.tempo_descanso,
      local_execucao: pe.local_execucao as 'estúdio' | 'casa',
      dias_semana: pe.dias_semana || [],
      observacoes: '',
      ordem: pe.ordem,
    })));
  }, [prescriptionExercises]);

  const handleOpenConfig = (ex: Exercise) => {
    setSelectedEx(ex);
    setExConfig({
      series: 3,
      repeticoes: '12',
      tempo_descanso: 60,
      local_execucao: 'estúdio',
      dias_semana: [],
      observacoes: '',
    });
    setConfigModalOpen(true);
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEx) return;

    if (cart.some(item => item.exercise_id === selectedEx.id)) {
      triggerToast('Este exercício já está na prescrição.', activePatientId, 'info');
      setConfigModalOpen(false);
      return;
    }

    const newCartItem = {
      exercise_id: selectedEx.id,
      series: exConfig.series,
      repeticoes: exConfig.repeticoes,
      tempo_descanso: exConfig.tempo_descanso,
      local_execucao: exConfig.local_execucao,
      dias_semana: exConfig.dias_semana,
      observacoes: exConfig.observacoes,
      ordem: cart.length + 1,
    };

    setCart([...cart, newCartItem]);
    setConfigModalOpen(false);
  };

  const handleQuickAdd = (ex: Exercise) => {
    if (cart.some(item => item.exercise_id === ex.id)) {
      triggerToast('Este exercício já está na prescrição.', activePatientId, 'info');
      return;
    }

    const newCartItem = {
      exercise_id: ex.id,
      series: 3,
      repeticoes: '12',
      tempo_descanso: 60,
      local_execucao: 'estúdio' as const,
      observacoes: '',
      ordem: cart.length + 1,
    };
    setCart([...cart, newCartItem]);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    const ordered = updated.map((item, idx) => ({ ...item, ordem: idx + 1 }));
    setCart(ordered);
  };

  const handleUpdateCartItem = (index: number, field: string, value: any) => {
    const copy = [...cart];
    copy[index] = {
      ...copy[index],
      [field]: value,
    };
    setCart(copy);
  };

  const handleSavePrescription = () => {
    setSaveError(null);

    if (authLoading) {
      setSaveError('A autenticação ainda está carregando. Tente novamente em instantes.');
      return;
    }
    if (!activePatientId) {
      setSaveError('Nenhum paciente ativo foi selecionado.');
      return;
    }
    if (cart.length === 0) {
      setSaveError('Adicione pelo menos um exercício antes de salvar.');
      return;
    }
    if (!user) {
      setSaveError('Não foi possível identificar a usuária autenticada. Faça login novamente.');
      return;
    }

    const exercisesToSave = cart.map((item, index) => ({
      exercise_id: item.exercise_id,
      series: Number(item.series),
      repeticoes: isNaN(Number(item.repeticoes)) ? 12 : Number(item.repeticoes),
      tempo_descanso: Number(item.tempo_descanso),
      local_execucao: item.local_execucao,
      dias_semana: item.dias_semana || [],
      ordem: index + 1,
    }));

    if (isEditing && editingPrescriptionId) {
      updatePrescriptionMutation.mutate(
        {
          id: editingPrescriptionId,
          updates: {
            titulo: title,
            data_inicio: dateInicio,
            data_fim: dateFim || null,
            dias_semana: diasSemana,
          },
          exercises: exercisesToSave,
        },
        {
          onSuccess: () => {
            triggerToast(`Prescrição "${title}" atualizada!`, activePatientId, 'success');
            onBack();
          },
          onError: (error) => {
            setSaveError(getErrorMessage(error, 'Não foi possível atualizar a prescrição.'));
          },
        }
      );
    } else {
      createPrescriptionMutation.mutate(
        {
          prescription: {
            patient_id: activePatientId,
            physio_id: user.id,
            titulo: title,
            data_inicio: dateInicio,
            data_fim: dateFim || null,
            dias_semana: diasSemana,
            status: 'ativo',
            created_at: new Date().toISOString(),
          },
          exercises: exercisesToSave,
        },
        {
          onSuccess: () => {
            triggerToast(`Prescrição "${title}" criada com sucesso!`, activePatientId, 'success');
            onBack();
          },
          onError: (error) => {
            setSaveError(getErrorMessage(error, 'Não foi possível criar a prescrição.'));
          },
        }
      );
    }
  };

  const allExercisesArr = exercisesData?.data || [];
  const activeExercises = allExercisesArr.filter(e => e.status === 'ativo') || [];
  const tabFilteredExercises = activeExercises.filter(ex =>
    activeExTab === 'mine' ? ex.physio_id === user?.id : !ex.physio_id
  );

  const filteredCatalog = tabFilteredExercises.filter((ex) => {
    const matchesSearch = ex.nome.toLowerCase().includes(searchExTerm.toLowerCase()) ||
                          ex.descricao.toLowerCase().includes(searchExTerm.toLowerCase());
    const matchesApparatus = selectedApparatus === '' || ex.tags_aparelho.includes(selectedApparatus);
    const matchesPatologia = selectedPatologia === '' || ex.tags_patologia.includes(selectedPatologia);
    return matchesSearch && matchesApparatus && matchesPatologia;
  });

  const allApparatus = Array.from(new Set(activeExercises.flatMap((e) => e.tags_aparelho)));
  const allPathologies = Array.from(new Set(activeExercises.flatMap((e) => e.tags_patologia)));
  const isTargetLoading = !!targetId && (isPrescriptionLoading || isPrescriptionExercisesLoading);
  const loadError = prescriptionError
    ? getErrorMessage(prescriptionError, 'Não foi possível carregar a prescrição.')
    : prescriptionExercisesError
      ? getErrorMessage(prescriptionExercisesError, 'Não foi possível carregar os exercícios da prescrição.')
      : exercisesError
        ? getErrorMessage(exercisesError, 'Não foi possível carregar o catálogo de exercícios.')
        : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-black text-neutral-850 dark:text-white bg-transparent border-b border-dashed border-neutral-300 dark:border-neutral-700 focus:border-[#0a5c4e] focus:outline-none py-0.5"
                placeholder="Nome do Treino"
              />
              <Edit className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-[10px] uppercase font-black text-neutral-400 tracking-wider mt-1">
              {isEditing ? "Modo Edição" : "Nova Prescrição"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-end">
          <button
            id="btn-salvar-prescricao"
            data-testid="btn-salvar-prescricao"
            onClick={handleSavePrescription}
            disabled={cart.length === 0 || authLoading || isTargetLoading || (!!targetId && !prescription) || createPrescriptionMutation.isPending || updatePrescriptionMutation.isPending}
            className="bg-[#0a5c4e] text-white hover:bg-[#07473c] dark:bg-[#52bfa6] dark:text-neutral-950 disabled:opacity-45 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            {createPrescriptionMutation.isPending || updatePrescriptionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[2.5px]" />
            )}
            <span>Salvar Prescrição</span>
          </button>
        </div>
      </div>

      {isTargetLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando os dados da prescrição...
        </div>
      )}
      {loadError && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Erro ao carregar: {loadError}</span>
        </div>
      )}
      {saveError && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}
      {targetId && !isTargetLoading && !loadError && !prescription && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Prescrição não encontrada para o ID informado.</span>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1.5">Início do Cronograma</label>
          <input
            type="date"
            value={dateInicio}
            onChange={(e) => setDateInicio(e.target.value)}
            className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border-none rounded-xl px-4 py-3 text-xs font-bold text-neutral-800 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1.5">Fim do Cronograma</label>
          <input
            type="date"
            value={dateFim}
            onChange={(e) => setDateFim(e.target.value)}
            className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border-none rounded-xl px-4 py-3 text-xs font-bold text-neutral-800 dark:text-white"
          />
        </div>
        <div className="sm:col-span-2 pt-2">
          <label className="text-xs font-bold text-neutral-400 block mb-3">Dias da Semana (Agenda)</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${
                  diasSemana.includes(day.value)
                    ? 'bg-[#0a5c4e] text-white border-[#0a5c4e] dark:bg-[#52bfa6] dark:text-neutral-950 dark:border-[#52bfa6]'
                    : 'bg-[#f4f7f6] text-neutral-400 border-transparent dark:bg-neutral-850 dark:text-neutral-50'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2 font-medium">
            O paciente verá este treino apenas nos dias selecionados acima.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Catálogo de Exercícios</h4>
            <div className="flex gap-1 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setActiveExTab('mine')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeExTab === 'mine' ? 'bg-white dark:bg-neutral-700 text-[#0a5c4e] dark:text-teal-400 shadow-sm' : 'text-neutral-500'}`}
              >
                Meus
              </button>
              <button
                onClick={() => setActiveExTab('global')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeExTab === 'global' ? 'bg-white dark:bg-neutral-700 text-[#0a5c4e] dark:text-teal-400 shadow-sm' : 'text-neutral-500'}`}
              >
                Biblioteca LF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative col-span-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchExTerm}
                onChange={(e) => setSearchExTerm(e.target.value)}
                className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border-none rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-800 dark:text-white font-medium"
              />
            </div>
            <select
              value={selectedApparatus}
              onChange={(e) => setSelectedApparatus(e.target.value)}
              className="bg-[#f4f7f6] dark:bg-neutral-850 border-none rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 focus:outline-none"
            >
              <option value="">Aparelho</option>
              {allApparatus.map((app) => <option key={app} value={app}>{app}</option>)}
            </select>
            <select
              value={selectedPatologia}
              onChange={(e) => setSelectedPatologia(e.target.value)}
              className="bg-[#f4f7f6] dark:bg-neutral-850 border-none rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 focus:outline-none"
            >
              <option value="">Patologia</option>
              {allPathologies.map((pat) => <option key={pat} value={pat}>{pat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCatalog.map((ex) => {
              const video = getVideoInfo(ex.midia_url);
              const isVideo = video.provider === 'youtube' || video.provider === 'vimeo';
              const thumbUrl = video.thumbnail || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600";
              const isAlreadyInCart = cart.some(item => item.exercise_id === ex.id);

              return (
                <div key={ex.id} className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isAlreadyInCart
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-[#fcfdfd] dark:bg-neutral-850 border-neutral-100 dark:border-neutral-800 hover:border-[#0a5c4e]/30'
                }`}>
                  <div>
                    <div className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden mb-3 relative group">
                      <img src={thumbUrl} className="w-full h-full object-cover" alt={ex.nome} referrerPolicy="no-referrer" />
                      {isVideo && (
                        <div className="absolute top-2 left-2 z-10 bg-black/40 backdrop-blur-md p-1 rounded-md text-white">
                          <Video size={12} />
                        </div>
                      )}
                      <button
                        onClick={() => !isAlreadyInCart && handleQuickAdd(ex)}
                        disabled={isAlreadyInCart}
                        className={`absolute right-2.5 bottom-2.5 w-8.5 h-8.5 rounded-full flex items-center justify-center shadow-lg transition-all ${
                          isAlreadyInCart
                            ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                            : 'bg-[#0a5c4e] text-white hover:scale-105 cursor-pointer'
                        }`}
                        title={isAlreadyInCart ? "Exercício já adicionado" : "Adicionar rápido"}
                      >
                        {isAlreadyInCart ? <Check className="w-4 h-4 stroke-[3px]" /> : <Plus className="w-4 h-4 stroke-[3px]" />}
                      </button>
                    </div>
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="text-xs font-extrabold text-neutral-800 dark:text-white leading-snug">{ex.nome}</h5>
                      {isAlreadyInCart && (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-1.5 py-0.5 rounded-md shrink-0">
                          Na lista
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100/50 dark:border-neutral-800/50 flex gap-2">
                    <button
                      onClick={() => !isAlreadyInCart && handleOpenConfig(ex)}
                      disabled={isAlreadyInCart}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        isAlreadyInCart
                          ? 'bg-neutral-150/60 dark:bg-neutral-800/40 text-neutral-400 cursor-not-allowed'
                          : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 cursor-pointer'
                      }`}
                    >
                      {isAlreadyInCart ? 'Adicionado' : 'Configurar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-fit min-h-[400px]">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">Resumo da Prescrição</h4>
            {cart.length === 0 ? (
              <div className="text-center py-20 text-neutral-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold">Carrinho Vazio</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {cart.map((item, index) => {
                  const info = allExercisesArr.find(e => e.id === item.exercise_id);
                  return (
                    <div key={index} className="p-3.5 bg-[#fcfdfd] dark:bg-neutral-850 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-black text-neutral-800 dark:text-white">{info?.nome}</p>
                        <button onClick={() => handleRemoveFromCart(index)} className="text-neutral-400 hover:text-red-500 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[8px] font-black text-neutral-400 uppercase">Séries</label>
                          <input type="number" value={item.series} onChange={e => handleUpdateCartItem(index, 'series', e.target.value)} className="w-full bg-[#f4f7f6] dark:bg-neutral-800 rounded-lg py-1 px-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-neutral-400 uppercase">Reps</label>
                          <input type="text" value={item.repeticoes} onChange={e => handleUpdateCartItem(index, 'repeticoes', e.target.value)} className="w-full bg-[#f4f7f6] dark:bg-neutral-800 rounded-lg py-1 px-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-neutral-400 uppercase">Descanso</label>
                          <input type="number" value={item.tempo_descanso} onChange={e => handleUpdateCartItem(index, 'tempo_descanso', e.target.value)} className="w-full bg-[#f4f7f6] dark:bg-neutral-800 rounded-lg py-1 px-2 text-xs font-bold outline-none" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
              <button
                onClick={handleSavePrescription}
                disabled={authLoading || isTargetLoading || (!!targetId && !prescription) || createPrescriptionMutation.isPending || updatePrescriptionMutation.isPending}
                className="w-full bg-[#0a5c4e] text-white py-3.5 rounded-2xl text-xs font-black cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-45"
              >
                Confirmar e Salvar Plano
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} title="Parâmetros">
        <form onSubmit={handleAddToCart} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 block">Séries</label>
              <input type="number" value={exConfig.series} onChange={e => setExConfig({...exConfig, series: Number(e.target.value)})} className="w-full bg-[#f4f7f6] dark:bg-neutral-800 rounded-xl p-3 text-xs font-bold outline-none" placeholder="Ex: 3" />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 block">Repetições</label>
              <input type="text" value={exConfig.repeticoes} onChange={e => setExConfig({...exConfig, repeticoes: e.target.value})} className="w-full bg-[#f4f7f6] dark:bg-neutral-800 rounded-xl p-3 text-xs font-bold outline-none" placeholder="Ex: 12 ou Isom." />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#0a5c4e] text-white py-3.5 rounded-xl font-black text-xs uppercase cursor-pointer">Adicionar ao Plano</button>
        </form>
      </Modal>
    </div>
  );
}