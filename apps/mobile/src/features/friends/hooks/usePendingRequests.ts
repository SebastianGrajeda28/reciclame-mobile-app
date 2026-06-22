import { useCallback, useEffect, useState } from 'react';

import { getPendingRequests } from '../api/friends';
import type { FriendRequest } from '@/src/types/friend';

export function usePendingRequests(): {
  data: FriendRequest[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => void;
  refresh: () => void;
} {
  const [data, setData] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const result = await getPendingRequests();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load('initial');
  }, [load]);

  const refetch = useCallback(() => load('initial'), [load]);
  const refresh = useCallback(() => load('refresh'), [load]);

  return { data, loading, refreshing, error, refetch, refresh };
}
