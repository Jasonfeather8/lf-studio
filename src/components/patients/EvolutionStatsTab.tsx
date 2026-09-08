import React, { useState, useMemo } from 'react';
import { Activity, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { usePatientAdherenceQuery } from '../../hooks';

interface EvolutionStatsTabProps {
  activePatientId: string;
}

export default function EvolutionStatsTab({ activePatientId }: EvolutionStatsTabProps) {
  const [statsPeriod, setStatsPeriod] = useState<7 | 30 | 90>(7);
  
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - statsPeriod);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }, [statsPeriod]);

  const { data: patientAdherence } = usePatientAdherenceQuery(activePatientId, null, startDate);

  const groupedAdherenceChartData = useMemo(() => {
    if (!patientAdherence) return [];
    const grouped = patientAdherence.reduce((acc: any, curr: any) => {
      const date = new Date(curr.data_execucao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) acc[date] = { name: date, volume: 0, maxBorg: 0 };
      acc[date].maxBorg = Math.max(acc[date].maxBorg, curr.borg_rating || 0);
      acc[date].volume += 10;
      return acc;
    }, {} as Record<string, any>);
    return Object.values(grouped);
  }, [patientAdherence]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#0a5c4e] dark:text-[#52bfa6]" />
          <span className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-wider">Período de Análise</span>
        </div>
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl">
          {[7, 30, 90].map((period) => (
            <button
              key={period}
              onClick={() => setStatsPeriod(period as any)}
              className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                statsPeriod === period 
                ? 'bg-white dark:bg-neutral-700 text-[#0a5c4e] dark:text-[#52bfa6] shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {period} DIAS
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Nível de Esforço (Borg)</h4>
            <div className="group relative">
              <Info size={14} className="text-neutral-300 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-neutral-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Mostra o maior nível de esforço relatado pelo paciente em cada dia do período selecionado.
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedAdherenceChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="maxBorg" fill="#0a5c4e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}