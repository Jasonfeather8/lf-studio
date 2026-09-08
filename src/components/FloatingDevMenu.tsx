import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/uiStore';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GripVertical,
  Cpu,
  Layers,
  Database,
  AlertTriangle,
  X,
  RotateCcw,
  Trash2,
  UserPlus,
  FolderUp,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  WifiOff,
  UserCheck,
  Calendar,
  Users,
  Dumbbell,
  Palette,
  Eye,
  Lock
} from 'lucide-react';
import { mockProfiles } from '../mocks/users';

export default function FloatingDevMenu() {
  const queryClient = useQueryClient();
  const {
    currentUser,
    setCurrentUser,
    activePatientId,
    setActivePatientId,
    theme,
    toggleTheme
  } = useUIStore();
  
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = location.pathname.substring(1) || 'dashboard';

  const setRoute = (route: string) => {
    navigate(`/${route}`);
  };

  // Position of the floating trigger
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'navigation' | 'mocks' | 'errors'>('navigation');

  // Simulated error states
  const [simulatedError, setSimulatedError] = useState<'disconnect' | 'api_error' | 'limit_reached' | null>(null);

  // Initialize position to bottom right once on client
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 180,
      y: window.innerHeight - 85,
    });
  }, []);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition({
        x: window.innerWidth - 180,
        y: window.innerHeight - 85,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag logic
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!position) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !position) return;
    const nextX = Math.max(10, Math.min(window.innerWidth - 150, e.clientX - dragOffset.current.x));
    const nextY = Math.max(10, Math.min(window.innerHeight - 70, e.clientY - dragOffset.current.y));
    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Helper: Switch Role & User
  const handleSwitchUser = (profileId: string) => {
    const targetProfile = mockProfiles.find(p => p.id === profileId);
    if (targetProfile) {
      setCurrentUser(targetProfile);
      setRoute('dashboard');
      setActivePatientId(null);
      queryClient.invalidateQueries();
    }
  };

  // Helper: Reset Database to Default
  const handleResetDatabase = () => {
    localStorage.removeItem('lf_profiles');
    localStorage.removeItem('lf_patients');
    localStorage.removeItem('lf_exercises');
    localStorage.removeItem('lf_prescriptions');
    localStorage.removeItem('lf_prescription_exercises');
    localStorage.removeItem('lf_exams');
    localStorage.removeItem('lf_adherence');
    window.location.reload();
  };

  // Helper: Clear Database Entirely (Empty State testing)
  const handleClearDatabase = () => {
    localStorage.setItem('lf_profiles', JSON.stringify([]));
    localStorage.setItem('lf_patients', JSON.stringify([]));
    localStorage.setItem('lf_exercises', JSON.stringify([]));
    localStorage.setItem('lf_prescriptions', JSON.stringify([]));
    localStorage.setItem('lf_prescription_exercises', JSON.stringify([]));
    localStorage.setItem('lf_exams', JSON.stringify([]));
    localStorage.setItem('lf_adherence', JSON.stringify([]));
    queryClient.invalidateQueries();
    window.location.reload();
  };

  // Helper: Inject mock patient
  const handleInjectPatient = () => {
    const stored = localStorage.getItem('lf_patients');
    const patients = stored ? JSON.parse(stored) : [];
    
    const newId = `pat-temp-${Date.now()}`;
    const newProfileId = `profile-temp-${Date.now()}`;

    // Add mock user profile
    const profilesStored = localStorage.getItem('lf_profiles');
    const profiles = profilesStored ? JSON.parse(profilesStored) : [];
    profiles.push({
      id: newProfileId,
      role: 'patient',
      nome_completo: `Ana Carolina Costa (${patients.length + 1})`,
      documento_cpf: `999.888.777-${patients.length}`,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      telefone: '(11) 95555-4444',
      created_at: new Date().toISOString()
    });
    localStorage.setItem('lf_profiles', JSON.stringify(profiles));

    // Add patient profile
    patients.push({
      id: newId,
      profile_id: newProfileId,
      physio_id: 'physio-123',
      patologia_principal: 'Tendinite de Aquiles Bilateral',
      observacoes_clinicas: 'Paciente relata dores agudas ao iniciar corrida. Iniciar reabilitação com foco em força excêntrica de tríceps sural.',
      status: 'ativo'
    });
    localStorage.setItem('lf_patients', JSON.stringify(patients));

    queryClient.invalidateQueries();
  };

  // Helper: Simulate Completed Workout Session
  const handleSimulateWorkoutCompletion = () => {
    const stored = localStorage.getItem('lf_adherence');
    const list = stored ? JSON.parse(stored) : [];
    
    // Default target active patient or ricardo
    const targetPatId = activePatientId || 'pat-ricardo';

    list.push({
      id: `adh-temp-${Date.now()}`,
      prescription_exercise_id: 'pre-exe-1',
      patient_id: targetPatId,
      data_execucao: new Date().toISOString(),
      status_sincronizacao: true
    });
    
    localStorage.setItem('lf_adherence', JSON.stringify(list));
    queryClient.invalidateQueries();
  };

  // Helper: Simulate Exam Upload
  const handleSimulateExamUpload = () => {
    const stored = localStorage.getItem('lf_exams');
    const list = stored ? JSON.parse(stored) : [];
    const targetPatId = activePatientId || 'pat-ricardo';

    list.push({
      id: `exam-temp-${Date.now()}`,
      patient_id: targetPatId,
      titulo: `Exame_Ressonancia_Ombro_${Date.now().toString().slice(-4)}.pdf`,
      arquivo_url: '#',
      data_upload: new Date().toISOString(),
      status_sincronizacao: true
    });

    localStorage.setItem('lf_exams', JSON.stringify(list));
    queryClient.invalidateQueries();
  };

  return (
    <>
      {/* 1. FLOATING DEV MENU TRIGGER BUTTON */}
      {position && (
        <div
          style={{
            left: position.x,
            top: position.y,
            position: 'fixed',
            zIndex: 9999
          }}
          className="flex items-center bg-neutral-900/90 dark:bg-neutral-950/95 backdrop-blur-md rounded-full px-3.5 py-2 border border-amber-500/30 dark:border-amber-400/20 shadow-[0_4px_20px_rgba(245,158,11,0.15)] select-none text-white transition-shadow duration-300 hover:shadow-[0_4px_25px_rgba(245,158,11,0.3)]"
        >
          {/* Draggable handle */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="cursor-move pr-2.5 text-neutral-500 hover:text-amber-400 active:text-amber-500 transition-colors py-1 touch-none flex items-center"
            title="Arraste para mover o menu"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Clickable developer trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-[#0a5c4e] hover:bg-[#07463b] text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>DEV MENU</span>
          </button>
        </div>
      )}

      {/* 2. SLIDE PANELS CONTROLLERS */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9998] flex justify-end p-4 pointer-events-none select-none">
            {/* Dark dismiss overlay click frame */}
            <div
              className="absolute inset-0 bg-neutral-950/20 backdrop-blur-xs pointer-events-auto"
              onClick={() => setIsOpen(false)}
            />

            {/* Main elegant dark sliding panel */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-neutral-950/98 dark:bg-black/98 text-white rounded-3xl border border-neutral-800 shadow-2xl p-6 flex flex-col justify-between max-h-[85vh] my-auto mr-1 pb-6 overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center border border-amber-500/20">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-wider uppercase text-amber-500">LF STUDIO</h3>
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Painel de Protótipo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs bar selector */}
                <div className="flex bg-neutral-900 p-1 rounded-xl mb-5 gap-1 border border-neutral-800/40">
                  <button
                    onClick={() => setActiveTab('navigation')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeTab === 'navigation'
                        ? 'bg-neutral-800 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Navegação
                  </button>
                  <button
                    onClick={() => setActiveTab('mocks')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeTab === 'mocks'
                        ? 'bg-neutral-800 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Atalhos / Mocks
                  </button>
                  <button
                    onClick={() => setActiveTab('errors')}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeTab === 'errors'
                        ? 'bg-neutral-800 text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Erros
                  </button>
                </div>

                {/* TAB CONTENT SCROLL AREA */}
                <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1.5 select-text">
                  
                  {/* TAB 1: NAVIGATION */}
                  {activeTab === 'navigation' && (
                    <div className="space-y-5">
                      {/* Sub-section: Principal roles */}
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                          ALTERAR USUÁRIO / ATRIBUÇÃO (PERFIL ATIVO)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            onClick={() => handleSwitchUser('physio-123')}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              currentUser?.role === 'physio'
                                ? 'bg-[#0a5c4e]/25 border-[#0a5c4e] text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 hover:border-neutral-800 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-700 shrink-0">
                                <img src={mockProfiles[0].avatar_url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-black">Dr. Silva (Fisioterapeuta)</span>
                            </div>
                            <UserCheck className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          </button>

                          <button
                            onClick={() => handleSwitchUser('patient-ricardo')}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              currentUser?.id === 'patient-ricardo'
                                ? 'bg-amber-500/15 border-amber-500/60 text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 hover:border-neutral-800 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-700 shrink-0">
                                <img src={mockProfiles[1].avatar_url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-black">Ricardo Oliveira (Paciente)</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          </button>

                          <button
                            onClick={() => handleSwitchUser('patient-beatriz')}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              currentUser?.id === 'patient-beatriz'
                                ? 'bg-amber-500/15 border-amber-500/60 text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 hover:border-neutral-800 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-700 shrink-0">
                                <img src={mockProfiles[2].avatar_url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-black">Beatriz Santos (Paciente)</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          </button>
                        </div>
                      </div>

                      {/* Sub-section: Internal views */}
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                          ATALHOS DE TELAS / ROTAS DO APP
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setRoute('dashboard');
                              setActivePatientId(null);
                            }}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentRoute === 'dashboard'
                                ? 'bg-[#0a5c4e]/10 border-[#0a5c4e]/30 text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px]">Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setRoute('patients');
                              setActivePatientId(null);
                            }}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentRoute === 'patients' && !activePatientId
                                ? 'bg-[#0a5c4e]/10 border-[#0a5c4e]/30 text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px]">Lista Pacientes</span>
                          </button>

                          <button
                            onClick={() => {
                              setRoute('exercises');
                            }}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentRoute === 'exercises'
                                ? 'bg-[#0a5c4e]/10 border-[#0a5c4e]/30 text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px]">Exercícios</span>
                          </button>

                          <button
                            onClick={() => {
                              setRoute('login');
                              setCurrentUser(null);
                            }}
                            className="p-2.5 rounded-xl text-left border border-transparent bg-neutral-900/60 hover:bg-neutral-900 text-neutral-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px]">Tela de Login</span>
                          </button>
                        </div>
                      </div>

                      {/* Sub-section: Nested details */}
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                          VER PRONTUÁRIOS DE PACIENTES DIRETAMENTE
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            onClick={() => {
                              setRoute('patients');
                              setActivePatientId('pat-ricardo');
                              // If current user is patient, also switch user to physio to ensure details render correctly
                              if (currentUser?.role === 'patient') {
                                setCurrentUser(mockProfiles[0]);
                              }
                              queryClient.invalidateQueries();
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              activePatientId === 'pat-ricardo'
                                ? 'bg-[#0a5c4e]/15 border-[#0a5c4e] text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 text-neutral-300'
                            }`}
                          >
                            <span className="text-[10px]">Ricardo Oliveira (Pós-Op. Ombro)</span>
                            <Eye className="w-3 h-3 text-neutral-500" />
                          </button>

                          <button
                            onClick={() => {
                              setRoute('patients');
                              setActivePatientId('pat-beatriz');
                              if (currentUser?.role === 'patient') {
                                setCurrentUser(mockProfiles[0]);
                              }
                              queryClient.invalidateQueries();
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              activePatientId === 'pat-beatriz'
                                ? 'bg-[#0a5c4e]/15 border-[#0a5c4e] text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 text-neutral-300'
                            }`}
                          >
                            <span className="text-[10px]">Beatriz Santos (Estabilização Lombar)</span>
                            <Eye className="w-3 h-3 text-neutral-500" />
                          </button>

                          <button
                            onClick={() => {
                              setRoute('patients');
                              setActivePatientId('pat-helena');
                              if (currentUser?.role === 'patient') {
                                setCurrentUser(mockProfiles[0]);
                              }
                              queryClient.invalidateQueries();
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              activePatientId === 'pat-helena'
                                ? 'bg-[#0a5c4e]/15 border-[#0a5c4e] text-white'
                                : 'bg-neutral-900/60 border-transparent hover:bg-neutral-900 text-neutral-300'
                            }`}
                          >
                            <span className="text-[10px]">Helena Ferreira (Artrose Joelho)</span>
                            <Eye className="w-3 h-3 text-neutral-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MOCKS / SHORCUTS */}
                  {activeTab === 'mocks' && (
                    <div className="space-y-4">
                      {/* Injections */}
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-2.5">
                          INJETAR / ALTERAR DADOS NO ESTADO LOCAL
                        </span>

                        <div className="space-y-2">
                          <button
                            onClick={handleInjectPatient}
                            className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/80 text-white transition-all text-left border border-neutral-800/60 cursor-pointer active:scale-[0.99]"
                          >
                            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black">Simular Aluno/Paciente Novo</p>
                              <p className="text-[9px] font-bold text-neutral-500">Injeta perfil de "Ana Carolina Costa" na lista</p>
                            </div>
                          </button>

                          <button
                            onClick={handleSimulateWorkoutCompletion}
                            className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/80 text-white transition-all text-left border border-neutral-800/60 cursor-pointer active:scale-[0.99]"
                          >
                            <div className="p-1.5 bg-green-500/10 text-green-400 rounded-lg shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black">Registrar Treino Realizado</p>
                              <p className="text-[9px] font-bold text-neutral-500">Simula que o paciente concluiu o treino do dia</p>
                            </div>
                          </button>

                          <button
                            onClick={handleSimulateExamUpload}
                            className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/80 text-white transition-all text-left border border-neutral-800/60 cursor-pointer active:scale-[0.99]"
                          >
                            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                              <FolderUp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black">Simular Envio de Exame (Laudo)</p>
                              <p className="text-[9px] font-bold text-neutral-500">Adiciona arquivo PDF de ressonância no prontuário</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* State management */}
                      <div className="pt-2 border-t border-neutral-800/50">
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-2.5">
                          MANUTENÇÃO DO BANCO LOCAL
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleResetDatabase}
                            className="flex items-center justify-center gap-1.5 p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 rounded-xl text-[10px] text-neutral-300 font-bold tracking-tight transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Resetar Mock</span>
                          </button>

                          <button
                            onClick={handleClearDatabase}
                            className="flex items-center justify-center gap-1.5 p-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-xl text-[10px] text-red-300 font-bold tracking-tight transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Esvaziar Banco</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SIMULATE ERRORS */}
                  {activeTab === 'errors' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                          SIMULAR FALHAS E RESILIÊNCIA VISUAL
                        </span>
                        <p className="text-[9px] font-semibold text-neutral-500 leading-normal mb-3">
                          Ative cenários de exceções técnicas para verificar como os layouts respondem a erros inesperados e paywalls.
                        </p>

                        <div className="space-y-2">
                          <button
                            onClick={() => setSimulatedError(simulatedError === 'disconnect' ? null : 'disconnect')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              simulatedError === 'disconnect'
                                ? 'bg-amber-500/10 border-amber-500/70 text-white'
                                : 'bg-neutral-900 hover:bg-neutral-800 border-transparent text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <WifiOff className={`w-4 h-4 ${simulatedError === 'disconnect' ? 'text-amber-500 animate-bounce' : 'text-neutral-500'}`} />
                              <div>
                                <p className="text-[11px] font-black">Cenário 1: Sem Conexão (Offline)</p>
                                <p className="text-[9px] font-bold text-neutral-500">Gera banner de aviso no topo da tela</p>
                              </div>
                            </div>
                            <span className={`w-1.5 h-1.5 rounded-full ${simulatedError === 'disconnect' ? 'bg-amber-500 animate-ping' : 'bg-neutral-700'}`} />
                          </button>

                          <button
                            onClick={() => setSimulatedError(simulatedError === 'api_error' ? null : 'api_error')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              simulatedError === 'api_error'
                                ? 'bg-red-500/10 border-red-500/70 text-white'
                                : 'bg-neutral-900 hover:bg-neutral-800 border-transparent text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <AlertTriangle className={`w-4 h-4 ${simulatedError === 'api_error' ? 'text-red-500' : 'text-neutral-500'}`} />
                              <div>
                                <p className="text-[11px] font-black">Cenário 2: Erro de API (Internal 500)</p>
                                <p className="text-[9px] font-bold text-neutral-500">Adiciona Toast flutuante de falha no servidor</p>
                              </div>
                            </div>
                            <span className={`w-1.5 h-1.5 rounded-full ${simulatedError === 'api_error' ? 'bg-red-500 animate-ping' : 'bg-neutral-700'}`} />
                          </button>

                          <button
                            onClick={() => setSimulatedError(simulatedError === 'limit_reached' ? null : 'limit_reached')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              simulatedError === 'limit_reached'
                                ? 'bg-[#b3261e]/10 border-[#b3261e]/70 text-white'
                                : 'bg-neutral-900 hover:bg-neutral-800 border-transparent text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Lock className={`w-4 h-4 ${simulatedError === 'limit_reached' ? 'text-amber-400' : 'text-neutral-500'}`} />
                              <div>
                                <p className="text-[11px] font-black">Cenário 3: Limite de Plano Atingido</p>
                                <p className="text-[9px] font-bold text-neutral-500">Exibe paywall modal elegante de upgrade</p>
                              </div>
                            </div>
                            <span className={`w-1.5 h-1.5 rounded-full ${simulatedError === 'limit_reached' ? 'bg-amber-400 animate-ping' : 'bg-neutral-700'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Panel Footer */}
              <div className="pt-4 border-t border-neutral-800/80 mt-5 flex items-center justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span>MODO LOCAL (STORAGE)</span>
                </div>
                <span>v1.2.0-beta</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. SIMULATED ERROR OVERLAYS (Entirely self-contained!) */}
      <AnimatePresence>
        {/* Scenario 1: DISCONNECT / OFFLINE MODE */}
        {simulatedError === 'disconnect' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[10000] bg-amber-500 text-neutral-950 font-black text-[11px] py-3 px-6 shadow-xl flex items-center justify-between select-none"
          >
            <div className="flex items-center gap-2 max-w-lg mx-auto">
              <WifiOff className="w-4 h-4 stroke-[2.5px] animate-pulse shrink-0" />
              <span>
                MODO OFFLINE ATIVO — Sem conexão detectada. As alterações feitas agora serão mantidas localmente e sincronizadas assim que a conexão retornar.
              </span>
            </div>
            <button
              onClick={() => setSimulatedError(null)}
              className="text-[10px] font-black bg-neutral-950 text-white px-3 py-1 rounded-lg uppercase hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            >
              Desativar
            </button>
          </motion.div>
        )}

        {/* Scenario 2: API 500 INTERNAL SERVER ERROR */}
        {simulatedError === 'api_error' && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-[10000] w-80 bg-neutral-900/95 dark:bg-neutral-950/98 text-white rounded-2xl border-l-4 border-l-red-500 border-y border-r border-neutral-800 p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5 select-text">
                <p className="text-xs font-black text-red-400">Erro do Servidor (Simulado)</p>
                <p className="text-[10px] font-semibold text-neutral-400 leading-normal">
                  Erro 500: O endpoint <code className="font-mono bg-neutral-950 text-neutral-300 px-1 py-0.5 rounded text-[9px]">/api/v1/patients/sync</code> reportou falha interna inesperada do banco de dados.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setSimulatedError(null)}
                className="px-3 py-1.5 text-[9px] font-black uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Ignorar
              </button>
              <button
                onClick={() => {
                  setSimulatedError(null);
                  setTimeout(() => setSimulatedError('api_error'), 100);
                }}
                className="px-3 py-1.5 text-[9px] font-black bg-red-600 hover:bg-red-700 text-white rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                Tentar Sincronia
              </button>
            </div>
          </motion.div>
        )}

        {/* Scenario 3: PLAN LIMIT REACHED PAYWALL MODAL */}
        {simulatedError === 'limit_reached' && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-neutral-900/98 border border-amber-500/20 text-white rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] p-8 overflow-hidden text-center"
            >
              {/* Premium shining gold badge */}
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 shrink-0 shadow-lg shadow-amber-500/5">
                <Sparkles className="w-8 h-8 stroke-[1.8px] animate-pulse" />
              </div>

              {/* Title Content */}
              <h3 className="text-base font-black tracking-tight text-neutral-100 leading-snug">
                Limite do Plano Bronze Atingido
              </h3>
              <p className="text-[11px] font-bold text-amber-500/90 mt-1 uppercase tracking-wider">
                Excedeu 3 Pacientes Cadastrados
              </p>

              <p className="text-[11px] font-semibold text-neutral-400 mt-3.5 leading-relaxed max-w-xs mx-auto">
                Seu plano de avaliação atingiu o limite de armazenamento em nuvem. Faça o upgrade agora para cadastrar pacientes ilimitados, usar os Protocolos de Exercícios Inteligentes e exportar laudos em PDF com IA.
              </p>

              {/* Premium upgrade card details */}
              <div className="my-6 bg-neutral-950/40 border border-neutral-800 p-3 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">PLANO RECOMENDADO</p>
                  <p className="text-[11px] font-black text-white">LF Studio Premium Pro</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-black text-amber-500">R$ 89,90<span className="text-[9px] text-neutral-500 font-bold">/mês</span></p>
                </div>
              </div>

              {/* Action row */}
              <div className="space-y-2.5">
                <button
                  onClick={() => alert('Parabéns! Você simulou a compra com sucesso. O LF Studio agradece!')}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4 stroke-[2.5px]" />
                  <span>Fazer Upgrade para Premium</span>
                </button>
                <button
                  onClick={() => setSimulatedError(null)}
                  className="w-full py-3 text-[10px] font-black text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer block"
                >
                  Fechar Simulação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
