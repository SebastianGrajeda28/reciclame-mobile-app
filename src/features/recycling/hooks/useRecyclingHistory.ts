import { useCallback, useEffect, useState } from 'react';
import { getRecyclingLogs } from '@/src/services/api/recyclingLogs';
import type { RecyclingLogListItem } from '@/src/types/recycling';

export function useRecyclingHistory(userId: string | null): {
  data: RecyclingLogListItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => void;
  refresh: () => void;
} {
  const [data, setData] = useState<RecyclingLogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!userId) {
        setLoading(false);
        return;
      }
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const result = await getRecyclingLogs(userId);
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar el historial.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch: () => load('initial'),
    refresh: () => load('refresh'),
  };
}
