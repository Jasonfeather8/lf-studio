import React, { useState } from 'react';
import { User, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { patientService } from '../../services/patientService';

interface Props {
  setView: (view: 'login' | 'register-patient' | 'register-physio') => void;
}

export default function RegisterPatientForm({ setView }: Props) {
  const { setCurrentUser } = useUIStore();
  const navigate = useNavigate();
  const setRoute = (r: string) => navigate(`/${r}`);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [patologia, setPatologia] = useState('Pós-Operatório Ombro (Manguito Rotador)');
  const [obs, setObs] = useState('');

  const handleCpfChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    setCpf(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setTelefone(formatted);
  };

  const handleRegisterPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (senha !== confirmaSenha) { setRegError('As senhas não coincidem.'); return; }
    if (cpf.length < 14) { setRegError('CPF inválido.'); return; }
    if (telefone.length < 14) { setRegError('Telefone inválido.'); return; }
    setRegLoading(true);
    try {
      const profileId = `patient-${Math.random().toString(36).substring(2, 11)}`;
      const createdProfile = await profileService.create({
        id: profileId, role: 'patient', nome_completo: nome, documento_cpf: cpf,
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        telefone: telefone,
      });
      await patientService.create({
        profile_id: profileId,
        physio_id: 'physio-1', // Default physio assignment
        patologia_principal: patologia,
        observacoes_clinicas: obs || 'Primeiro acesso',
        status: 'ativo',
      });
      setSuccessMsg('Conta criada com sucesso! Carregando sua rotina...');
      setTimeout(() => {
        setCurrentUser(createdProfile);
        setRoute(createdProfile.role === 'patient' ? 'rotina' : 'dashboard');
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || 'Erro ao registrar paciente.'); setRegLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md bg-surface-container-lowest dark:bg-neutral-900 rounded-3xl shadow-xl border border-surface-container-high dark:border-neutral-800 p-8 sm:p-10 my-auto flex flex-col">
      <button
        onClick={() => setView('login')}
        className="flex items-center gap-1 text-xs font-bold text-outline hover:text-primary mb-6 self-start cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Login</span>
      </button>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-primary dark:text-primary-fixed tracking-tight">
          Sou Paciente - Primeiro Acesso
        </h2>
        <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-1 leading-relaxed">
          Preencha seus dados para criar seu perfil e acessar sua rotina de exercícios.
        </p>
      </div>
      {successMsg ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 border border-emerald-200 dark:border-emerald-900/30 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      ) : (
        <form onSubmit={handleRegisterPatientSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface block">Nome Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">CPF</label>
              <input
                type="text"
                required
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">Celular (WhatsApp)</label>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface block">Motivo Principal / Patologia</label>
            <input
              type="text"
              required
              value={patologia}
              onChange={(e) => setPatologia(e.target.value)}
              placeholder="Ex: Dor na lombar, Pós-operatório..."
              className="w-full px-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">Senha de Acesso</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Crie uma senha"
                className="w-full px-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">Confirmar</label>
              <input
                type="password"
                required
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
          </div>
          {regError && <p className="text-xs text-error font-medium">{regError}</p>}
          <button
            type="submit"
            disabled={regLoading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs mt-3"
          >
            <span>{regLoading ? 'Criando Conta...' : 'Cadastrar Acesso'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </main>
  );
}
