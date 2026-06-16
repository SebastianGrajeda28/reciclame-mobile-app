export type StreakCountdown = {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  /** Texto listo para mostrar, p.ej. "Te quedan 1d 4h para no perder tu racha". */
  label: string;
};

/**
 * Formatea el tiempo restante (#176) hasta que la racha expira. Función pura para poder
 * testearla sin React ni temporizadores.
 */
export function formatStreakCountdown(msRemaining: number): StreakCountdown {
  if (!Number.isFinite(msRemaining) || msRemaining <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, label: 'Tu racha está por expirar' };
  }

  const totalMinutes = Math.floor(msRemaining / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  let core: string;
  if (days > 0) core = `${days}d ${hours}h`;
  else if (hours > 0) core = `${hours}h ${minutes}m`;
  else core = `${minutes}m`;

  return { expired: false, days, hours, minutes, label: `Te quedan ${core} para no perder tu racha` };
}
