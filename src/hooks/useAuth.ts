import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/src/services/supabase/client';

type AuthState = {
  session: Session | null;
  loading: boolean;
};

/**
 * Reactive hook that tracks the current Supabase auth session.
 *
 * Resolves the initial session from storage, then subscribes to auth state
 * changes so the UI updates automatically on login, logout, and token refresh.
 *
 * @returns `session` — the active Supabase session, or null if unauthenticated.
 * @returns `loading` — true while the initial session check is in progress.
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}
