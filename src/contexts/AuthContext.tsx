import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, Profile } from '@/types';
import { useUIStore } from '@/store/uiStore';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser } = useUIStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthChange(session);
    };

    const handleAuthChange = (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      const userRole = (session?.user?.app_metadata?.role || session?.user?.user_metadata?.role) as UserRole;
      setRole(userRole ?? null);

      if (session?.user) {
        // Map Auth metadata to Profile object for UI compatibility
        const profile: Profile = {
          id: session.user.id,
          role: userRole || 'patient',
          nome_completo: session.user.user_metadata?.nome_completo || session.user.email || '',
          documento_cpf: '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          telefone: '',
          created_at: session.user.created_at,
        };
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    // Limpar localStorage para evitar que persistências do Zustand mantenham roles antigas
    localStorage.removeItem('lf_studio_ui_store');
    // Redirecionar e recarregar para limpar todo o estado da memória
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
