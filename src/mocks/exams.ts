import { PatientExam } from '../types';

export const mockExams: PatientExam[] = [
  {
    id: 'exam-1',
    patient_id: 'pat-ricardo',
    titulo: 'Raio-X Coluna Lombar.pdf',
    arquivo_url: '#',
    data_upload: '2023-10-15T12:00:00Z',
    status_sincronizacao: true
  },
  {
    id: 'exam-2',
    patient_id: 'pat-ricardo',
    titulo: 'Ressonância Magnética Joelho.jpg',
    arquivo_url: '#',
    data_upload: '2023-09-02T12:00:00Z',
    status_sincronizacao: true
  },
  {
    id: 'exam-3',
    patient_id: 'pat-ricardo',
    titulo: 'Laudo Fisioterápico Inicial.pdf',
    arquivo_url: '#',
    data_upload: '2023-08-10T12:00:00Z',
    status_sincronizacao: true
  }
];
