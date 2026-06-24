import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
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
      }
    });

    // Handle deep link OAuth callback when the external browser fallback is used.
    // Supabase redirects to reciclamemobileapp://oauth?code=... after Google auth.
    const handleDeepLink = async (url: string) => {
      if (!url.startsWith('reciclamemobileapp://oauth')) return;
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const linkingSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));

    return () => {
      subscription.unsubscribe();
      linkingSub.remove();
    };
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
    //router.replace('/');
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
