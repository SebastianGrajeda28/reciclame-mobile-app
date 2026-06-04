import { supabase } from '@/src/services/supabase/client';

export type StreakProgress = {
  streakDays: number;
  heat: number;
  level: number;
};

export async function getStreakProgress(userId: string): Promise<StreakProgress | null> {
  const { data, error } = await supabase
    .rpc('get_progress_with_decay', { p_user_id: userId });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    streakDays: row.streak_days ?? 0,
    heat: Math.min(100, Math.max(0, row.heat ?? 50)),
    level: row.level ?? 1,
  };
}
