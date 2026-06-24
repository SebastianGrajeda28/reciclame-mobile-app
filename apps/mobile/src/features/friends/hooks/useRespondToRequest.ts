import { useCallback, useState } from 'react';

import { respondToRequest } from '../api/friends';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useRespondToRequest(): {
  submit: (friendshipId: string, action: 'accept' | 'decline') => Promise<boolean>;
  status: Status;
  error: string | null;
  reset: () => void;
} {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (friendshipId: string, action: 'accept' | 'decline'): Promise<boolean> => {
      setStatus('loading');
      setError(null);
      try {
        await respondToRequest(friendshipId, action);
        setStatus('success');
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo responder la solicitud.');
        setStatus('error');
        return false;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { submit, status, error, reset };
}
