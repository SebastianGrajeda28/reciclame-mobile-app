import { supabase } from '@/src/services/supabase/client';

export type StreakProgress = {
  streakDays: number;
  heat: number;
  level: number;
  recycledToday: boolean;
  /** Escudos de recuperación disponibles. */
  recoveries: number;
  /** Instante (ISO) hasta el que se puede recuperar; null si no hay oferta. */
  recoverableUntil: string | null;
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
  const today = new Date().toISOString().slice(0, 10);
  return {
    streakDays: row.streak_days ?? 0,
    heat: Math.min(100, Math.max(0, row.heat ?? 0)),
    level: row.level ?? 1,
    recycledToday: lastRecyclingDate === today,
    recoveries: row.recoveries ?? 0,
    recoverableUntil: row.recoverable_until ?? null,
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
