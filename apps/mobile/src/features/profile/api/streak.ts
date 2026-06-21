import { supabase } from '@/src/services/supabase/client';
export { getStreakProgress, type StreakProgress } from '@/src/services/streakProgress';

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
  const { data, error } = await supabase.rpc('get_streak_activity', { p_user_id: userId });

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
