import { useCallback, useEffect, useState } from 'react';

import { useStreakInvalidation } from '@/src/contexts/StreakInvalidationContext';
import { getStreakProgress, type StreakProgress } from '@/src/services/streakProgress';
import { useAuth } from '@/src/hooks/useAuth';

type State = {
  data: StreakProgress | null;
  loading: boolean;
  error: string | null;
};

export function useStreakProgress() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { version } = useStreakInvalidation();
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!userId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

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
  }, [load, version]);

  return { ...state, refetch: load };
}
