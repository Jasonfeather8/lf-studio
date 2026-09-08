import React, { useState } from 'react';
import { ChevronLeft, Edit } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { usePatientsQuery, useUpdatePatientMutation, useProfilesQuery } from '../../hooks';
import { profileService } from '../../services/profileService';
import PatientFormModal, { PatientFormData } from './PatientFormModal';
import PatientHistoryDrawer from './PatientHistoryDrawer';
import PatientInfoSidebar from './PatientInfoSidebar';
import PrescriptionsTab from './PrescriptionsTab';
import ExamsTab from './ExamsTab';
import EvolutionStatsTab from './EvolutionStatsTab';

interface PatientDetailViewProps {
  onOpenPrescriptionForm: (editingId?: string | null, duplicateId?: string | null) => void;
  triggerToast: (message: string, patientId?: string, type?: 'success' | 'info') => void;
}

export default function PatientDetailView({
  onOpenPrescriptionForm,
  triggerToast,
}: PatientDetailViewProps) {
  const { activePatientId, setActivePatientId } = useUIStore();
  const [page, setPage] = useState(1);
  const { data: patients } = usePatientsQuery();
  const { data: profiles } = useProfilesQuery();

  const [activeTab, setActiveTab] = useState<'exams' | 'prescriptions' | 'stats'>('prescriptions');
  
  const patient = patients?.data?.find(p => p.id === activePatientId);
  const profile = profiles?.find(p => p.id === patient?.profile_id);

  const updatePatientMutation = useUpdatePatientMutation();

  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    nome_completo: '',
    documento_cpf: '',
    telefone: '',
    email: '',
    patologia_principal: '',
    observacoes_clinicas: '',
  });

  const maskCPF = (value: string) => (value || '').replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const maskPhone = (value: string) => (value || '').replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');

  const handleOpenEditModal = () => {
    if (!patient || !profile) return;
    setFormData({
      nome_completo: profile.nome_completo || '',
      documento_cpf: maskCPF(profile.documento_cpf),
      telefone: maskPhone(profile.telefone),
      email: '',
      patologia_principal: patient.patologia_principal || '',
      observacoes_clinicas: patient.observacoes_clinicas || '',
    });
    setEditPatientModalOpen(true);
  };

  const handleSavePatientEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !profile) return;

    try {
      await profileService.update(patient.profile_id, {
        nome_completo: formData.nome_completo,
        telefone: formData.telefone,
        documento_cpf: formData.documento_cpf,
      });

      await updatePatientMutation.mutateAsync({
        id: patient.id,
        updates: {
          patologia_principal: formData.patologia_principal,
          observacoes_clinicas: formData.observacoes_clinicas,
        },
      });
      setEditPatientModalOpen(false);
      triggerToast(`Dados de ${formData.nome_completo} atualizados!`);
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message || "Tente novamente."}`);
    }
  };

  if (!patient || !profile || !activePatientId) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button onClick={() => setActivePatientId(null)} className="flex items-center gap-1.5 text-xs font-black text-neutral-500 hover:text-[#0a5c4e] transition-colors cursor-pointer group">
          <ChevronLeft className="w-4 h-4 stroke-[2.5px] group-hover:-translate-x-0.5" />
          <span>Voltar para Lista</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Barra Lateral Informações */}
        <PatientInfoSidebar 
          patient={patient} 
          profile={profile} 
          onEdit={handleOpenEditModal} 
        />

        {/* Conteúdo Principal (Abas) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="border-b border-neutral-100 dark:border-neutral-800 flex gap-6">
            <button onClick={() => { setActiveTab('prescriptions'); setPage(1); }} className={`pb-3 text-sm font-bold border-b-3 transition-all cursor-pointer ${activeTab === 'prescriptions' ? 'border-[#0a5c4e] text-[#0a5c4e] dark:border-[#52bfa6] dark:text-[#52bfa6]' : 'text-neutral-400 hover:text-neutral-600'}`}>
              Prescrições
            </button>
            <button onClick={() => { setActiveTab('exams'); setPage(1); }} className={`pb-3 text-sm font-bold border-b-3 transition-all cursor-pointer ${activeTab === 'exams' ? 'border-[#0a5c4e] text-[#0a5c4e] dark:border-[#52bfa6] dark:text-[#52bfa6]' : 'text-neutral-400 hover:text-neutral-600'}`}>
              Exames
            </button>
            <button onClick={() => { setActiveTab('stats'); setPage(1); }} className={`pb-3 text-sm font-bold border-b-3 transition-all cursor-pointer ${activeTab === 'stats' ? 'border-[#0a5c4e] text-[#0a5c4e] dark:border-[#52bfa6] dark:text-[#52bfa6]' : 'text-neutral-400 hover:text-neutral-600'}`}>
              Evolução
            </button>
          </div>

          {activeTab === 'prescriptions' && (
            <PrescriptionsTab 
              activePatientId={activePatientId} 
              page={page} 
              setPage={setPage} 
              onOpenPrescriptionForm={onOpenPrescriptionForm} 
            />
          )}

          {activeTab === 'exams' && (
            <ExamsTab 
              activePatientId={activePatientId} 
              page={page} 
              setPage={setPage} 
            />
          )}

          {activeTab === 'stats' && (
            <EvolutionStatsTab activePatientId={activePatientId} />
          )}
        </div>
      </div>

      <PatientFormModal
        isOpen={editPatientModalOpen} 
        onClose={() => setEditPatientModalOpen(false)} 
        editingPatient={patient} 
        formData={formData} 
        setFormData={setFormData} 
        onSubmit={handleSavePatientEdit} 
        isPending={updatePatientMutation.isPending} 
        isFormValid={formData.nome_completo.length > 3} 
        handleCpfChange={(e) => setFormData({...formData, documento_cpf: maskCPF(e.target.value)})} 
        handlePhoneChange={(e) => setFormData({...formData, telefone: maskPhone(e.target.value)})} 
      />

      <PatientHistoryDrawer />
    </div>
  );
}