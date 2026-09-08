import React, { useState, useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { usePatientsQuery, usePatientEvolutionQuery } from '../hooks';
import { Calendar as CalendarIcon, TrendingUp, CheckCircle, Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedWave from '../components/AnimatedWave';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Evolucao() {
  const { currentUser, theme } = useUIStore();
  const { data: patients } = usePatientsQuery();
  
  // Encontrar o registro de paciente vinculado ao perfil logado
  const patient = patients?.data?.find(p => p.profile_id === currentUser?.id);
  const patientId = patient?.id || null;
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const { data: stats, isLoading } = usePatientEvolutionQuery(patientId, currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const textColor = theme === 'dark' ? '#A3A3A3' : '#737373';
  const gridColor = theme === 'dark' ? '#262626' : '#f5f5f5';

  if (!patientId) return (
    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
      <Activity className="w-12 h-12 mb-4 opacity-20" />
      <p className="text-sm font-bold">Perfil de paciente não localizado.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-fadeIn max-w-md mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center mt-4 mb-8">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-2xl flex items-center justify-center mb-3">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Minha Evolução</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
          Acompanhe o seu progresso real baseado nos exercícios concluídos.
        </p>
      </div>

      {/* Month Filter */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-150 dark:border-neutral-800 shadow-sm">
        <button onClick={prevMonth} className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-white">
          <CalendarIcon className="w-4 h-4 text-[#0a5c4e] dark:text-[#52bfa6]" />
          <span>{monthNames[currentMonth]} {currentYear}</span>
        </div>
        <button onClick={nextMonth} className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 rounded-xl transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Processando métricas...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="relative bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center overflow-hidden min-h-[140px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 w-full h-full p-4 text-neutral-900 dark:text-white">
                <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </div>
                <span className="text-3xl font-black">{stats?.adherenceRate}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-1">Adesão Real</span>
              </div>

              <AnimatedWave percentage={stats?.adherenceRate || 0} className="z-20 opacity-90" />

              <div 
                className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 w-full h-full p-4 text-white"
                style={{ clipPath: `inset(${100 - (stats?.adherenceRate || 0)}% 0 0 0)` }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-3xl font-black">{stats?.adherenceRate}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-100 mt-1">Adesão Real</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center justify-center">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mb-2">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-neutral-900 dark:text-white">{stats?.completedSessions}</span>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Dias Treinados</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm mt-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-neutral-800 dark:text-white">Alertas de Dor/Dificuldade</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Registros críticos no período</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${stats?.painReportsCount && stats.painReportsCount > 0 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-300'}`}>
              {stats?.painReportsCount}
            </div>
          </div>

          {/* Evolução de Dor Chart */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800 dark:text-white">Esforço Médio Semanal (Borg)</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Como você se sentiu durante os treinos.</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 10 }} dy={10} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    cursor={{ stroke: gridColor, strokeWidth: 2 }}
                  />
                  <Line type="monotone" dataKey="dor" name="Esforço" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adesão Semanal Chart */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-neutral-800 dark:text-white">Consistência por Semana (%)</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Percentual de treinos concluídos em relação ao prescrito.</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 10 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                  />
                  <Bar dataKey="adesao" name="Adesão (%)" fill="#0a5c4e" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-center mt-8 p-6 bg-teal-50 dark:bg-teal-900/10 rounded-3xl border border-teal-100 dark:border-teal-900/30">
            <h4 className="text-sm font-bold text-teal-800 dark:text-teal-400 mb-2">Resumo do Período</h4>
            <p className="text-xs text-teal-600 dark:text-teal-500 leading-relaxed italic">
              {stats && stats.adherenceRate > 75 
                ? "Sua evolução está excelente! Mantenha esse ritmo para acelerar sua recuperação." 
                : "Tente manter uma frequência maior nos exercícios 'Em Casa' para melhorar sua consistência."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}