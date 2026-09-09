import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, Send, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_RECIPIENT = 'lfstudio@saltonaweb.sh27.com.br';
const DEFAULT_SENDER = 'onboarding@resend.dev';
const DEFAULT_HTML = '<h1>Teste de email</h1><p>Este é um email de teste enviado pelo LF Studio.</p>';

export default function AdminEmailTest() {
  const [to, setTo] = useState(DEFAULT_RECIPIENT);
  const [from, setFrom] = useState(DEFAULT_SENDER);
  const [subject, setSubject] = useState('Teste de envio de email');
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: { to, from, subject, html },
      });

      if (error) {
        setErrorMessage('Não foi possível enviar o email de teste. Verifique os dados e tente novamente.');
      } else {
        setSuccessMessage('Email de teste enviado com sucesso.');
      }
    } catch {
      setErrorMessage('Não foi possível enviar o email de teste. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck size={16} />
          <span>Painel Super Admin</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Teste de emails</h1>
        <p className="text-slate-500 dark:text-neutral-400 text-xs font-semibold mt-1">
          Envie um email de teste para verificar a configuração de envio.
        </p>
      </div>

      <div className="max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white">Enviar email de teste</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">Preencha os campos abaixo para realizar o disparo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="block md:col-span-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">Destinatário</span>
              <input
                type="email"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                required
                maxLength={254}
                autoComplete="email"
                placeholder="destinatario@exemplo.com"
                className="w-full bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">Remetente</span>
              <input
                type="email"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                required
                maxLength={254}
                autoComplete="email"
                className="w-full bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              <span className="block text-[11px] text-slate-400 dark:text-neutral-500 mt-2">Remetente padrão: onboarding@resend.dev</span>
            </label>

            <label className="block md:col-span-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">Assunto</span>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                required
                maxLength={200}
                className="w-full bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-2">Conteúdo HTML</span>
              <textarea
                value={html}
                onChange={(event) => setHtml(event.target.value)}
                required
                maxLength={100000}
                rows={12}
                className="w-full resize-y bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
          </div>

          {successMessage && (
            <div role="status" className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Enviando...' : 'Enviar email de teste'}
          </button>
        </form>
      </div>
    </div>
  );
}
