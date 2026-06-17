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

export type WeekDay = {
  date: string;
  recycled: boolean;
};

export type HeatMapEntry = {
  date: string;
  count: number;
};

export type StreakActivity = {
  streakDays: number;
  bestStreakDays: number;
  recycledToday: boolean;
  totalToday: number;
  dailyAverage: number;
  weekDays: WeekDay[];
  heatMap: HeatMapEntry[];
};

export async function getStreakActivity(userId: string): Promise<StreakActivity | null> {
  const { data, error } = await supabase
    .rpc('get_streak_activity', { p_user_id: userId });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    streakDays: row.streak_days ?? 0,
    bestStreakDays: row.best_streak_days ?? 0,
    recycledToday: Boolean(row.recycled_today),
    totalToday: row.total_today ?? 0,
    dailyAverage: Number(row.daily_average ?? 0),
    weekDays: (row.week_days as WeekDay[]) ?? [],
    heatMap: (row.heat_map as HeatMapEntry[]) ?? [],
  };
}

export async function getStreakProgress(userId: string): Promise<StreakProgress | null> {
  const { data, error } = await supabase
    .rpc('get_progress_with_decay', { p_user_id: userId });

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
  };
}
