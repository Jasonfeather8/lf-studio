import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminPrescriptionCard from './AdminPrescriptionCard';
import { usePrescriptionsQuery, useDeletePrescriptionMutation } from '../../hooks';
import { useUIStore } from '../../store/uiStore';

interface PrescriptionsTabProps {
  activePatientId: string;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onOpenPrescriptionForm: (editingId?: string | null, duplicateId?: string | null) => void;
}

export default function PrescriptionsTab({ activePatientId, page, setPage, onOpenPrescriptionForm }: PrescriptionsTabProps) {
  const { data: prescriptionsData } = usePrescriptionsQuery(activePatientId, page, 20);
  const { openDeleteModal } = useUIStore();
  const deletePrescriptionMutation = useDeletePrescriptionMutation();
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);

  const prescriptions = prescriptionsData?.data || [];
  const total = prescriptionsData?.total || 0;
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => onOpenPrescriptionForm(null, null)} id="btn-nova-prescricao" className="bg-[#0a5c4e] text-white px-4.5 py-3 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"><Plus className="w-3.5 h-3.5" /> Nova Prescrição</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {prescriptions.map(presc => (
          <AdminPrescriptionCard 
            key={presc.id} 
            presc={presc} 
            isKebabOpen={activeKebabId === presc.id} 
            setActiveKebabId={setActiveKebabId} 
            onOpenPrescriptionForm={onOpenPrescriptionForm} 
            handleDeletePrescription={(id: string, title: string) => openDeleteModal('Excluir', `Deseja remover ${title}?`, () => deletePrescriptionMutation.mutate(id))} 
          />
        ))}
      </div>

      {total > itemsPerPage && (
        <div className="flex justify-center items-center gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800/40">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-xl disabled:opacity-30 cursor-pointer shadow-xs"><ChevronLeft size={18}/></button>
          <span className="text-xs font-black text-neutral-400">Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="p-2 border rounded-xl disabled:opacity-30 cursor-pointer shadow-xs"><ChevronRight size={18}/></button>
        </div>
      )}
    </div>
  );
}