import { useEffect, useMemo, useState } from 'react';

import { formatStreakCountdown, type StreakCountdown } from '../utils/streakCountdown';

/**
 * Cuenta regresiva en vivo hasta que la racha expira (#176). Devuelve null si no hay deadline
 * (sin racha activa). Refresca cada minuto, suficiente para una resolución de d/h/m.
 */
export function useStreakCountdown(expiresAt: string | null): StreakCountdown | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return useMemo(() => {
    if (!expiresAt) return null;
    return formatStreakCountdown(new Date(expiresAt).getTime() - now);
  }, [expiresAt, now]);
}
