"use client";

import React from 'react';
import { useUIStore } from '../store/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientRotinaView from '../components/dashboard/PatientRotinaView';
import PainReportCard from '../components/dashboard/PainReportCard';
import WeeklyAdherenceChart from '../components/dashboard/WeeklyAdherenceChart';
import KPICard from '../components/dashboard/KPICard';
import { TrendingUp, Users, Activity, AlertCircle, ChevronRight, Calendar, Clock, Info, SlidersHorizontal } from 'lucide-react';
import { useAdherenceStatsQuery } from '../hooks/queries/useAdherence';
import { useDashboardQueries } from '../hooks/queries/useDashboard';

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { setActivePatientId } = useUIStore();
  const { data: stats } = useAdherenceStatsQuery();
  const { painReports, recentWorkouts } = useDashboardQueries();

  const isProfessional = role === 'admin' || role === 'super_admin';

  if (!isProfessional) {
    return <PatientRotinaView />;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const formattedDate = sevenDaysAgo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const adherenceValue = stats?.taxaAdesao ? parseInt(stats.taxaAdesao) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Aviso de Janela de Dados */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3.5 rounded-2xl flex items-center gap-3 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-sm">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
          <Info size={16} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span>Relatório Dinâmico Ativo</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-blue-300 dark:bg-blue-700"></span>
          <span className="opacity-80">Exibindo dados de adesão e alertas dos últimos 7 dias (desde {formattedDate}).</span>
        </div>
      </div>

      {/* Grid de KPIs Reutilizáveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Pacientes Ativos"
          value={stats?.pacientesAtivosCount || 0}
          subValue={stats?.pacientesAtivosCrescimento}
          icon={Users}
          variant="teal"
        />

        <KPICard 
          title="Taxa de Adesão"
          value={stats?.taxaAdesao || '0%'}
          subValue={stats?.taxaAdesaoLabel}
          icon={TrendingUp}
          variant="amber"
          progress={adherenceValue}
        />

        <KPICard 
          title="Alertas Críticos de Dor"
          value={painReports?.length || 0}
          badge={
            <div className="mt-3 flex items-center gap-1 bg-slate-100/80 dark:bg-neutral-800/80 w-max px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
              <SlidersHorizontal size={10} />
              EVA &ge; 7 (Padrão)
            </div>
          }
          icon={AlertCircle}
          variant="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-[32px] border border-slate-100 dark:border-neutral-800 shadow-sm min-h-[400px] flex flex-col">
             <WeeklyAdherenceChart />
          </div>
        </div>

        {/* Sidebar do Dashboard */}
        <div className="space-y-8">
          {/* Treinos Recentes */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-slate-100 dark:border-neutral-800 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Treinos Recentes
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {recentWorkouts?.map((workout) => (
                <div 
                  key={workout.id} 
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-neutral-800"
                  onClick={() => {
                    setActivePatientId(workout.patientId);
                    navigate('/patients');
                  }}
                >
                  <img src={workout.avatar} alt={workout.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-neutral-700" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{workout.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase">{workout.time}</span>
                      <span className="text-[8px] font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        {workout.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!recentWorkouts || recentWorkouts.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-6">Nenhuma atividade registrada hoje.</p>
              )}
            </div>
          </div>

          {/* Alertas de Dor */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-[32px] border border-slate-100 dark:border-neutral-800 shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Alertas de Dor
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {painReports?.map((report) => (
                <PainReportCard key={report.id} report={report} evaThreshold={7} />
              ))}
              {(!painReports || painReports.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tudo estável</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}