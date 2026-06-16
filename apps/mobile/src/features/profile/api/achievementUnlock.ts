import type { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';
import { supabase } from '@/src/services/supabase/client';

/**
 * Checks for newly unlocked achievements after a recycling action.
 * Queries the backend database to check if any achievement requirements were met.
 * 
 * @param userId - The user ID to check achievements for
 * @returns The newly unlocked achievement or null if none were unlocked
 */
export async function checkUnlockedAchievements(userId: string): Promise<ProfileBadge | null> {
  try {
    // Call the database function to check for newly unlocked achievements
    const { data, error } = await supabase.rpc('check_and_unlock_achievements', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[checkUnlockedAchievements] Database error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Get the first newly unlocked achievement
    const unlockedAchievement = data[0];
    
    // Map the database achievement to the ProfileBadge type
    // In a real implementation, you would query the achievements table to get full details
    // For now, we'll use the mock data to find the matching badge
    const allBadges = profileGamificationSnapshot.allBadges;
    
    // Try to find a matching badge by name (this is a simplified approach)
    // In production, you would have a proper mapping between database IDs and badge IDs
    const matchingBadge = allBadges.find(b => 
      b.name.toLowerCase().includes(unlockedAchievement.achievement_name.toLowerCase()) ||
      b.description.toLowerCase().includes(unlockedAchievement.achievement_name.toLowerCase())
    );

    return matchingBadge ?? null;
  } catch (err) {
    console.error('[checkUnlockedAchievements] Error:', err);
    return null;
  }
}

/**
 * Gets all achievements for a user from the database.
 * 
 * @param userId - The user ID to get achievements for
 * @returns Array of user achievements
 */
export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (
        id,
        name,
        description,
        condition_type,
        condition_value,
        reward_id,
        rewards (
          id,
          name,
          description,
          reward_type,
          asset_url
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('unlocked_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user achievements: ${error.message}`);
  }

  return data;
}
