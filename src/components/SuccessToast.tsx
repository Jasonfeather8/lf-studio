import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface SuccessToastProps {
  isOpen: boolean;
  message: string;
  description: string;
}

export default function SuccessToast({ isOpen, message, description }: SuccessToastProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          // Uso de left-4 e right-4 com max-w-sm garante que ele se ajuste a qualquer largura de tela sem cortar
          className="fixed bottom-32 left-4 right-4 z-[9999] mx-auto max-w-sm bg-neutral-900/95 dark:bg-neutral-800/98 backdrop-blur-md border border-neutral-700 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Check className="w-6 h-6 text-emerald-400 stroke-[3px]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white leading-tight">{message}</p>
            <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">{description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}