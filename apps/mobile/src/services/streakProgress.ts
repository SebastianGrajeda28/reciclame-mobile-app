import { supabase } from '@/src/services/supabase/client';

export type StreakProgress = {
  streakDays: number;
  heat: number;
  level: number;
  recycledToday: boolean;
  /** Instante (ISO) en que la racha morirá si no se recicla; null si no hay racha activa (#176). */
  expiresAt: string | null;
  /** true si esta lectura detectó la muerte de la racha (#177). */
  justExpired: boolean;
  /** Escudos de recuperación disponibles. */
  recoveries: number;
  /** Instante (ISO) hasta el que se puede recuperar; null si no hay oferta. */
  recoverableUntil: string | null;
  /** Días reales de la racha perdida (para mostrar en la oferta); null si no aplica. */
  streakDaysLost: number | null;
};

/** Resultado de recuperar una racha con un escudo. */
export type RecoverStreakResult = {
  streakDays: number;
  heat: number;
  level: number;
};

export async function getStreakProgress(userId: string): Promise<StreakProgress | null> {
  const { data, error } = await supabase.rpc('get_progress_with_decay', { p_user_id: userId });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const row = data[0];
  const lastRecyclingDate: string | null = row.last_recycling_date ?? null;
  // Use Lima local date to match app_today() server-side (UTC-5).
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Lima' });
  return {
    streakDays: row.streak_days ?? 0,
    heat: Math.min(100, Math.max(0, row.heat ?? 0)),
    level: row.level ?? 1,
    recycledToday: lastRecyclingDate === today,
    expiresAt: row.streak_expires_at ?? null,
    justExpired: Boolean(row.streak_just_expired),
    recoveries: row.recoveries ?? 0,
    recoverableUntil: row.recoverable_until ?? null,
    streakDaysLost: row.streak_days_lost ?? null,
  };
}

/** Recupera una racha gastando un escudo (RPC `recover_streak`). Lanza Error si falla o se rechaza. */
export async function recoverStreak(userId: string): Promise<RecoverStreakResult> {
  const { data, error } = await supabase.rpc('recover_streak', { p_user_id: userId });
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row || row.success !== true) {
    throw new Error('No se pudo recuperar la racha');
  }
  return {
    streakDays: row.streak_days ?? 0,
    heat: row.heat ?? 0,
    level: row.level ?? 1,
  };
}
