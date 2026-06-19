import { supabase } from '@/src/services/supabase/client';

const MAX_FEATURED_MEDALS = 5;

export type UserAchievement = {
  achievementId: string;
  slug: string;
  name: string;
  description: string | null;
  unlockDescription: string | null;
  rewardName: string | null;
  earnedAt: string | null;
};

export type ProfileStats = {
  totalWeightKg: number;
  totalItems: number;
  activeSinceIso: string | null;
  badgesEarned: number;
};

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data: allAchievements, error: achError } = await supabase
    .from('achievements')
    .select('id, slug, name, description, unlock_description, reward_id, rewards(name)')
    .eq('is_active', true)
    .not('slug', 'is', null);

  if (achError) throw new Error(achError.message);
  if (!allAchievements) return [];

  const { data: earned, error: earnedError } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (earnedError) throw new Error(earnedError.message);

  const earnedMap = new Map<string, string>();
  for (const row of earned ?? []) {
    earnedMap.set(row.achievement_id, row.unlocked_at);
  }

  return allAchievements.map((a) => {
    const rewardRaw = a.rewards as unknown;
    const reward = (Array.isArray(rewardRaw) ? rewardRaw[0] : rewardRaw) as { name: string } | null;
    return {
      achievementId: a.id,
      slug: a.slug as string,
      name: a.name,
      description: a.description ?? null,
      unlockDescription: a.unlock_description ?? null,
      rewardName: reward?.name ?? null,
      earnedAt: earnedMap.get(a.id) ?? null,
    };
  });
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [recordsRes, profileRes, achievementsRes] = await Promise.all([
    supabase
      .from('recycling_records')
      .select('estimated_weight')
      .eq('user_id', userId)
      .eq('status', 'confirmed'),
    supabase
      .from('user_profiles')
      .select('created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('user_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true),
  ]);

  if (recordsRes.error) throw new Error(recordsRes.error.message);

  const records = recordsRes.data ?? [];
  const totalWeightG = records.reduce((sum, r) => sum + (r.estimated_weight ?? 0), 0);

  return {
    totalWeightKg: Math.round((totalWeightG / 1000) * 10) / 10,
    totalItems: records.length,
    activeSinceIso: profileRes.data?.created_at ?? null,
    badgesEarned: achievementsRes.count ?? 0,
  };
}

export async function getFeaturedAchievementIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_featured_medals')
    .select('achievement_ids')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.achievement_ids as string[] | null) ?? [];
}

export async function updateFeaturedMedals(
  userId: string,
  medalIds: string[]
): Promise<{ success: boolean; message: string }> {
  if (medalIds.length > MAX_FEATURED_MEDALS) {
    throw new Error(
      `Featured medals cannot exceed ${MAX_FEATURED_MEDALS}. Received ${medalIds.length}.`
    );
  }

  const { data, error } = await supabase.rpc('update_featured_medals', {
    p_user_id: userId,
    p_achievement_ids: medalIds,
  });

  if (error) throw new Error(`Failed to update featured medals: ${error.message}`);
  if (!data || data.length === 0) throw new Error('No response from featured medals update');

  return { success: data[0].success, message: data[0].message };
}
