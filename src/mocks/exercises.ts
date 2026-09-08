import { Exercise } from '../types';

export const mockExercises: Exercise[] = [
  {
    id: 'exe-rotacao-externa',
    physio_id: null,
    nome: 'Rotação Externa',
    descricao: 'Exercício de fortalecimento do manguito rotador com foco na estabilização dinâmica da articulação do ombro.',
    midia_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    tags_aparelho: ['Elástico'],
    tags_patologia: ['Ombro'],
    tags_objetivo: ['Fortalecimento'],
    status: 'ativo'
  },
  {
    id: 'exe-extensao-terminal',
    physio_id: null,
    nome: 'Extensão Terminal',
    descricao: 'Ativação de Vasto Medial Oblíquo para reabilitação femoropatelar e ganho de extensão terminal de joelho.',
    midia_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600',
    tags_aparelho: ['Caneleira'],
    tags_patologia: ['Joelho'],
    tags_objetivo: ['Fortalecimento'],
    status: 'ativo'
  },
  {
    id: 'exe-gato-camelo',
    physio_id: null,
    nome: 'Gato-Camelo',
    descricao: 'Mobilização segmentar da coluna vertebral para alívio de tensões, controle motor e lubrificação facetária.',
    midia_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    tags_aparelho: ['Colchonete'],
    tags_patologia: ['Coluna'],
    tags_objetivo: ['Mobilidade'],
    status: 'ativo'
  },
  {
    id: 'exe-equilibrio-unipodal',
    physio_id: null,
    nome: 'Equilíbrio Unipodal',
    descricao: 'Treino de propriocepção em superfície instável para reabilitação ligamentar e estabilização ativa do tornozelo.',
    midia_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    tags_aparelho: ['Nenhum (Livre)'],
    tags_patologia: ['Tornozelo'],
    tags_objetivo: ['Estabilização'],
    status: 'ativo'
  },
  {
    id: 'exe-agachamento-gl',
    physio_id: 'physio-123',
    nome: 'Agachamento Glúteo',
    descricao: 'Padrão de movimento fundamental com ênfase na ativação das cadeias musculares posteriores e do complexo do quadril.',
    midia_url: 'https://images.unsplash.com/photo-1561049501-e1f96bdd98ee?auto=format&fit=crop&q=80&w=600',
    tags_aparelho: ['Mini-band'],
    tags_patologia: ['Funcional'],
    tags_objetivo: ['Fortalecimento'],
    status: 'ativo'
  },
  {
    id: 'exe-preensao-isometr',
    physio_id: null,
    nome: 'Preensão Isométrica',
    descricao: 'Fortalecimento da musculatura intrínseca da mão e reabilitação de tendinopatias e flexores dos dedos.',
    midia_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    tags_aparelho: ['Elástico'],
    tags_patologia: ['Mão/Pulso'],
    tags_objetivo: ['Fortalecimento'],
    status: 'ativo'
  }
];
