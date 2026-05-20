import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/src/services/supabase/client';

type AuthState = {
  session: Session | null;
  loading: boolean;
};

/**
 * Tracks the current Supabase auth session reactively.
 *
 * @returns `session` — active session or null if unauthenticated.
 * @returns `loading` — true while the initial session resolves.
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    }).catch(() => {
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
