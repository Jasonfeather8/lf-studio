import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}: ModalProps) {
  

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/55 backdrop-blur-xs"
        />
        {/* Modal body */}
        <motion.div
          initial={{ scale: 0.96, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 10, opacity: 0 }}
          className={`relative w-full ${maxWidthClasses[maxWidth]} bg-surface-container-lowest dark:bg-neutral-900 rounded-2xl shadow-xl border border-surface-container-high dark:border-neutral-800 p-6 max-h-[90vh] flex flex-col overflow-hidden z-10`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-surface-container dark:border-neutral-800 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-primary dark:text-primary-fixed-dim min-w-0 flex-1 pr-4 break-words leading-snug">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-on-surface-variant dark:text-neutral-400 hover:bg-surface-container dark:hover:bg-neutral-800 p-1.5 rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
