import React from 'react';
import { useUIStore } from '../../store/uiStore';

export default function PatientHeader() {
  const { currentUser } = useUIStore();
  
  return (
    <header className="px-6 mb-6 relative z-10 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
          Olá, {currentUser?.nome_completo?.split(' ')[0] || 'Mariana'}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1 font-medium">
          Aqui está sua rotina para hoje.
        </p>
      </div>
      <div className="w-12 h-12 rounded-full p-0.5 bg-white dark:bg-neutral-800 shadow-sm border border-slate-200 dark:border-neutral-700 shrink-0 cursor-pointer transition-transform active:scale-95">
        <img 
          src={currentUser?.role === 'patient' ? "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" : "https://lh3.googleusercontent.com/aida-public/AB6AXuBWOBy3SNYSsdcvmZ_ZSTMfaZ0X6uTEhe_54UZKeU8deM8s-YkO9buBwOv4w8ivpFXa8WCrQC9_TC-pB2wGx3po-c2inMjM6_AnzcOlPAMnOBvv09OhT4kuPXTBbkkiZdDrsZ3W4GawAo3k7HapWuoYXf9hqgVhZQbzYq44ymygvwkV0MMkLm2S4-YKx3Nzc1FtiDlmUQGNiq5ZdjnBhIYYamF7OsjrdvwbtDgfaudEc3KXKIesvRo9"} 
          alt={currentUser?.nome_completo || 'Perfil'} 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    </header>
  );
}
