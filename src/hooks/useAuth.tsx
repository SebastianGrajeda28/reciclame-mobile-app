import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/src/services/supabase/client';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  offlineMode: boolean;
  setOfflineMode: (val: boolean) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Context provider that manages the reactive authentication session
 * and offline status globally.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === 'SIGNED_OUT') {
        setOfflineMode(false);
        router.replace('/');
      } else if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
        newSession?.user
      ) {
        const user = newSession.user;
        const checkAndCreateProfile = async () => {
          try {
            // 1. Ensure user is in public.users table
            const { error: userError } = await supabase
              .from('users')
              .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });

            if (userError) {
              console.error('Error ensuring user in users table:', userError);
              return;
            }

            // 2. Check if user profile exists in public.user_profiles
            const { data: profile, error: profileSelectError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();

            if (profileSelectError) {
              console.error('Error checking user profile:', profileSelectError);
              return;
            }

            // 3. If no profile exists, create it
            if (!profile) {
              const displayName =
                user.user_metadata?.full_name ??
                user.user_metadata?.name ??
                user.user_metadata?.display_name ??
                user.email?.split('@')[0] ??
                'Usuario';

              const { error: profileInsertError } = await supabase
                .from('user_profiles')
                .insert({ user_id: user.id, alias: displayName });

              if (profileInsertError) {
                console.error('Error creating user profile:', profileInsertError);
              }
            }
          } catch (err) {
            console.error('Error in profile validation flow:', err);
          }
        };

        checkAndCreateProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Signs the current user out, clears any session tokens in the Supabase client,
   * resets the local offline mode, and redirects the user to the login screen.
   */
  const signOut = async () => {
    setOfflineMode(false);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{ session, loading, offlineMode, setOfflineMode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the global authentication session, loading state,
 * offline mode state, and signOut functions.
 *
 * @returns `session` — active session or null if unauthenticated.
 * @returns `loading` — true while the initial session resolves.
 * @returns `offlineMode` — true if user has bypassed authentication offline.
 * @returns `setOfflineMode` — function to update offline status.
 * @returns `signOut` — function to log the user out and redirect.
 * @throws {Error} if used outside of AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
