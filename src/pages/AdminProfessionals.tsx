import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, ProfessionalData } from '@/services/adminService';
import KPICard from '@/components/dashboard/KPICard';
import { Users, ShieldCheck, Search, Activity, Building, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminProfessionals() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADO DE PAGINAÇÃO
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: profsData, isLoading } = useQuery({
    queryKey: ['admin', 'professionals', page, pageSize],
    queryFn: () => adminService.getAllProfessionals(page, pageSize),
  });

  const professionals = profsData?.data || [];
  const totalProfessionals = profsData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalProfessionals / pageSize));

  // O filtro de busca por enquanto é local sobre os dados da página
  const filteredProfessionals = professionals.filter(p => {
    const name = p.nome_completo || '';
    const email = p.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPatientsGlobal = professionals.reduce((acc, curr) => acc + curr.pacientes_count, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Painel Super Admin</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Profissionais</h1>
          <p className="text-slate-500 dark:text-neutral-400 text-xs font-semibold mt-1">
            Visão geral da plataforma e controle de acesso profissional.
          </p>
        </div>
        <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold px-4 py-2 rounded-2xl border border-teal-100 dark:border-neutral-800/50">
          {totalProfessionals} Cadastrados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Profissionais"
          value={totalProfessionals}
          subValue="Ativos"
          icon={ShieldCheck}
          variant="teal"
        />

        <KPICard 
          title="Alunos Totais"
          value={totalPatientsGlobal}
          subValue="Base Global"
          icon={Users}
          variant="amber"
        />

        <KPICard 
          title="Média Alunos/Prof"
          value={(totalPatientsGlobal / Math.max(1, totalProfessionals)).toFixed(1)}
          subValue="Produtividade"
          icon={Activity}
          variant="red"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-sm p-6 space-y-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar nesta página..."
            className="w-full bg-slate-50 dark:bg-neutral-850 border-none rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none text-slate-900 dark:text-white"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold animate-pulse">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 dark:border-neutral-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Profissional</th>
                  <th className="pb-3 px-4">Papel</th>
                  <th className="pb-3 px-4">Alunos</th>
                  <th className="pb-3 px-4">Entrada</th>
                  <th className="pb-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-neutral-800 text-xs">
                {filteredProfessionals.map((prof) => (
                  <tr key={prof.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-400 font-black">
                          {prof.nome_completo?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-slate-900 dark:text-white">{prof.nome_completo || 'Sem Nome'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500 dark:text-neutral-400 capitalize">{prof.role}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-neutral-300">{prof.pacientes_count} alunos</td>
                    <td className="py-4 px-4 text-slate-400">{new Date(prof.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 px-4 text-right"><span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">Ativo</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RODAPÉ DE PAGINAÇÃO */}
        {totalProfessionals > pageSize && (
          <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-50 dark:border-neutral-800">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="p-2 border border-slate-200 dark:border-neutral-700 rounded-xl disabled:opacity-30 cursor-pointer shadow-xs transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"
            >
              <ChevronLeft size={18}/>
            </button>
            <span className="text-xs font-black text-neutral-400">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= totalPages} 
              className="p-2 border border-slate-200 dark:border-neutral-700 rounded-xl disabled:opacity-30 cursor-pointer shadow-xs transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}