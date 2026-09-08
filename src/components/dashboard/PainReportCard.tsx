import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';

export default function PainReportCard({ report, evaThreshold }: { report: any, evaThreshold: number }) {
  const { setActivePatientId, setActivePrescriptionId, setHistoryDrawerOpen } = useUIStore();
  const navigate = useNavigate();

  const isCritical = report.eva >= evaThreshold;
  const isModerate = report.eva < evaThreshold && report.eva >= 4;
  
  let cardBorderClass = 'border-surface-container dark:border-neutral-800';
  let badgeClass = '';
  let badgeText = '';

  if (isCritical) {
    cardBorderClass = 'border-red-200 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5';
    badgeClass = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/40';
    badgeText = `ALERTA CRÍTICO • EVA ${report.eva}`;
  } else if (isModerate) {
    cardBorderClass = 'border-amber-200 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5';
    badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/40';
    badgeText = `Monitorado • EVA ${report.eva}`;
  } else {
    cardBorderClass = 'border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/10 dark:bg-emerald-950/5';
    badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/40';
    badgeText = `Estável • EVA ${report.eva}`;
  }

  const handleAlertClick = () => {
    setActivePatientId(report.patientId);
    // Define a prescrição ativa para o histórico saber o que filtrar
    setActivePrescriptionId(report.prescriptionId);
    setHistoryDrawerOpen(true);
    navigate('/patients');
  };

  return (
    <div 
      onClick={handleAlertClick}
      className={`p-3.5 rounded-xl border transition-all ${cardBorderClass} cursor-pointer hover:bg-surface-container-low dark:hover:bg-neutral-850 hover:shadow-md active:scale-[0.98] group`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <img src={report.avatar} alt={report.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-100 dark:border-neutral-700" />
          <div>
            <h6 className="text-xs font-bold text-on-surface dark:text-white leading-none mb-1 truncate group-hover:text-[#0a5c4e] transition-colors">{report.name}</h6>
            <span className="text-[10px] font-semibold text-slate-500 line-clamp-1">{report.patologia}</span>
          </div>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeClass} shrink-0`}>
          {badgeText}
        </span>
      </div>
      <p className="text-[10.5px] text-on-surface-variant dark:text-neutral-300 leading-relaxed italic border-l-2 border-outline-variant/50 pl-2 mt-2">
        &ldquo;{report.relato}&rdquo;
      </p>
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-surface-container dark:border-neutral-800 text-[10px]">
        <span className="text-[#89938e] flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {report.time}
        </span>
        <span className="text-[#0a5c4e] dark:text-[#52bfa6] font-black uppercase text-[8px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver Contexto →</span>
      </div>
    </div>
  );
}