import { supabase } from '@/src/services/supabase/client';
import { User } from '@/src/types/user';

export async function getUserProfile(_userId: string): Promise<User | null> {
  throw new Error('Not implemented: getUserProfile');
}

export async function updateUserAvatar(
  userId: string,
  rewardId: string
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('update_user_avatar', {
    p_user_id: userId,
    p_reward_id: rewardId,
  });

  if (error) {
    throw new Error(`Failed to update avatar: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No response from avatar update');
  }

  return {
    success: data[0].success,
    message: data[0].message,
  };
}
