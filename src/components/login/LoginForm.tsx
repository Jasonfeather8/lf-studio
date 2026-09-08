import React, { useState } from 'react';
import { User, Lock, ArrowRight, Activity, BadgeCent } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { mockProfiles } from '../../mocks/users';

interface Props {
  setView: (view: 'login' | 'register-patient' | 'register-physio') => void;
}

export default function LoginForm({ setView }: Props) {
  const { setCurrentUser } = useUIStore();
  const navigate = useNavigate();
  const setRoute = (r: string) => navigate(`/${r}`);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError('');
    setTimeout(() => {
      setLoginLoading(false);
      profileService.getAll().then((profiles) => {
        const cleanedCpf = email.trim();
        const found = profiles.find(
          p => p.documento_cpf === cleanedCpf || p.nome_completo.toLowerCase().includes(cleanedCpf.toLowerCase())
        );
        if (found) {
          setCurrentUser(found);
          setRoute(found.role === 'patient' ? 'rotina' : 'dashboard');
        } else {
          const defaultUser = mockProfiles.find(p => p.role === 'physio') || mockProfiles[0];
          setCurrentUser(defaultUser);
          setRoute(defaultUser.role === 'patient' ? 'rotina' : 'dashboard');
        }
      });
    }, 600);
  };

  const handlePatientBypass = () => {
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      const patientProfile = mockProfiles.find(p => p.id === 'patient-ricardo') || mockProfiles[1];
      setCurrentUser(patientProfile);
      setRoute('rotina');
    }, 500);
  };

  return (
    <main className="w-full max-w-md bg-surface-container-lowest dark:bg-neutral-900 rounded-3xl shadow-xl border border-surface-container-high dark:border-neutral-800 p-8 sm:p-10 my-auto flex flex-col">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-16 h-16 mb-4 flex items-center justify-center bg-emerald-50 dark:bg-neutral-800 rounded-2xl p-2.5 border border-emerald-100 dark:border-neutral-750">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-full h-full text-primary dark:text-primary-fixed-dim"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20,50 Q35,15 60,35 T80,75" strokeWidth="8" />
            <path d="M40,40 Q55,60 70,55" strokeWidth="6" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-primary dark:text-primary-fixed-dim tracking-tight text-center">
          LF Studio
        </h1>
        <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-2 text-center leading-relaxed font-medium">
          Acesse seu painel clínico ou sua rotina de exercícios.
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface dark:text-neutral-300" htmlFor="email">
            Nome ou CPF
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline dark:text-neutral-500">
              <User className="w-4 h-4" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-3 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white placeholder:text-outline-variant dark:placeholder:text-neutral-600 transition-colors focus:outline-none"
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nome ou CPF"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface dark:text-neutral-300" htmlFor="password">
            Senha de Acesso
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline dark:text-neutral-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-3 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white placeholder:text-outline-variant dark:placeholder:text-neutral-600 transition-colors focus:outline-none"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha cadastrada"
              required
            />
          </div>
        </div>
        {loginError && <p className="text-xs text-error font-medium">{loginError}</p>}
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs mt-2"
        >
          <span>{loginLoading ? 'Conectando...' : 'Entrar'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-surface-container dark:border-neutral-800"></div>
        <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-outline dark:text-neutral-500 uppercase tracking-widest">
          Acesso Rápido
        </span>
        <div className="flex-grow border-t border-surface-container dark:border-neutral-800"></div>
      </div>
      <div className="space-y-3 flex flex-col items-center">
        <button
          onClick={() => {
            setView('register-patient');
          }}
          className="text-xs font-bold text-on-surface dark:text-neutral-300 hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-none"
        >
          <Activity className="w-4 h-4 text-primary" />
          Sou Paciente - Primeiro Acesso
        </button>
        <button
          onClick={() => {
            setView('register-physio');
          }}
          className="text-xs font-bold text-on-surface dark:text-neutral-300 hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-none"
        >
          <BadgeCent className="w-4 h-4 text-primary" />
          Sou Profissional - Criar Conta
        </button>
        <button
          onClick={handlePatientBypass}
          className="text-[10px] font-semibold text-outline hover:underline cursor-pointer"
        >
          (Bypass para Paciente de Teste)
        </button>
      </div>
    </main>
  );
}
