import React from 'react';

interface ToggleTabsProps {
  activeTab: 'estudio' | 'casa';
  onTabChange: (tab: 'estudio' | 'casa') => void;
}

export default function ToggleTabs({ activeTab, onTabChange }: ToggleTabsProps) {
  return (
    <div className="px-6 mb-6 relative z-10">
      <div className="bg-slate-200/60 dark:bg-neutral-800/60 p-1 rounded-2xl flex items-center backdrop-blur-sm shadow-inner">
        <button
          onClick={() => onTabChange('estudio')}
          className={`flex-1 font-semibold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98] ${
            activeTab === 'estudio'
              ? 'bg-white dark:bg-neutral-900 text-teal-700 dark:text-teal-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none'
              : 'text-slate-500 dark:text-neutral-400 font-medium hover:text-slate-700 dark:hover:text-neutral-300'
          }`}
        >
          No Estúdio
        </button>
        <button
          onClick={() => onTabChange('casa')}
          className={`flex-1 font-semibold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98] ${
            activeTab === 'casa'
              ? 'bg-white dark:bg-neutral-900 text-teal-700 dark:text-teal-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none'
              : 'text-slate-500 dark:text-neutral-400 font-medium hover:text-slate-700 dark:hover:text-neutral-300'
          }`}
        >
          Em Casa
        </button>
      </div>
    </div>
  );
}
