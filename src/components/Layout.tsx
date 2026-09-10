import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../store/uiStore';
import ThemeToggle from './ThemeToggle';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from './SplashScreen';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Settings,
  TrendingUp,
  LogOut,
  Search,
  Calendar,
  FileText,
  User,
  Menu,
  ChevronLeft,
  Smartphone,
  ShieldCheck,
  Globe
 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const {
    searchPatientQuery,
    setSearchPatientQuery,
  } = useUIStore();
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentRoute = location.pathname.substring(1) || 'dashboard';
  
  const setRoute = (route: string) => {
    navigate(`/${route}`);
  };

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Splash Screen timer for mobile/patients
  useEffect(() => {
    if (role === 'client') {
      const timer = setTimeout(() => setShowSplash(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [role]);

  // 1. MOBILE RESPONSIVE LAYOUT FOR PATIENTS (CLIENT ROLE)
  if (role === 'client') {
    return (
      <>
        <AnimatePresence>
          {showSplash && <SplashScreen />}
        </AnimatePresence>
        
        <div className="min-h-screen bg-dots bg-slate-50 dark:bg-neutral-950 text-on-surface dark:text-neutral-100 flex flex-col transition-colors duration-300 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-50 dark:from-teal-900/20 to-transparent z-0"></div>
          
          <main className="flex-1 overflow-y-auto no-scrollbar transition-colors">
            <div className="max-w-md mx-auto w-full h-full pb-32 pt-16 relative z-10">{children}</div>
          </main>

          <div className="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto">
            <nav className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border border-white/50 dark:border-neutral-800/50 rounded-3xl p-2 flex justify-between items-center shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-none">
              <button
                onClick={() => setRoute('rotina')}
                className={`flex flex-col items-center justify-center w-1/3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  currentRoute === 'rotina'
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 shadow-inner'
                    : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                }`}
              >
                <Calendar className={`w-[22px] h-[22px] mb-1 ${currentRoute === 'rotina' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className={`text-[10px] tracking-wide ${currentRoute === 'rotina' ? 'font-bold' : 'font-medium'}`}>Rotina</span>
              </button>
              <button
                onClick={() => setRoute('prontuario')}
                className={`flex flex-col items-center justify-center w-1/3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  currentRoute === 'prontuario'
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 shadow-inner'
                    : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                }`}
              >
                <FileText className={`w-[22px] h-[22px] mb-1 ${currentRoute === 'prontuario' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className={`text-[10px] tracking-wide ${currentRoute === 'prontuario' ? 'font-bold' : 'font-medium'}`}>Prontuário</span>
              </button>
              <button
                onClick={() => setIsProfileSheetOpen(true)}
                className={`flex flex-col items-center justify-center w-1/3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  currentRoute === 'perfil'
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 shadow-inner'
                    : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                }`}
              >
                <User className={`w-[22px] h-[22px] mb-1 ${currentRoute === 'perfil' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className={`text-[10px] tracking-wide ${currentRoute === 'perfil' ? 'font-bold' : 'font-medium'}`}>Perfil</span>
              </button>
            </nav>
          </div>
        
          <AnimatePresence>
            {isProfileSheetOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsProfileSheetOpen(false)}
                  className="fixed inset-0 bg-neutral-950/60 z-[100] backdrop-blur-xs"
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-neutral-900 border-t border-neutral-150 dark:border-neutral-800 rounded-t-[32px] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-[101] overflow-hidden pb-10"
                >
                  <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-6" />
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsProfileSheetOpen(false);
                        setRoute('perfil');
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-500">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">Minha Conta</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Edite seus dados pessoais e preferências</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsProfileSheetOpen(false);
                        setRoute('evolucao');
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-500">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">Minha Evolução</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Acompanhe seu progresso e métricas</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileSheetOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                        <LogOut className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">Sair do Aplicativo</h4>
                        <p className="text-xs opacity-80">Encerrar sua sessão atual com segurança</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }

  // 2. DESKTOP SIDEBAR LAYOUT FOR PROFESSIONALS (ADMIN / SUPER ADMIN)

  const adminGroups = [
    {
      title: 'Gestão Admin',
      roles: ['super_admin'],
      items: [
        { id: 'admin', label: 'Profissionais', icon: ShieldCheck, route: 'admin' as const },
        { id: 'admin/exercises', label: 'Bibl. Global', icon: Globe, route: 'admin/exercises' as const },
      ]
    },
    {
      title: 'Profissional',
      roles: ['admin', 'super_admin'],
      items: [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, route: 'dashboard' as const },
        { id: 'patients', label: 'Pacientes', icon: Users, route: 'patients' as const },
        { id: 'exercises', label: 'Exercícios', icon: Dumbbell, route: 'exercises' as const },
        { id: 'settings', label: 'Configurações', icon: Settings, route: 'settings' as const },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-950 text-on-surface dark:text-neutral-100 flex transition-colors duration-300">
      {/* Test Suite hidden from UI but kept in codebase as requested */}
      {/* {(role === 'admin' || role === 'super_admin') && <FlowTestSuite />} */}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-surface-container-lowest dark:bg-neutral-900 border-r border-surface-container-high dark:border-neutral-800 flex flex-col py-6 z-40 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          ${isSidebarExpanded ? 'w-64' : 'w-20'}
        `}
      >
        <div className={`px-6 mb-8 flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} cursor-pointer`} onClick={() => setRoute('dashboard')}>
          {isSidebarExpanded ? (
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-black text-primary dark:text-primary-fixed-dim tracking-tight leading-tight">
                  LF Studio
                </h1>
                <p className="text-[10px] text-on-surface-variant dark:text-neutral-400 font-bold uppercase tracking-wider">
                  {role === 'super_admin' ? 'Super Admin' : 'Profissional'}
                </p>
              </div>
            </div>
          ) : (
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-6 px-3 overflow-y-auto overflow-x-hidden">
          {adminGroups.map((group, gIdx) => {
            // Check if user has permission for this group
            if (role && !group.roles.includes(role)) return null;

            return (
              <div key={gIdx} className="space-y-1.5">
                {/* Section Separator Label (Only for super_admin) */}
                {role === 'super_admin' && isSidebarExpanded && (
                  <p className="px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2 opacity-70">
                    {group.title}
                  </p>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setRoute(item.route);
                        if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'text-primary dark:text-primary-fixed bg-surface-container-low dark:bg-neutral-800 border-l-4 border-primary dark:border-primary-fixed'
                          : 'text-on-surface-variant dark:text-neutral-400 hover:bg-surface-container-low dark:hover:bg-neutral-800/50 border-l-4 border-transparent'
                      } ${isSidebarExpanded ? 'px-4' : 'justify-center px-0'}`}
                      title={!isSidebarExpanded ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary dark:text-primary-fixed' : ''}`} />
                      {isSidebarExpanded && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 px-3 pt-4 border-t border-surface-container dark:border-neutral-800">
          <button
            onClick={signOut}
            className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer ${isSidebarExpanded ? 'px-4' : 'justify-center px-0'}`}
            title={!isSidebarExpanded ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarExpanded && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-20'}`}>
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 shadow-xs flex justify-between items-center px-4 lg:px-10 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
            >
               <Menu className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
              className="hidden lg:flex p-2 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
            >
               <Menu className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-primary dark:text-primary-fixed-dim capitalize hidden sm:block">
               Painel de Controle
            </h2>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-neutral-500" />
              <input
                type="text"
                value={searchPatientQuery}
                onChange={(e) => setSearchPatientQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-input-bg dark:bg-neutral-800 border-none rounded-full pl-9 pr-4 py-1.5 text-sm w-48 lg:w-60 focus:ring-1 focus:ring-primary dark:focus:ring-primary-fixed focus:outline-none transition-all dark:text-white"
              />
            </div>

            <ThemeToggle />

            <div className="flex items-center gap-3 border-l pl-3 lg:pl-6 border-surface-container-high dark:border-neutral-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface dark:text-white">
                  {user?.user_metadata?.nome_completo || user?.email || 'Usuário'}
                </p>
                <p className="text-[10px] font-semibold text-on-surface-variant dark:text-neutral-400">
                  {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex shrink-0 items-center justify-center overflow-hidden border-2 border-primary-container dark:border-primary-fixed-dim">
                <img
                  className="w-full h-full object-cover"
                  src={
                    user?.user_metadata?.avatar_url ||
                    'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.nome_completo || user?.email || 'U')
                  }
                  alt="Perfil"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-dots bg-[#f8fafc] dark:bg-neutral-950 p-4 lg:p-10 transition-colors">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}