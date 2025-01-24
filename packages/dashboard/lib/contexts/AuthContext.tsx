'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthState, Profile, Role } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';

const initialState: AuthState = {
  isLoading: true,
  session: null,
  user: null,
  profile: null,
  roles: [],
};

const AuthContext = createContext<{
  state: AuthState;
  signOut: () => Promise<void>;
}>({
  state: initialState,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setState({ ...initialState, isLoading: false });
          return;
        }

        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Get user roles
        const { data: roles } = await supabase
          .from('roles')
          .select(`
            id,
            name,
            permissions,
            user_roles!inner(user_id)
          `)
          .eq('user_roles.user_id', session.user.id);

        setState({
          isLoading: false,
          session,
          user: session.user,
          profile,
          roles: roles || [],
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setState({ ...initialState, isLoading: false });
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({ ...initialState, isLoading: false });
          router.push('/auth/signin');
        } else if (session) {
          await fetchUserData();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
