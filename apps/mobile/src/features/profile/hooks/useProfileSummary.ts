import { useCallback, useEffect, useState } from 'react';

import { getProfileSummary, type ProfileSummary } from '@/src/features/profile/api/summary';
import { useAuth } from '@/src/hooks/useAuth';

type State = {
  data: ProfileSummary | null;
  loading: boolean;
  error: string | null;
};

/**
 * Hook para gestionar la carga y estado del resumen consolidado del perfil.
 * Utiliza el userId del usuario autenticado actual.
 */
export function useProfileSummary() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!userId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getProfileSummary(userId);
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e.message : 'Error al cargar el resumen del perfil.',
      });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
