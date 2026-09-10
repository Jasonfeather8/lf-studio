import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';

const hasRecoveryRedirect = () => {
  if (typeof window === 'undefined') return false;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);
  return hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';
};

export default function Login() {
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [crefito, setCrefito] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecovering, setIsRecovering] = useState(hasRecoveryRedirect);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
        setIsRegistering(false);
        setError(null);
        setSuccess(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isRecovering && !authLoading && session) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-mail ou senha inválidos.');
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Registro do Fisioterapeuta
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo: fullName,
          role: 'admin', // Standard role for new professionals
          crefito: crefito,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSuccess('Conta criada com sucesso! Você já pode entrar.');
      setIsRegistering(false);
      setIsSubmitting(false);
      // Limpar campos
      setPassword('');
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccess(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Informe um e-mail válido para redefinir sua senha.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError('Não foi possível enviar o e-mail de redefinição. Tente novamente.');
    } else {
      setSuccess('Se houver uma conta associada a este e-mail, enviaremos um link para redefinir sua senha.');
    }
    setIsSubmitting(false);
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password) {
      setError('Informe uma nova senha.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError('Não foi possível atualizar sua senha. Tente novamente.');
    } else {
      setSuccess('Senha atualizada com sucesso! Você já pode entrar.');
      setPassword('');
      setConfirmPassword('');
      setIsRecovering(false);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-4 bg-dots transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 p-8 rounded-[32px] shadow-2xl border border-slate-100 dark:border-neutral-800"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-36 h-36 mb-2 drop-shadow-lg">
            <img src={logo} alt="LF Studio" className="w-full h-full object-contain" />
          </div>
          <p className="text-slate-400 dark:text-neutral-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2">
            {isRecovering ? 'Redefinir Senha' : isRegistering ? 'Cadastro de Profissional' : 'Plataforma de Reabilitação'}
          </p>
        </div>

        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 mb-6 text-center"
          >
            {success}
          </motion.p>
        )}

        <form onSubmit={isRecovering ? handlePasswordRecovery : isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {!isRecovering && isRegistering && (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-neutral-850 border border-transparent dark:border-neutral-800 rounded-2xl focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 transition-all outline-none text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">CREFITO</label>
                <input
                  type="text"
                  required
                  value={crefito}
                  onChange={(e) => setCrefito(e.target.value)}
                  placeholder="Registro Profissional"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-neutral-850 border border-transparent dark:border-neutral-800 rounded-2xl focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 transition-all outline-none text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
            </>
          )}

          {!isRecovering && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">E-mail Corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-neutral-850 border border-transparent dark:border-neutral-800 rounded-2xl focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 transition-all outline-none text-slate-900 dark:text-white font-bold text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">{isRecovering ? 'Nova Senha' : 'Senha'}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-neutral-850 border border-transparent dark:border-neutral-800 rounded-2xl focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 transition-all outline-none text-slate-900 dark:text-white font-bold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRecovering && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-neutral-850 border border-transparent dark:border-neutral-800 rounded-2xl focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 transition-all outline-none text-slate-900 dark:text-white font-bold text-sm"
              />
            </div>
          )}

          {!isRecovering && !isRegistering && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isSubmitting}
              className="w-full text-right text-xs font-bold text-[#0D9488] hover:text-[#0f766e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              Esqueci minha senha
            </button>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-black py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-xl shadow-[#0D9488]/20 uppercase tracking-widest text-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{isRecovering ? 'Atualizando senha...' : isRegistering ? 'Criando conta...' : 'Entrando...'}</span>
              </>
            ) : (
              <>
                {isRegistering ? <UserPlus size={16} /> : <LogIn size={16} />}
                <span>{isRecovering ? 'Atualizar senha' : isRegistering ? 'Criar Minha Conta' : 'Entrar'}</span>
              </>
            )}
          </button>
        </form>
        
        {!isRecovering && (
          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setSuccess(null);
              }}
              className="w-full py-3.5 rounded-2xl border-2 border-teal-50 dark:border-neutral-800 text-[#0D9488] dark:text-[#52bfa6] hover:bg-teal-50 dark:hover:bg-neutral-800 font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <LogIn size={14} />
                  <span>Já possui conta? Fazer login</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Sou Fisioterapeuta • Criar Conta</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} LF Studio • Clinical Management
          </p>
        </div>
      </motion.div>
    </div>
  );
}