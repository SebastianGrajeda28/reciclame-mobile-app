import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import {
  syncInstructionsCache,
  type CachedInstructionStep,
} from '../services/instructionsCache';

type State = {
  byWasteTypeId: Record<string, CachedInstructionStep[]>;
  loading: boolean;
  error: Error | null;
};

/**
 * Syncs the instructions cache once per session (on login / app start).
 * Subsequent calls within the same session return the in-memory map instantly.
 *
 * Usage:
 *   const { byWasteTypeId, loading } = useInstructionsCache();
 *   const steps = byWasteTypeId[wasteTypeId] ?? [];
 */
export function useInstructionsCache(): State {
  const { session, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ byWasteTypeId: {}, loading: true, error: null });
  // Track which session id we already synced for — avoids re-fetching on re-renders
  const syncedForRef = useRef<string | null>(null);

  useEffect(() => {
    // Wait until auth is resolved
    if (authLoading) return;

    const sessionKey = session?.user?.id ?? '__anon__';

    // Already synced for this session
    if (syncedForRef.current === sessionKey) return;
    syncedForRef.current = sessionKey;

    let cancelled = false;

    async function sync() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const byWasteTypeId = await syncInstructionsCache();
        if (!cancelled) setState({ byWasteTypeId, loading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            byWasteTypeId: {},
            loading: false,
            error: err instanceof Error ? err : new Error('Error al cargar instrucciones'),
          });
        }
      }
    }

    sync();
    return () => { cancelled = true; };
  }, [session?.user?.id, authLoading]);

  return state;
}
