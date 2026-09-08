import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

import PatientListView from '../components/patients/PatientListView';
import PatientDetailView from '../components/patients/PatientDetailView';
import PrescriptionFormView from '../components/patients/PrescriptionFormView';
import { useUIStore } from '../store/uiStore';
import {
  usePatientsQuery,
  useProfilesQuery,
  usePrescriptionsQuery,
  usePatientExamsQuery,
  useExercisesQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useCreateExamMutation,
  useDeleteExamMutation,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
  usePatientAdherenceQuery,
  usePrescriptionExercisesQuery,
} from '../hooks';
import {
  GripVertical,
  Search,
  Plus,
  User,
  Users,
  Phone,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  MoreVertical,
  Dumbbell,
  Timer,
  CheckCircle,
  Clock,
  ArrowRight,
  ClipboardList,
  Calendar,
  AlertCircle,
  Copy,
  Edit,
  UploadCloud,
  Eye,
  Download,
  SlidersHorizontal,
  Share,
  X,
  FileDown,
  RotateCcw,
  Check,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Filter,
 } from 'lucide-react';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise, PrescriptionExercise, Patient } from '../types';
import { profileService } from '../services/profileService';

export default function Patients() {
  const {
    activePatientId,
    setActivePatientId,
  } = useUIStore();

  // Control state for nested views
  const [prescriptionFormOpen, setPrescriptionFormOpen] = useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [duplicatePrescriptionId, setDuplicatePrescriptionId] = useState<string | null>(null);

  // Parent-level toast state (Heurística #1 - Visibilidade do Status do Sistema)
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    patientId?: string;
    type: 'success' | 'info';
  } | null>(null);

  const triggerToast = (message: string, patientId?: string, type: 'success' | 'info' = 'success') => {
    setToast({ isOpen: true, message, patientId, type });
  };

  useEffect(() => {
    if (toast?.isOpen) {
      const timer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, isOpen: false } : null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast?.isOpen]);

  const renderContent = () => {
    if (activePatientId) {
      if (prescriptionFormOpen) {
        return (
          <PrescriptionFormView
            editingPrescriptionId={editingPrescriptionId}
            duplicatePrescriptionId={duplicatePrescriptionId}
            onBack={() => {
              setPrescriptionFormOpen(false);
              setEditingPrescriptionId(null);
              setDuplicatePrescriptionId(null);
            }}
            triggerToast={triggerToast}
          />
        );
      }
      return (
        <PatientDetailView
          onOpenPrescriptionForm={(editId, dupId) => {
            setEditingPrescriptionId(editId || null);
            setDuplicatePrescriptionId(dupId || null);
            setPrescriptionFormOpen(true);
          }}
          triggerToast={triggerToast}
        />
      );
    }

    return <PatientListView triggerToast={triggerToast} />;
  };

  return (
    <>
      {renderContent()}

      {/* Global Toast Notification (Heurística #1 - Visibilidade do Status do Sistema) */}
      <AnimatePresence>
        {toast?.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-neutral-900/95 dark:bg-neutral-950/95 text-white p-4.5 rounded-2xl shadow-2xl border border-neutral-800/80 dark:border-neutral-800 flex items-center justify-between gap-5 max-w-sm backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[3px]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-100">{toast.message}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Operação concluída com sucesso no sistema.</p>
              </div>
            </div>
            {toast.patientId && (
              <button
                onClick={() => {
                  setActivePatientId(toast.patientId!);
                  setToast(null);
                }}
                className="px-3 py-1.5 bg-[#52bfa6] hover:bg-[#43a18b] text-neutral-950 font-black text-[10px] rounded-lg cursor-pointer transition-colors shrink-0 whitespace-nowrap shadow-xs"
              >
                Iniciar Avaliação
              </button>
            )}
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

