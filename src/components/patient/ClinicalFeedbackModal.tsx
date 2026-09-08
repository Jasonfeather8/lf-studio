import React from 'react';
import Modal from '../Modal';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { borg: number, dor: boolean, relato: string }) => void;
  isLoading: boolean;
}

export default function ClinicalFeedbackModal({ isOpen, onClose, onConfirm, isLoading }: Props) {
  const [borg, setBorg] = React.useState(3);
  const [sentiuDor, setSentiuDor] = React.useState(false);
  const [relato, setRelato] = React.useState('');

  const getBorgInfo = (val: number) => {
    const info = {
      1: { label: 'Muito Leve', color: 'bg-emerald-500' },
      2: { label: 'Leve', color: 'bg-emerald-500' },
      3: { label: 'Moderado', color: 'bg-teal-500' },
      4: { label: 'Ligeiramente Cansativo', color: 'bg-teal-500' },
      5: { label: 'Cansativo', color: 'bg-amber-500' },
      6: { label: 'Intenso', color: 'bg-amber-500' },
      7: { label: 'Muito Intenso', color: 'bg-orange-600' },
      8: { label: 'Muito Duro', color: 'bg-orange-600' },
      9: { label: 'Extremamente Duro', color: 'bg-red-600' },
      10: { label: 'Esforço Máximo', color: 'bg-red-600' },
    };
    return info[val as keyof typeof info] || { label: '', color: 'bg-neutral-500' };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avaliação do Exercício">
      <div className="space-y-6 pt-2">
        <div>
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-4">Nível de Esforço (Escala Borg)</label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setBorg(num)}
                className={`py-3.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                  borg === num ? `${getBorgInfo(num).color} text-white shadow-lg scale-110` : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          {/* Label Dinâmico (Substitui as etiquetas estáticas) */}
          <div className="mt-4 flex justify-center">
            <motion.div 
              key={borg}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getBorgInfo(borg).color.replace('bg-', 'text-')} ${getBorgInfo(borg).color.replace('bg-', 'border-')}/20 ${getBorgInfo(borg).color.replace('bg-', 'bg-')}/10`}
            >
              Intensidade: {getBorgInfo(borg).label}
            </motion.div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-neutral-500 uppercase tracking-wider">Sentiu alguma dor?</span>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button onClick={() => setSentiuDor(false)} className={`px-5 py-1.5 text-[10px] font-black rounded-lg transition-all ${!sentiuDor ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white shadow-sm' : 'text-neutral-400'}`}>NÃO</button>
              <button onClick={() => setSentiuDor(true)} className={`px-5 py-1.5 text-[10px] font-black rounded-lg transition-all ${sentiuDor ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400'}`}>SIM</button>
            </div>
          </div>

          <AnimatePresence>
            {sentiuDor && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <textarea
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  placeholder="Onde e como foi a dor? (Ex: pontada no ombro)"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-xs font-medium focus:ring-1 focus:ring-red-500 outline-none resize-none"
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => onConfirm({ borg, dor: sentiuDor, relato })}
          disabled={isLoading}
          className="w-full py-4 bg-[#0a5c4e] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-[#07473c] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
          <span>Registrar e Concluir</span>
        </button>
      </div>
    </Modal>
  );
}