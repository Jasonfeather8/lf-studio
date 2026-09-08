import { Patient } from '../types';

export const mockPatients: Patient[] = [
  {
    id: 'pat-ricardo',
    profile_id: 'patient-ricardo',
    physio_id: 'physio-123',
    patologia_principal: 'Pós-Operatório Ombro (Manguito Rotador)',
    observacoes_clinicas: 'Paciente em fase intermediária de reabilitação pós-sutura de manguito rotador. Amplitude de movimento ativa em evolução. Evitar cargas excessivas em abdução.',
    status: 'ativo'
  },
  {
    id: 'pat-beatriz',
    profile_id: 'patient-beatriz',
    physio_id: 'physio-123',
    patologia_principal: 'Estabilização Lombar (Instabilidade Segmentar)',
    observacoes_clinicas: 'Paciente relata dor lombar crônica intermitente. Foco em ativação de transverso do abdômen e multífidos. Progressão lenta de exercícios de flexão.',
    status: 'ativo'
  },
  {
    id: 'pat-helena',
    profile_id: 'patient-helena',
    physio_id: 'physio-123',
    patologia_principal: 'Fortalecimento MMII (Osteoartrose de Joelho)',
    observacoes_clinicas: 'Paciente idosa com quadro de osteoartrose grau II em ambos os joelhos. Fortalecimento essencial de quadríceps e estabilizadores de quadril para controle de dor.',
    status: 'ativo'
  }
];
