import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { motion, AnimatePresence } from 'motion/react';

export default function DeleteConfirmModal() {
  const { deleteModalConfig, closeDeleteModal } = useUIStore();
  const { isOpen, title, description, onConfirm } = deleteModalConfig;

  

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDeleteModal}
          className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-8 overflow-hidden z-10 flex flex-col items-center"
        >
          {/* Warning Icon Container */}
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-full flex items-center justify-center text-red-500 mb-6 shrink-0">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 stroke-[2px]" />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white leading-snug">
              {title || 'Tem certeza que deseja excluir?'}
            </h3>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 leading-relaxed max-w-xs mx-auto">
              {description || 'Esta ação não poderá ser desfeita e todos os dados serão removidos permanentemente.'}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-3 w-full">
            <button
              onClick={closeDeleteModal}
              className="flex-1 py-3.5 px-4 bg-[#f4f7f6] dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-750 rounded-2xl text-xs font-black transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                closeDeleteModal();
              }}
              className="flex-1 py-3.5 px-4 bg-[#b3261e] hover:bg-[#961d17] dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-2xl text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Sim, Excluir</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
