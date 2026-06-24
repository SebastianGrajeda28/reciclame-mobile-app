import { useCallback, useEffect, useState } from 'react';

import { getStreakActivity, type StreakActivity } from '@/src/features/profile/api/streak';
import { useAuth } from '@/src/hooks/useAuth';

type State = {
  data: StreakActivity | null;
  loading: boolean;
  error: string | null;
};

export function useStreakActivity() {
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
      const data = await getStreakActivity(userId);
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e.message : 'Error al cargar la racha.',
      });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
