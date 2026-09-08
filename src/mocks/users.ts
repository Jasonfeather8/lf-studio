import { Profile } from '../types';

export const mockProfiles: Profile[] = [
  {
    id: 'physio-123',
    role: 'physio',
    nome_completo: 'Dr. Silva (Admin User)',
    documento_cpf: '123.456.789-00',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHYBWh6yjM6NDy6yP7jmgdWifD4Wpsefp-AwCQ3F7JxWwbAbkIODU5SVf0MnSmJkUTbkFWx0IIuG_CvIuLhlaoTouLFPZ2u5P_vnjAuxjO49fzx3Uko2Bo2D45h2A93sS8qrOVpMfO4zO2K76y6g6Umgrvozj0km0N_gpHNTtc46ouVsV3AGmpwPZbDoMtjCrXsdXRfXcWHxko1JGe8YQLPYtvd4LauplHRtGACB0iGN6DyjlQa_Zo',
    telefone: '(11) 99999-8888',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'patient-ricardo',
    role: 'patient',
    nome_completo: 'Ricardo Oliveira',
    documento_cpf: '222.333.444-55',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIRS_hp8aZoj6UbShf5Fd-4x49q-DawdEDdarZYIsef_nYDGCZgqFTqfgyfzL0WrD5jWl2XUoOgLFls8zJFFAKEo9e_m48Dq8b26_8xmsWjYiPDblPPv9pn4jsr_remF8bTFGv1HQovJRIjeOJ0NoOkTu3MBCXaAA2iPi0lVeiK55x5CqgrbDe3YB1Lab78RLX8CNuZ0_Jf81CFMI_d6MCxYKWVXVQUa_Jt6VicMy91ruiO6tjhnVK',
    telefone: '(11) 98888-1111',
    created_at: '2024-02-15T09:30:00Z'
  },
  {
    id: 'patient-beatriz',
    role: 'patient',
    nome_completo: 'Beatriz Santos',
    documento_cpf: '333.444.555-66',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWOBy3SNYSsdcvmZ_ZSTMfaZ0X6uTEhe_54UZKeU8deM8s-YkO9buBwOv4w8ivpFXa8WCrQC9_TC-pB2wGx3po-c2inMjM6_AnzcOlPAMnOBvv09OhT4kuPXTBbkkiZdDrsZ3W4GawAo3k7HapWuoYXf9hqgVhZQbzYq44ymygvwkV0MMkLm2S4-YKx3Nzc1FtiDlmUQGNiq5ZdjnBhIYYamF7OsjrdvwbtDgfaudEc3KXKIesvRo9',
    telefone: '(11) 97777-2222',
    created_at: '2024-03-10T14:20:00Z'
  },
  {
    id: 'patient-helena',
    role: 'patient',
    nome_completo: 'Helena Ferreira',
    documento_cpf: '444.555.666-77',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHQ8PuT8ZsnCz73Xo-lx2Q5Tmo4XxaLKW_uh1qMz5MkA3oZ96YdIZJ9CmRKigBvyZUu8Yd_fv-U1tF7DtIfsGX11chAAgytEWqEkANiYkbLywSx-9cBg1ye89OuCAFdvx2_gfhUsMVrNQGzswc3fw5lz_78j6qfmZJ8BCjRb8FBRQG15wy9FuKB6zs3w-VjnwBBlQDgeIOycW0g9TAgo-5shalB2Gz9qkJljEhW2HBYSglZbioWtvJ',
    telefone: '(11) 96666-3333',
    created_at: '2024-04-05T08:00:00Z'
  }
];
