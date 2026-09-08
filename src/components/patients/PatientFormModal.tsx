import React, { useState } from 'react';
import { Mail, Phone, Eye, EyeOff, Lock, AlertCircle, Save } from 'lucide-react';
import Modal from '../Modal';
import { Patient } from '../../types';

export interface PatientFormData {
    nome_completo: string;
    documento_cpf: string;
    telefone: string;
    email: string;
    password?: string;
    password_confirm?: string;
    patologia_principal: string;
    observacoes_clinicas?: string;
}

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPatient: Patient | null;
  formData: PatientFormData;
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isPending?: boolean;
  isFormValid?: boolean;
  handleCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PatientFormModal({ 
  isOpen, 
  onClose, 
  editingPatient, 
  formData, 
  setFormData, 
  onSubmit, 
  isPending = false,
  isFormValid = false,
  handleCpfChange,
  handlePhoneChange
}: PatientFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPatient ? "Editar Cadastro" : "Cadastrar Novo Paciente"}
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-5 pt-2">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nome Completo</label>
          <input
            type="text"
            required
            value={formData.nome_completo}
            onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
            className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none"
            placeholder="Ex: João da Silva Santos"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">CPF</label>
            <input
              type="text"
              required
              value={formData.documento_cpf}
              onChange={handleCpfChange}
              className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none"
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
            <input
              type="tel"
              required
              value={formData.telefone}
              onChange={handlePhoneChange}
              className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        {!editingPatient && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none"
                placeholder="paciente@exemplo.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Definir Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none pr-12"
                    placeholder="Mín. 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password_confirm}
                  onChange={e => setFormData({ ...formData, password_confirm: e.target.value })}
                  className={`w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold outline-none ${
                    formData.password_confirm && formData.password !== formData.password_confirm ? 'border-red-500' : ''
                  }`}
                  placeholder="Repita a senha"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Patologia / Motivo Principal</label>
          <input
            type="text"
            required
            value={formData.patologia_principal}
            onChange={e => setFormData({ ...formData, patologia_principal: e.target.value })}
            className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none"
            placeholder="Ex: Pós-operatório Ombro"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Observações Clínicas</label>
          <textarea
            value={formData.observacoes_clinicas}
            onChange={e => setFormData({ ...formData, observacoes_clinicas: e.target.value })}
            className="w-full bg-[#f4f7f6] dark:bg-neutral-850 border border-transparent focus:ring-1 focus:ring-[#0a5c4e] rounded-2xl px-5 py-3.5 text-xs font-bold text-neutral-800 dark:text-white outline-none resize-none"
            rows={3}
            placeholder="Histórico, restrições ou cuidados especiais..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button type="button" onClick={onClose} className="px-5 py-3 text-xs font-black text-neutral-400 hover:text-neutral-600 transition-colors">Cancelar</button>
          <button
            type="submit"
            disabled={isPending || !isFormValid}
            className={`bg-[#0a5c4e] text-white px-8 py-3.5 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center gap-2 ${
              !isFormValid || isPending ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-[#07473c] active:scale-95'
            }`}
          >
            {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            <span>{editingPatient ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}