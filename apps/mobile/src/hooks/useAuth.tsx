import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  createSessionFromUrl,
  isOAuthRedirectUrl,
} from '@/src/features/auth/services/googleAuth';
import { supabase } from '@/src/services/supabase/client';

const CACHED_USER_KEY = '@reciclame/cached_user';

export type CachedUser = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  offlineMode: boolean;
  /** Datos del último usuario autenticado, disponibles aunque no haya red. */
  cachedUser: CachedUser | null;
  setOfflineMode: (val: boolean) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [cachedUser, setCachedUser] = useState<CachedUser | null>(null);

  useEffect(() => {
    // Carga el usuario cacheado del último login para mostrarlo mientras carga
    AsyncStorage.getItem(CACHED_USER_KEY)
      .then((raw) => {
        if (raw) {
          const user = JSON.parse(raw) as CachedUser;
          setCachedUser(user);
          console.log(`[AUTH] Usuario cacheado cargado: ${user.email} (id=${user.id})`);
        } else {
          console.log('[AUTH] No hay usuario cacheado en AsyncStorage');
        }
      })
      .catch(() => {});

    console.log('[AUTH] Restaurando sesion de Supabase...');
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          console.log(`[AUTH] ✓ Sesion activa: userId=${data.session.user.id}`);
          setSession(data.session);
        } else {
          console.log('[AUTH] Sin sesion activa (usuario no autenticado o token expirado)');
        }
      })
      .catch((e) => console.warn('[AUTH] Error al restaurar sesion:', e))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`[AUTH] onAuthStateChange: evento=${event}`);
      setSession(newSession);

      if (newSession?.user) {
        persistCachedUser(newSession);
      }

      if (event === 'SIGNED_OUT') {
        console.log('[AUTH] Sesion cerrada — limpiando modo offline');
        setOfflineMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth deep links when Android cold-starts the app after Google sign-in.
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (!isOAuthRedirectUrl(url)) return;
      try {
        await createSessionFromUrl(url);
      } catch (error) {
        console.error('Error processing OAuth redirect:', error);
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) void handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleDeepLink(url);
    });

    return () => subscription.remove();
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
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, offlineMode, cachedUser, setOfflineMode, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
