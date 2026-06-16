import { useCallback, useState } from 'react';

import { addFriendByCode } from '../api/friends';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useAddFriendByCode(): {
  submit: (code: string) => Promise<boolean>;
  status: Status;
  error: string | null;
  reset: () => void;
} {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (code: string): Promise<boolean> => {
    setStatus('loading');
    setError(null);
    try {
      await addFriendByCode(code);
      setStatus('success');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo agregar al amigo.');
      setStatus('error');
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { submit, status, error, reset };
}
