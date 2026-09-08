import { Profile } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const profileService = {
  getAll: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data as Profile[];
  },

  getById: async (id: string): Promise<Profile | undefined> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return undefined;
    return data as Profile;
  },

  create: async (profile: Omit<Profile, 'created_at'>): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  update: async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
