import { supabase } from '@/src/services/supabase/client';

export type UnlockedAchievementResult = {
  slug: string;
  name: string;
  rewardName: string | null;
  unlockDescription: string | null;
};

export async function checkUnlockedAchievements(
  userId: string
): Promise<UnlockedAchievementResult | null> {
  try {
    const { data, error } = await supabase.rpc('check_and_unlock_achievements', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[checkUnlockedAchievements] Database error:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0] as {
      achievement_id: string;
      achievement_name: string;
      achievement_slug: string | null;
      reward_id: string | null;
    };

    if (!row.achievement_slug) return null;

    let rewardName: string | null = null;
    if (row.reward_id) {
      const { data: reward } = await supabase
        .from('rewards')
        .select('name')
        .eq('id', row.reward_id)
        .maybeSingle();
      rewardName = reward?.name ?? null;
    }

    let unlockDescription: string | null = null;
    const { data: ach } = await supabase
      .from('achievements')
      .select('unlock_description')
      .eq('id', row.achievement_id)
      .maybeSingle();
    unlockDescription = ach?.unlock_description ?? null;

    return {
      slug: row.achievement_slug,
      name: row.achievement_name,
      rewardName,
      unlockDescription,
    };
  } catch (err) {
    console.error('[checkUnlockedAchievements] Error:', err);
    return null;
  }
}
