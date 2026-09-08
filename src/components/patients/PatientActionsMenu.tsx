import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientActionsMenuProps {
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  status?: 'ativo' | 'inativo';
  onReactivate?: (e: React.MouseEvent) => void;
}

export default function PatientActionsMenu({
  isOpen,
  onToggle,
  onClose,
  onEdit,
  onDelete,
  status = 'ativo',
  onReactivate
}: PatientActionsMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Update position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX
      });
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button 
        ref={buttonRef}
        onClick={onToggle} 
        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Global Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            style={{ 
              position: 'absolute',
              top: coords.top + 8,
              left: coords.left - 176, // 176 is the width of the menu (w-44)
              zIndex: 9999
            }}
            className="w-44 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-750 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] py-2 overflow-hidden"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(e); onClose(); }} 
              className="w-full px-4 py-3 text-xs font-bold text-neutral-600 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors text-left"
            >
              <Edit size={14} className="text-teal-600" /> 
              <span>Editar Paciente</span>
            </button>
            
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 mx-2 my-1" />
            
            {status === 'ativo' ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(e); onClose(); }}
                className="w-full px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5 transition-colors text-left"
              >
                <Trash2 size={14} />
                <span>Inativar Registro</span>
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onReactivate?.(e); onClose(); }}
                className="w-full px-4 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center gap-2.5 transition-colors text-left"
              >
                <RotateCcw size={14} />
                <span>Reativar Paciente</span>
              </button>
            )}
          </motion.div>
        </>,
        document.body
      )}
    </div>
  );
}