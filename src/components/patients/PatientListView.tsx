import PatientFormModal from './PatientFormModal';
import PatientActionsMenu from './PatientActionsMenu';
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { Patient } from '../../types';
import { 
  usePatientsQuery, useCreatePatientMutation, useUpdatePatientMutation, useDeletePatientMutation,
  useProfilesQuery } from '../../hooks';
import Button from '../ui/Button';
import { profileService } from '../../services/profileService';

export default function PatientListView({ triggerToast }: { triggerToast: (message: string, patientId?: string, type?: 'success' | 'info') => void }) {
  const { searchPatientQuery, setSearchPatientQuery, setActivePatientId, openDeleteModal } = useUIStore();
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  const { data: patientsData, isLoading: patientsLoading } = usePatientsQuery(page, itemsPerPage);
  const { data: profiles, isLoading: profilesLoading } = useProfilesQuery();

  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'ativo' | 'inativo'>('ativo');

  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome_completo: '',
    documento_cpf: '',
    telefone: '',
    email: '',
    password: '',
    password_confirm: '',
    patologia_principal: '',
    observacoes_clinicas: '',
  });

  const createPatientMutation = useCreatePatientMutation();
  const updatePatientMutation = useUpdatePatientMutation();
  const deletePatientMutation = useDeletePatientMutation();

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, documento_cpf: maskCPF(e.target.value) });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, telefone: maskPhone(e.target.value) });
  };

  const isFormValid = useMemo(() => {
    const cpfClean = formData.documento_cpf.replace(/\D/g, '');
    const phoneClean = formData.telefone.replace(/\D/g, '');
    
    const basicValid = formData.nome_completo.length > 3 &&
                       cpfClean.length === 11 &&
                       phoneClean.length >= 10 &&
                       formData.patologia_principal.length > 2;

    if (editingPatient) return basicValid;
    
    return basicValid && 
           formData.email.includes('@') && 
           formData.password.length >= 6 && 
           formData.password === formData.password_confirm;
  }, [formData, editingPatient]);

  const handleOpenNewPatientModal = () => {
    setEditingPatient(null);
    setFormData({
      nome_completo: '',
      documento_cpf: '',
      telefone: '',
      email: '',
      password: '',
      password_confirm: '',
      patologia_principal: '',
      observacoes_clinicas: '',
    });
    setPatientModalOpen(true);
  };

  const handleOpenEditPatientModal = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveKebabId(null);
    const profile = profiles?.find((prof) => prof.id === patient.profile_id);
    setEditingPatient(patient);
    setFormData({
      nome_completo: profile?.nome_completo || '',
      documento_cpf: profile?.documento_cpf || '',
      telefone: profile?.telefone || '',
      email: '', 
      password: '',
      password_confirm: '',
      patologia_principal: patient.patologia_principal,
      observacoes_clinicas: patient.observacoes_clinicas,
    });
    setPatientModalOpen(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      if (editingPatient) {
        await profileService.update(editingPatient.profile_id, {
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          documento_cpf: formData.documento_cpf,
        });

        await updatePatientMutation.mutateAsync({
          id: editingPatient.id,
          updates: {
            patologia_principal: formData.patologia_principal,
            observacoes_clinicas: formData.observacoes_clinicas,
          },
        });
        triggerToast(`Dados de ${formData.nome_completo} atualizados!`);
      } else {
        await createPatientMutation.mutateAsync({
          nome_completo: formData.nome_completo,
          documento_cpf: formData.documento_cpf,
          telefone: formData.telefone,
          email: formData.email,
          password: formData.password,
          patologia_principal: formData.patologia_principal,
          observacoes_clinicas: formData.observacoes_clinicas,
        });
        triggerToast(`Paciente ${formData.nome_completo} cadastrado!`);
      }
      setPatientModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || err?.error_description || "Erro inesperado ao salvar. Verifique os dados.";
      alert(`Erro: ${msg}`);
    }
  };

  const handleInactivatePatient = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveKebabId(null);
    const profile = profiles?.find((prof) => prof.id === patient.profile_id);
    openDeleteModal(
      'Inativar Paciente',
      `Deseja inativar "${profile?.nome_completo}"?`,
      () => deletePatientMutation.mutate(patient.id)
    );
  };

  if (patientsLoading || profilesLoading) {
    return <div className="py-20 text-center text-xs font-bold text-neutral-400 animate-pulse">Carregando base de dados...</div>;
  }

  const patients = patientsData?.data || [];
  const filteredPatients = patients.filter((p) => {
    if (p.status !== activeTab) return false;
    const prof = profiles?.find((prof) => prof.id === p.profile_id);
    const term = searchPatientQuery.toLowerCase();
    return prof?.nome_completo.toLowerCase().includes(term) || prof?.documento_cpf?.includes(term);
  });

  const totalPatientsCount = patientsData?.total || 0;
  const startResult = totalPatientsCount === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endResult = Math.min(page * itemsPerPage, totalPatientsCount);
  const totalPages = Math.max(1, Math.ceil(totalPatientsCount / itemsPerPage));

  return (
    <div className="min-w-0 w-full space-y-8 animate-fadeIn">
      <div className="min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-xs">
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchPatientQuery}
            onChange={(e) => setSearchPatientQuery(e.target.value)}
            placeholder="Buscar por Nome ou CPF..."
            className="w-full bg-slate-50 dark:bg-neutral-800 border-none rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-neutral-800 dark:text-white outline-none focus:ring-1 focus:ring-[#0a5c4e]"
          />
        </div>
        <Button id="add-patient-btn" onClick={handleOpenNewPatientModal} icon={<Plus strokeWidth={3} />} className="w-full md:w-auto shrink-0 rounded-full">
          Novo Paciente
        </Button>
      </div>

      <div className="min-w-0 max-w-full overflow-x-auto flex gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-2xl w-full sm:w-fit border border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => { setActiveTab('ativo'); setPage(1); }}
          className={`shrink-0 whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'ativo'
              ? 'bg-white dark:bg-neutral-800 text-[#0a5c4e] dark:text-teal-400 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Pacientes Ativos
        </button>
        <button
          onClick={() => { setActiveTab('inativo'); setPage(1); }}
          className={`shrink-0 whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'inativo'
              ? 'bg-white dark:bg-neutral-800 text-[#0a5c4e] dark:text-teal-400 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Inativos
        </button>
      </div>

      <div className="min-w-0 max-w-full bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-850 text-[10px] font-black uppercase text-neutral-400 tracking-widest border-b border-neutral-100 dark:border-neutral-800">
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">CPF</th>
              <th className="px-6 py-4">Telefone</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
            {filteredPatients.map((p) => {
              const prof = profiles?.find((prof) => prof.id === p.profile_id);
              const isKebabActive = activeKebabId === p.id;
              return (
                <tr key={p.id} onClick={() => setActivePatientId(p.id)} className="hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center font-black text-teal-700 dark:text-teal-400 text-xs">
                        {prof?.nome_completo.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-900 dark:text-white group-hover:text-[#0a5c4e] transition-colors">{prof?.nome_completo}</p>
                        <p className="text-[10px] font-bold text-neutral-400 mt-0.5">{p.patologia_principal}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-medium text-neutral-500">{prof?.documento_cpf || '-'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-neutral-500">{prof?.telefone || '-'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-neutral-500">{prof?.email || '-'}</td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <PatientActionsMenu
                      isOpen={isKebabActive}
                      onToggle={() => setActiveKebabId(isKebabActive ? null : p.id)}
                      onClose={() => setActiveKebabId(null)}
                      onEdit={(e) => handleOpenEditPatientModal(p, e)}
                      onDelete={(e) => handleInactivatePatient(p, e)}
                      status={p.status}
                      onReactivate={(e) => {
                        e.stopPropagation();
                        updatePatientMutation.mutate({ id: p.id, updates: { status: 'ativo' } });
                        triggerToast(`Paciente ${prof?.nome_completo} reativado!`);
                        setActiveKebabId(null);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RODAPÉ DE PAGINAÇÃO PADRONIZADO E SEMPRE VISÍVEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800/40">
        <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
          Mostrando <span className="font-bold text-neutral-700 dark:text-neutral-300">{startResult}</span> a <span className="font-bold text-neutral-700 dark:text-neutral-300">{endResult}</span> de <span className="font-bold text-neutral-700 dark:text-neutral-300">{totalPatientsCount}</span> resultados
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                page === p
                  ? 'bg-[#0a5c4e] text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 text-neutral-400 hover:bg-neutral-50 border border-neutral-100 dark:border-neutral-850'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PatientFormModal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        editingPatient={editingPatient}
        formData={formData}
        setFormData={setFormData as any}
        onSubmit={handleSavePatient}
        isPending={createPatientMutation.isPending || updatePatientMutation.isPending}
        isFormValid={isFormValid}
        handleCpfChange={handleCpfChange}
        handlePhoneChange={handlePhoneChange}
      />
    </div>
  );
}