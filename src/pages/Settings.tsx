import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { MessageCircle, Save } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { companyWhatsapp, setCompanyWhatsapp } = useUIStore();
  const [whatsapp, setWhatsapp] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWhatsapp(companyWhatsapp);
  }, [companyWhatsapp]);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits.slice(0)}`;
    }
    setWhatsapp(formatted);
  };

  const handleSave = () => {
    setCompanyWhatsapp(whatsapp);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Configurações</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Gerencie as preferências e dados do sistema.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-3xl p-6 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-white">WhatsApp de Contato</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Número para o qual os pacientes enviarão mensagens de dor ou dúvidas.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">
              Número do WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#0a5c4e] dark:focus:border-[#52bfa6] focus:ring-1 focus:ring-[#0a5c4e] dark:focus:ring-[#52bfa6] transition-all"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#0a5c4e] hover:bg-[#07473c] dark:bg-[#52bfa6] dark:text-neutral-950 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configuração</span>
            </button>
          </div>
          
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-green-600 dark:text-green-400 font-bold text-right"
            >
              Salvo com sucesso!
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
