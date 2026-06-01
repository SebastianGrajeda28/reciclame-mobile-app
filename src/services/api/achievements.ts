import { supabase } from '@/src/services/supabase/client';

const MAX_FEATURED_MEDALS = 5;

export async function getUserAchievements(_userId: string) {
  throw new Error('Not implemented: getUserAchievements');
}

export async function updateFeaturedMedals(
  userId: string,
  medalIds: string[]
): Promise<{ success: boolean; message: string }> {
  // Client-side validation: strict business rule - max 5 medals
  if (medalIds.length > MAX_FEATURED_MEDALS) {
    throw new Error(
      `Featured medals cannot exceed ${MAX_FEATURED_MEDALS}. Received ${medalIds.length}.`
    );
  }

  // Convert string UUIDs to proper format for Supabase
  const achievementIds = medalIds.map((id) => id);

  const { data, error } = await supabase.rpc('update_featured_medals', {
    p_user_id: userId,
    p_achievement_ids: achievementIds,
  });

  if (error) {
    throw new Error(`Failed to update featured medals: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No response from featured medals update');
  }

  return {
    success: data[0].success,
    message: data[0].message,
  };
}
