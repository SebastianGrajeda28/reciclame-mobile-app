import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { getStreakProgress, type StreakProgress } from '@/src/services/api/streak';

type State = {
  data: StreakProgress | null;
  loading: boolean;
  error: string | null;
};

export function useStreakProgress() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!userId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getStreakProgress(userId);
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: e instanceof Error ? e.message : 'Error' });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
