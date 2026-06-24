import { useEffect, useMemo, useState } from 'react';

import { formatRecoveryWindow, type RecoveryWindow } from '../utils/recovery';

/**
 * Cuenta regresiva en vivo de la ventana de recuperación (#259/RF-054). Devuelve null si no hay
 * ventana abierta (racha viva o fuera de plazo). Refresca cada minuto. Mismo patrón que
 * useStreakCountdown.
 */
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
