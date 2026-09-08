import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '../types';

interface UIState {
  currentRoute: string;
  theme: 'light' | 'dark';
  currentUser: Profile | null;
  activePatientId: string | null;
  activePrescriptionId: string | null;
  searchPatientQuery: string;
  openModals: Record<string, boolean>;
  deleteModalConfig: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  };
  scrollPositions: Record<string, number>;
  companyWhatsapp: string;
  
  // Novo estado para o histórico (UX solicitada)
  isHistoryDrawerOpen: boolean;
  setHistoryDrawerOpen: (isOpen: boolean) => void;

  setCompanyWhatsapp: (phone: string) => void;

  // Actions
  setRoute: (route: string) => void;
  setCurrentUser: (user: Profile | null) => void;
  toggleTheme: () => void;
  setActivePatientId: (id: string | null) => void;
  setActivePrescriptionId: (id: string | null) => void;
  setSearchPatientQuery: (query: string) => void;
  setModalOpen: (modalId: string, isOpen: boolean) => void;
  openDeleteModal: (title: string, description: string, onConfirm: () => void) => void;
  closeDeleteModal: () => void;
  saveScrollPosition: (key: string, position: number) => void;
  logout: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentRoute: 'login',
      theme: 'light',
      currentUser: null,
      activePatientId: null,
      activePrescriptionId: null,
      searchPatientQuery: '',
      openModals: {},
      deleteModalConfig: {
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
      },
      scrollPositions: {},
      companyWhatsapp: '',
      isHistoryDrawerOpen: false,
      setHistoryDrawerOpen: (isOpen) => set({ isHistoryDrawerOpen: isOpen }),
      setCompanyWhatsapp: (phone) => set({ companyWhatsapp: phone }),

      setRoute: (route) => set({ currentRoute: route }),
      setCurrentUser: (user) => set({ currentUser: user }),
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: next };
        }),
      setActivePatientId: (id) => set({ activePatientId: id }),
      setActivePrescriptionId: (id) => set({ activePrescriptionId: id }),
      setSearchPatientQuery: (query) => set({ searchPatientQuery: query }),
      setModalOpen: (modalId, isOpen) =>
        set((state) => ({
          openModals: { ...state.openModals, [modalId]: isOpen },
        })),
      openDeleteModal: (title, description, onConfirm) =>
        set({
          deleteModalConfig: {
            isOpen: true,
            title,
            description,
            onConfirm,
          },
        }),
      closeDeleteModal: () =>
        set({
          deleteModalConfig: {
            isOpen: false,
            title: '',
            description: '',
            onConfirm: null,
          },
        }),
      saveScrollPosition: (key, position) =>
        set((state) => ({
          scrollPositions: { ...state.scrollPositions, [key]: position },
        })),
      logout: () =>
        set({
          currentUser: null,
          activePatientId: null,
          activePrescriptionId: null,
          currentRoute: 'login',
        }),
    }),
    {
      name: 'lf_studio_ui_store',
      partialize: (state) => ({
        currentRoute: state.currentRoute,
        theme: state.theme,
        activePatientId: state.activePatientId,
        activePrescriptionId: state.activePrescriptionId,
        scrollPositions: state.scrollPositions,
        companyWhatsapp: state.companyWhatsapp,
        isHistoryDrawerOpen: state.isHistoryDrawerOpen,
      }),
    }
  )
);