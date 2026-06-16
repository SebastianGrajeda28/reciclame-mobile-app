import { useCallback, useEffect, useState } from 'react';

import { getMyFriendCode } from '../api/friends';

export function useMyFriendCode(userId: string | null): {
  code: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setCode(await getMyFriendCode());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar tu código de amigo.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { code, loading, error, refetch: () => load() };
}
