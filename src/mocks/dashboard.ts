export const mockPainReports = [
  {
    id: 'pr-1',
    patientId: 'pat-beatriz',
    name: 'Beatriz Santos',
    eva: 8,
    patologia: 'Estabilização Lombar',
    relato: 'Dor lombar aguda ao tentar a prancha isométrica aos 15 segundos.',
    data: 'Hoje, 11:20',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWOBy3SNYSsdcvmZ_ZSTMfaZ0X6uTEhe_54UZKeU8deM8s-YkO9buBwOv4w8ivpFXa8WCrQC9_TC-pB2wGx3po-c2inMjM6_AnzcOlPAMnOBvv09OhT4kuPXTBbkkiZdDrsZ3W4GawAo3k7HapWuoYXf9hqgVhZQbzYq44ymygvwkV0MMkLm2S4-YKx3Nzc1FtiDlmUQGNiq5ZdjnBhIYYamF7OsjrdvwbtDgfaudEc3KXKIesvRo9'
  },
  {
    id: 'pr-2',
    patientId: 'pat-carol',
    name: 'Carlos Mendes',
    eva: 9,
    patologia: 'Fortalecimento MMII',
    relato: 'Finco doloroso na patela na descida do agachamento búlgaro.',
    data: 'Hoje, 09:45',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'pr-3',
    patientId: 'pat-ricardo',
    name: 'Ricardo Oliveira',
    eva: 5,
    patologia: 'Pós-Operatório Ombro',
    relato: 'Desconforto leve no final da amplitude de movimento de abdução.',
    data: 'Ontem, 16:30',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIRS_hp8aZoj6UbShf5Fd-4x49q-DawdEDdarZYIsef_nYDGCZgqFTqfgyfzL0WrD5jWl2XUoOgLFls8zJFFAKEo9e_m48Dq8b26_8xmsWjYiPDblPPv9pn4jsr_remF8bTFGv1HQovJRIjeOJ0NoOkTu3MBCXaAA2iPi0lVeiK55x5CqgrbDe3YB1Lab78RLX8CNuZ0_Jf81CFMI_d6MCxYKWVXVQUa_Jt6VicMy91ruiO6tjhnVK'
  },
  {
    id: 'pr-4',
    patientId: 'pat-helena',
    name: 'Helena Ferreira',
    eva: 3,
    patologia: 'Fortalecimento MMII',
    relato: 'Cansaço muscular nos posteriores de coxa, sem pontadas de dor.',
    data: 'Ontem, 14:20',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHQ8PuT8ZsnCz73Xo-lx2Q5Tmo4XxaLKW_uh1qMz5MkA3oZ96YdIZJ9CmRKigBvyZUu8Yd_fv-U1tF7DtIfsGX11chAAgytEWqEkANiYkbLywSx-9cBg1ye89OuCAFdvx2_gfhUsMVrNQGzswc3fw5lz_78j6qfmZJ8BCjRb8FBRQG15wy9FuKB6zs3w-VjnwBBlQDgeIOycW0g9TAgo-5shalB2Gz9qkJljEhW2HBYSglZbioWtvJ'
  }
];

export const mockChartData = [
  { label: 'Seg', pct: 85, completed: 17, prescribed: 20 },
  { label: 'Ter', pct: 92, completed: 23, prescribed: 25 },
  { label: 'Qua', pct: 78, completed: 14, prescribed: 18 },
  { label: 'Qui', pct: 88, completed: 22, prescribed: 25 },
  { label: 'Sex', pct: 95, completed: 19, prescribed: 20 },
  { label: 'Sáb', pct: 60, completed: 6, prescribed: 10 },
  { label: 'Dom', pct: 50, completed: 5, prescribed: 10 },
];

export const mockPatientExercises = [
  {
    id: 'pre-exe-1',
    nome: 'Alongamento Escapular (Manguito Rotador)',
    descricao: 'Realize a rotação externa do ombro mantendo o cotovelo colado ao tronco com o elástico.',
    series: 3,
    repeticoes: 15,
    tempo_descanso: 30,
    midia_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    local_execucao: 'estudio',
  },
  {
    id: 'pre-exe-2',
    nome: 'Mobilidade Ombro com Bastão',
    descricao: 'Eleve o bastão acima da cabeça mantendo os cotovelos estendidos, respeitando o limite articular.',
    series: 3,
    repeticoes: 12,
    tempo_descanso: 45,
    midia_url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600',
    local_execucao: 'estudio',
  },
  {
    id: 'pre-exe-3',
    nome: 'Aquecimento Muscular / Prancha',
    descricao: 'Mantenha o alinhamento da coluna e contraia o abdômen por 30 segundos.',
    series: 2,
    repeticoes: 10,
    tempo_descanso: 30,
    midia_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600',
    local_execucao: 'estudio',
  },
  {
    id: 'pre-exe-4',
    nome: 'Mobilidade Gato-Camelo (Cat-Cow)',
    descricao: 'Em quatro apoios, expire enquanto empurra o chão e arredonda as costas.',
    series: 2,
    repeticoes: 12,
    tempo_descanso: 45,
    midia_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    local_execucao: 'casa',
  }
];

export const mockRecentWorkouts = [
  {
    id: 'rw-1',
    patientId: 'pat-ricardo',
    name: 'Ricardo Oliveira',
    protocol: 'Pós-Operatório Ombro',
    time: 'Hoje, 10:30',
    status: 'Concluído',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIRS_hp8aZoj6UbShf5Fd-4x49q-DawdEDdarZYIsef_nYDGCZgqFTqfgyfzL0WrD5jWl2XUoOgLFls8zJFFAKEo9e_m48Dq8b26_8xmsWjYiPDblPPv9pn4jsr_remF8bTFGv1HQovJRIjeOJ0NoOkTu3MBCXaAA2iPi0lVeiK55x5CqgrbDe3YB1Lab78RLX8CNuZ0_Jf81CFMI_d6MCxYKWVXVQUa_Jt6VicMy91ruiO6tjhnVK'
  },
  {
    id: 'rw-2',
    patientId: 'pat-beatriz',
    name: 'Beatriz Santos',
    protocol: 'Estabilização Lombar',
    time: 'Ontem, 16:45',
    status: 'Pendente',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWOBy3SNYSsdcvmZ_ZSTMfaZ0X6uTEhe_54UZKeU8deM8s-YkO9buBwOv4w8ivpFXa8WCrQC9_TC-pB2wGx3po-c2inMjM6_AnzcOlPAMnOBvv09OhT4kuPXTBbkkiZdDrsZ3W4GawAo3k7HapWuoYXf9hqgVhZQbzYq44ymygvwkV0MMkLm2S4-YKx3Nzc1FtiDlmUQGNiq5ZdjnBhIYYamF7OsjrdvwbtDgfaudEc3KXKIesvRo9'
  },
  {
    id: 'rw-3',
    patientId: 'pat-helena',
    name: 'Helena Ferreira',
    protocol: 'Fortalecimento MMII',
    time: 'Ontem, 14:00',
    status: 'Concluído',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHQ8PuT8ZsnCz73Xo-lx2Q5Tmo4XxaLKW_uh1qMz5MkA3oZ96YdIZJ9CmRKigBvyZUu8Yd_fv-U1tF7DtIfsGX11chAAgytEWqEkANiYkbLywSx-9cBg1ye89OuCAFdvx2_gfhUsMVrNQGzswc3fw5lz_78j6qfmZJ8BCjRb8FBRQG15wy9FuKB6zs3w-VjnwBBlQDgeIOycW0g9TAgo-5shalB2Gz9qkJljEhW2HBYSglZbioWtvJ'
  }
];
