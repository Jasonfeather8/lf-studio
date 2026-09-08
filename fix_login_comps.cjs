const fs = require('fs');

const makeComponent = (name, viewContent) => `import React, { useState } from 'react';
import { User, Lock, ArrowRight, Activity, BadgeCent, Check, Phone, ArrowLeft, CheckCircle, Briefcase, FileText } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { patientService } from '../../services/patientService';
import { mockProfiles } from '../../mocks/users';

interface Props {
  setView: (view: 'login' | 'register-patient' | 'register-physio') => void;
}

export default function ${name}({ setView }: Props) {
  const { setCurrentUser } = useUIStore();
  const navigate = useNavigate();
  const setRoute = (r: string) => navigate(\`/\${r}\`);

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Common Registration States
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Patient Registration specific states
  const [patologia, setPatologia] = useState('Pós-Operatório Ombro (Manguito Rotador)');
  const [obs, setObs] = useState('');

  // Professional Registration specific states
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

  const resetRegForm = () => {
    setNome(''); setCpf(''); setTelefone(''); setSenha(''); setConfirmaSenha(''); setObs(''); setEmailProf(''); setRegError('');
  };

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
    <>
      ${viewContent.replace(/\{view === '[a-z-]+' && \(/, '').replace(/\}$/, '').replace(/^\)/m, '').replace(/\}$/m, '')}
    </>
  );
}
`;

['LoginForm', 'RegisterPatientForm', 'RegisterPhysioForm'].forEach(name => {
  let content = fs.readFileSync(`src/components/login/${name}.tsx`, 'utf8');
  // the content right now is literally `{view === 'login' && ( <main>...</main> )}`
  // Let's unwrap it
  content = content.replace(new RegExp(`\\{view === '${name === 'LoginForm' ? 'login' : name === 'RegisterPatientForm' ? 'register-patient' : 'register-physio'}' && \\(`), '');
  content = content.trim();
  if (content.endsWith(')}')) {
    content = content.slice(0, -2);
  }
  
  fs.writeFileSync(`src/components/login/${name}.tsx`, makeComponent(name, content));
});

// Now fix Login.tsx to be just the wrapper
const loginPage = `import React, { useState } from 'react';
import LoginForm from '../components/login/LoginForm';
import RegisterPatientForm from '../components/login/RegisterPatientForm';
import RegisterPhysioForm from '../components/login/RegisterPhysioForm';

export default function Login() {
  const [view, setView] = useState<'login' | 'register-patient' | 'register-physio'>('login');

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-950 text-on-background dark:text-neutral-100 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      {view === 'login' && <LoginForm setView={setView} />}
      {view === 'register-patient' && <RegisterPatientForm setView={setView} />}
      {view === 'register-physio' && <RegisterPhysioForm setView={setView} />}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/Login.tsx', loginPage);
