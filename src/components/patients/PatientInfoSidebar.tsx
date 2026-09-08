import React from 'react';
import { Phone, FileText, Calendar, Edit, Heart } from 'lucide-react';
import { Patient, Profile } from '../../types';

interface PatientInfoSidebarProps {
  patient: Patient;
  profile: Profile | undefined;
  onEdit: () => void;
}

export default function PatientInfoSidebar({ patient, profile, onEdit }: PatientInfoSidebarProps) {
  if (!profile) return null;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-[#eef2f1] dark:bg-neutral-850 flex items-center justify-center font-black text-lg border overflow-hidden shrink-0">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="text-[#0a5c4e]">{profile.nome_completo.charAt(0)}</span>}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight truncate">{profile.nome_completo}</h2>
            <span className="bg-[#eef2f1] dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Ativo</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
               <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
               <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Patologia Principal</p>
               <p className="text-xs font-bold text-neutral-800 dark:text-white leading-relaxed">{patient.patologia_principal}</p>
            </div>
          </div>

          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

          <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold px-1">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{profile.telefone || '(Não cadastrado)'}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold px-1">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>CPF: {profile.documento_cpf || 'Não cadastrado'}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold px-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{(profile as any).email || '(Sem e-mail)'}</span>
          </div>
        </div>

        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5">
          <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-2 mb-2">Ficha Clínica</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed italic">{patient.observacoes_clinicas || 'Sem observações cadastradas.'}</p>
        </div>

        <button onClick={onEdit} className="w-full px-5 py-3 border border-[#0a5c4e]/30 text-[#0a5c4e] dark:text-[#52bfa6] rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-[#eef2f1]/50 cursor-pointer transition-colors" title="Editar informações do paciente">
          <Edit className="w-3.5 h-3.5" /> Editar Dados
        </button>
      </div>
    </div>
  );
}