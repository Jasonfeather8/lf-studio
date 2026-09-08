import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { profileService } from '../services/profileService';
import { Camera, LogOut, Trash2, CheckCircle, User } from 'lucide-react';

export default function PatientProfile() {
  const { currentUser, setCurrentUser, logout, openDeleteModal } = useUIStore();
  const [nome, setNome] = useState(currentUser?.nome_completo || 'João Silva');
  const [telefone, setTelefone] = useState(currentUser?.telefone || '(11) 98765-4321');
  const [avatar, setAvatar] = useState(currentUser?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setSuccess('');

    try {
      const updatedProfile = await profileService.update(currentUser.id, {
        nome_completo: nome,
        telefone: telefone,
        avatar_url: avatar,
      });
      
      setCurrentUser(updatedProfile);
      setSuccess('Alterações salvas com sucesso!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = () => {
    // Generate a cute avatar mock
    const randomSeed = Math.floor(Math.random() * 100);
    const mockAvatars = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
    ];
    const picked = mockAvatars[randomSeed % mockAvatars.length];
    setAvatar(picked);
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    openDeleteModal(
      'Excluir Minha Conta?',
      'Esta ação é irreversível e excluirá permanentemente todos os seus dados de rotina, exames e progresso. Tem certeza?',
      async () => {
        try {
          await profileService.delete(currentUser.id);
          logout();
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-md mx-auto px-4">
      {/* Header section */}
      <div className="flex flex-col items-center text-center mt-4">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Configurações de Perfil</h2>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-emerald-200 dark:border-emerald-900/30">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Picture & Name */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-sm">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-neutral-400 dark:text-neutral-600" />
            )}
          </div>
          <button
            type="button"
            onClick={handleAvatarChange}
            className="absolute bottom-1 right-1 p-2.5 bg-[#0a5c4e] text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Mudar Foto"
          >
            <Camera className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
        <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-4">{nome}</h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mt-1">Paciente LF Studio</p>
      </div>

      {/* Main Input Form Card */}
      <form onSubmit={handleSave} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-900 dark:text-neutral-300 pl-1 block">Nome Completo</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-[#eef1f5] dark:bg-neutral-800 border border-transparent focus:border-[#0a5c4e] focus:ring-0 rounded-2xl px-4 py-3.5 text-xs text-neutral-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-900 dark:text-neutral-300 pl-1 block">Celular</label>
            <input
              type="text"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full bg-[#eef1f5] dark:bg-neutral-800 border border-transparent focus:border-[#0a5c4e] focus:ring-0 rounded-2xl px-4 py-3.5 text-xs text-neutral-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0a5c4e] hover:bg-[#07473c] text-white py-3.5 rounded-2xl font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </form>

      {/* Standalone Action buttons underneath the card */}
      <div className="flex flex-col items-center justify-center pt-2 space-y-4">
        <button
          type="button"
          onClick={logout}
          className="flex items-center justify-center gap-2 text-xs font-bold text-[#0a5c4e] hover:underline cursor-pointer transition-colors bg-transparent border-none py-1 px-4"
        >
          <LogOut className="w-4 h-4 stroke-[2.5px]" />
          <span>Sair</span>
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 hover:underline cursor-pointer transition-colors bg-transparent border-none py-1 px-4"
        >
          <Trash2 className="w-4 h-4 stroke-[2.5px]" />
          <span>Excluir Minha Conta</span>
        </button>
      </div>
    </div>
  );
}
