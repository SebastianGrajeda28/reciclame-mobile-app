export type RecoveryWindow = {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  /** Texto listo para mostrar, p.ej. "Te quedan 1d 18h para recuperar". */
  label: string;
};

/**
 * Formatea el tiempo restante de la ventana de recuperación (#259/RF-054). Función pura para
 * poder testearla sin React ni temporizadores (mismo patrón que formatStreakCountdown).
 */
export function formatRecoveryWindow(msRemaining: number): RecoveryWindow {
  if (!Number.isFinite(msRemaining) || msRemaining <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      label: 'La ventana de recuperación expiró',
    };
  }

  const totalMinutes = Math.floor(msRemaining / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  let core: string;
  if (days > 0) core = `${days}d ${hours}h`;
  else if (hours > 0) core = `${hours}h ${minutes}m`;
  else core = `${minutes}m`;

  return { expired: false, days, hours, minutes, label: `Te quedan ${core} para recuperar` };
}

/**
 * ¿La ventana entra en zona de urgencia (menos de `thresholdHours`)? Para virar el chip a danger
 * sin depender solo del color (se acompaña de icono + texto por accesibilidad).
 */
export function isRecoveryUrgent(window: RecoveryWindow | null, thresholdHours = 6): boolean {
  if (!window || window.expired) return false;
  return window.days === 0 && window.hours < thresholdHours;
}
