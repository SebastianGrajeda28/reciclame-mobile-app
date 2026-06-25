import { supabase } from '@/src/services/supabase/client';

export type UnlockedAchievementResult = {
  slug: string;
  name: string;
  rewardName: string | null;
  unlockDescription: string | null;
};

export async function checkUnlockedAchievements(
  userId: string
): Promise<UnlockedAchievementResult[]> {
  try {
    const { data, error } = await supabase.rpc('check_and_unlock_achievements', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[checkUnlockedAchievements] Database error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const rows = (data as {
      out_achievement_id: string;
      out_achievement_name: string;
      out_achievement_slug: string | null;
    }[]).filter((r) => r.out_achievement_slug);

    if (rows.length === 0) return [];

    const [rewardsRes, achsRes] = await Promise.all([
      supabase
        .from('rewards')
        .select('achievement_id, name')
        .in('achievement_id', rows.map((r) => r.out_achievement_id))
        .eq('is_active', true),
      supabase
        .from('achievements')
        .select('id, unlock_description')
        .in('id', rows.map((r) => r.out_achievement_id)),
    ]);

    const rewardMap = new Map<string, string>();
    for (const r of rewardsRes.data ?? []) rewardMap.set(r.achievement_id, r.name);

    const unlockDescMap = new Map<string, string>();
    for (const a of achsRes.data ?? []) {
      if (a.unlock_description) unlockDescMap.set(a.id, a.unlock_description);
    }

    return rows.map((row) => ({
      slug: row.out_achievement_slug!,
      name: row.out_achievement_name,
      rewardName: rewardMap.get(row.out_achievement_id) ?? null,
      unlockDescription: unlockDescMap.get(row.out_achievement_id) ?? null,
    }));
  } catch (err) {
    console.error('[checkUnlockedAchievements] Error:', err);
    return [];
  }
}
