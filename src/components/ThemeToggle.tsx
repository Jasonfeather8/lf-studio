import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { motion } from 'motion/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-surface-container dark:bg-neutral-800 text-on-surface-variant dark:text-neutral-400 hover:bg-surface-container-high dark:hover:bg-neutral-700 transition-all cursor-pointer relative overflow-hidden group"
      title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
    >
      <motion.div
        initial={false}
        animate={{ y: theme === 'light' ? 0 : -40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Sun className="w-5 h-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ y: theme === 'dark' ? -25 : 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute left-1/2 -translate-x-1/2"
      >
        <Moon className="w-5 h-5" />
      </motion.div>
    </button>
  );
}