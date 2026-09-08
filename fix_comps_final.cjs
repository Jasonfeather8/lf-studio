const fs = require('fs');

const loginForm = `import React, { useState } from 'react';
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
  const setRoute = (r: string) => navigate(\`/\${r}\`);

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
`;
fs.writeFileSync('src/components/login/LoginForm.tsx', loginForm);

const registerPatientForm = `import React, { useState } from 'react';
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
  const setRoute = (r: string) => navigate(\`/\${r}\`);

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
    const digits = val.replace(/\\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = \`\${digits.slice(0, 3)}.\${digits.slice(3, 6)}.\${digits.slice(6, 9)}-\${digits.slice(9)}\`;
    } else if (digits.length > 6) {
      formatted = \`\${digits.slice(0, 3)}.\${digits.slice(3, 6)}.\${digits.slice(6)}\`;
    } else if (digits.length > 3) {
      formatted = \`\${digits.slice(0, 3)}.\${digits.slice(3)}\`;
    }
    setCpf(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = \`(\${digits.slice(0, 2)}) \${digits.slice(2, 7)}-\${digits.slice(7)}\`;
    } else if (digits.length > 2) {
      formatted = \`(\${digits.slice(0, 2)}) \${digits.slice(2)}\`;
    } else if (digits.length > 0) {
      formatted = \`(\${digits}\`;
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
      const profileId = \`patient-\${Math.random().toString(36).substring(2, 11)}\`;
      const createdProfile = await profileService.create({
        id: profileId, role: 'patient', nome_completo: nome, documento_cpf: cpf,
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        telefone: telefone,
      });
      await patientService.create({
        id: \`pat-\${Math.random().toString(36).substring(2, 11)}\`, profile_id: profileId,
        data_nascimento: '1990-01-01', patologia_principal: patologia, observacoes_clinicas: obs,
        data_inicio_tratamento: new Date().toISOString().split('T')[0], status_tratamento: 'ativo',
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
`;
fs.writeFileSync('src/components/login/RegisterPatientForm.tsx', registerPatientForm);

const registerPhysioForm = `import React, { useState } from 'react';
import { User, Briefcase, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';

interface Props {
  setView: (view: 'login' | 'register-patient' | 'register-physio') => void;
}

export default function RegisterPhysioForm({ setView }: Props) {
  const { setCurrentUser } = useUIStore();
  const navigate = useNavigate();
  const setRoute = (r: string) => navigate(\`/\${r}\`);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [emailProf, setEmailProf] = useState('');

  const handleCpfChange = (val: string) => {
    const digits = val.replace(/\\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = \`\${digits.slice(0, 3)}.\${digits.slice(3, 6)}.\${digits.slice(6, 9)}-\${digits.slice(9)}\`;
    } else if (digits.length > 6) {
      formatted = \`\${digits.slice(0, 3)}.\${digits.slice(3, 6)}.\${digits.slice(6)}\`;
    } else if (digits.length > 3) {
      formatted = \`\${digits.slice(0, 3)}.\${digits.slice(3)}\`;
    }
    setCpf(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = \`(\${digits.slice(0, 2)}) \${digits.slice(2, 7)}-\${digits.slice(7)}\`;
    } else if (digits.length > 2) {
      formatted = \`(\${digits.slice(0, 2)}) \${digits.slice(2)}\`;
    } else if (digits.length > 0) {
      formatted = \`(\${digits}\`;
    }
    setTelefone(formatted);
  };

  const handleRegisterPhysioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (senha !== confirmaSenha) { setRegError('As senhas não coincidem.'); return; }
    if (cpf.length < 14) { setRegError('Registro Profissional / CPF inválido.'); return; }
    setRegLoading(true);
    try {
      const profileId = \`physio-\${Math.random().toString(36).substring(2, 11)}\`;
      const createdProfile = await profileService.create({
        id: profileId, role: 'physio', nome_completo: nome, documento_cpf: cpf,
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHYBWh6yjM6NDy6yP7jmgdWifD4Wpsefp-AwCQ3F7JxWwbAbkIODU5SVf0MnSmJkUTbkFWx0IIuG_CvIuLhlaoTouLFPZ2u5P_vnjAuxjO49fzx3Uko2Bo2D45h2A93sS8qrOVpMfO4zO2K76y6g6Umgrvozj0km0N_gpHNTtc46ouVsV3AGmpwPZbDoMtjCrXsdXRfXcWHxko1JGe8YQLPYtvd4LauplHRtGACB0iGN6DyjlQa_Zo',
        telefone: telefone,
      });
      setSuccessMsg('Sua conta profissional foi ativada!');
      setTimeout(() => {
        setCurrentUser(createdProfile);
        setRoute(createdProfile.role === 'patient' ? 'rotina' : 'dashboard');
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || 'Erro ao registrar profissional.'); setRegLoading(false);
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
          Criar Conta - Profissional
        </h2>
        <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-1 leading-relaxed">
          Registre-se como Fisioterapeuta para gerenciar pacientes, prescrever treinos e acompanhar evolução clínica.
        </p>
      </div>
      {successMsg ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 border border-emerald-200 dark:border-emerald-900/30 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      ) : (
        <form onSubmit={handleRegisterPhysioSubmit} className="space-y-4">
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
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface block">Email Profissional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={emailProf}
                onChange={(e) => setEmailProf(e.target.value)}
                placeholder="email@lfstudio.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">Registro CREFITO / CPF</label>
              <input
                type="text"
                required
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="CPF ou CREFITO"
                className="w-full px-4 py-2.5 bg-[#F1F3F5] dark:bg-neutral-850 border border-transparent focus:border-primary dark:focus:border-primary-fixed focus:ring-0 rounded-2xl text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">Contato Celular</label>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface block">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha profissional"
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
            <span>{regLoading ? 'Criando Conta...' : 'Cadastrar Fisioterapeuta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </main>
  );
}
`;
fs.writeFileSync('src/components/login/RegisterPhysioForm.tsx', registerPhysioForm);
