import { useCallback, useEffect, useState } from 'react';

import { getFriends } from '../api/friends';
import type { FriendSummary } from '@/src/types/friend';

/**
 * Hook para obtener la lista de amigos del usuario con sus agregados de perfil.
 *
 * Soporta carga inicial, refresco manual y pull-to-refresh.
 * Si `userId` es null no realiza ninguna consulta.
 *
 * @param userId - ID del usuario autenticado, o null si la sesión aún no está disponible.
 * @returns Objeto con `data`, `loading`, `refreshing`, `error`, `refetch` y `refresh`.
 */
export function useFriends(userId: string | null): {
  data: FriendSummary[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => void;
  refresh: () => void;
} {
  const [data, setData] = useState<FriendSummary[]>([]);
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
        const result = await getFriends(userId);
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar la lista de amigos.');
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

  const refetch = useCallback(() => load('initial'), [load]);
  const refresh = useCallback(() => load('refresh'), [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
    refresh,
  };
}
