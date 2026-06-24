import { useEffect, useMemo, useState } from 'react';

import { formatRecoveryWindow, type RecoveryWindow } from '../utils/recovery';

/** Cuenta regresiva en vivo de la ventana; null fuera de plazo. Refresca cada minuto. */
export function useRecoveryCountdown(recoverableUntil: string | null): RecoveryWindow | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!recoverableUntil) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [recoverableUntil]);

  return useMemo(() => {
    if (!recoverableUntil) return null;
    return formatRecoveryWindow(new Date(recoverableUntil).getTime() - now);
  }, [recoverableUntil, now]);
}
