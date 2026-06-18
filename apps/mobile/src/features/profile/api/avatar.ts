import { supabase } from '@/src/services/supabase/client';
import { AvatarConfig } from '@/src/features/profile/data/avatarCatalog';

export async function getAvatarConfig(userId: string): Promise<AvatarConfig | null> {
  const { data, error } = await supabase
    .from('avatars')
    .select('avatar_config')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.avatar_config) return null;

  return data.avatar_config as AvatarConfig;
}

export async function saveAvatarConfig(userId: string, config: AvatarConfig): Promise<void> {
  const { data, error } = await supabase
    .rpc('save_avatar_config', { p_user_id: userId, p_config: config });

  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (row && !(row as { success: boolean }).success) {
    throw new Error((row as { message: string }).message);
  }
}

export type UnlockedCosmetics = {
  hat: Set<string>;
  clothes: Set<string>;
  hair: Set<string>;
  beard: Set<string>;
  moustache: Set<string>;
};

export async function getUserCosmetics(userId: string): Promise<UnlockedCosmetics> {
  const result: UnlockedCosmetics = {
    hat: new Set(),
    clothes: new Set(),
    hair: new Set(),
    beard: new Set(),
    moustache: new Set(),
  };

  const { data, error } = await supabase
    .from('user_rewards')
    .select('rewards(item_key, item_type)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  if (!data) return result;

  for (const row of data) {
    const rewardRaw = row.rewards as unknown;
    const reward = (Array.isArray(rewardRaw) ? rewardRaw[0] : rewardRaw) as { item_key: string | null; item_type: string | null } | null;
    if (!reward?.item_key || !reward?.item_type) continue;
    const bucket = result[reward.item_type as keyof UnlockedCosmetics];
    if (bucket) bucket.add(reward.item_key);
  }

  return result;
}
