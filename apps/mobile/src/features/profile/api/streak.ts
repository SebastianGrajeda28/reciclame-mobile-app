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
};

export async function getStreakProgress(userId: string): Promise<StreakProgress | null> {
  const { data, error } = await supabase
    .rpc('get_progress_with_decay', { p_user_id: userId });

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
    expiresAt: row.streak_expires_at ?? null,
    justExpired: Boolean(row.streak_just_expired),
  };
}
