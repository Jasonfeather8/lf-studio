import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant: 'teal' | 'amber' | 'red';
  progress?: number;
  badge?: React.ReactNode;
}

export default function KPICard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  variant, 
  progress,
  badge 
}: KPICardProps) {
  
  const variantClasses = {
    teal: {
      glow: 'glow-teal',
      text: 'text-teal-700 dark:text-teal-400',
      bgIcon: 'bg-teal-50/80 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-100/50 dark:border-teal-800/30',
      progress: 'bg-teal-600 dark:bg-teal-500'
    },
    amber: {
      glow: 'glow-amber',
      text: 'text-amber-800 dark:text-amber-400',
      bgIcon: 'bg-amber-50/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-800/30',
      progress: 'bg-amber-600 dark:bg-amber-500'
    },
    red: {
      glow: 'glow-red',
      text: 'text-red-600 dark:text-red-400',
      bgIcon: 'bg-red-50/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100/50 dark:border-red-800/30',
      progress: 'bg-red-600 dark:bg-red-500'
    }
  };

  const currentVariant = variantClasses[variant];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-neutral-800 relative overflow-hidden flex justify-between items-start transition-all group">
      {/* Efeitos de Fundo */}
      <div className={`glow-effect ${currentVariant.glow}`}></div>
      <div className="card-dots"></div>
      
      {/* Conteúdo (Esquerda) */}
      <div className="card-content flex flex-col justify-between h-full w-full min-w-0">
        <div className="mb-2">
          <h3 className="text-[11px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-1 truncate">{title}</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-4xl font-extrabold tracking-tight dark:text-white ${variant === 'teal' || variant === 'amber' ? '' : currentVariant.text}`}>
              {value}
            </span>
            {subValue && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${variant === 'teal' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-neutral-400'}`}>
                {subValue}
              </span>
            )}
          </div>
        </div>

        {badge && <div className="mt-2">{badge}</div>}

        {progress !== undefined && (
          <div className="w-full h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${currentVariant.progress}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Ícone (Direita) */}
      <div className={`card-content shrink-0 ml-4 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-sm border mt-1 group-hover:scale-110 transition-transform ${currentVariant.bgIcon}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}