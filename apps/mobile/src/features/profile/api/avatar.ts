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
  console.log('[AVATAR SAVE] Config enviada al servidor:', JSON.stringify(config, null, 2));
  console.log('[AVATAR SAVE] clothes:', config.clothes, '| hat:', config.hat, '| hair:', config.hair);

  const { data, error } = await supabase
    .rpc('save_avatar_config', { p_user_id: userId, p_config: config });

  console.log('[AVATAR SAVE] Respuesta del servidor — data:', JSON.stringify(data), '| error:', error);

  if (error) {
    console.error('[AVATAR SAVE] Error de Supabase:', error.message, error.code, error.details);
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  console.log('[AVATAR SAVE] Row procesado:', JSON.stringify(row));
  if (row && !(row as { success: boolean }).success) {
    console.error('[AVATAR SAVE] Servidor rechazó el guardado:', (row as { message: string }).message);
    throw new Error((row as { message: string }).message);
  }

  console.log('[AVATAR SAVE] Guardado exitoso ✓');
}

export type CosmeticCategory = 'hat' | 'clothes' | 'hair' | 'beard' | 'moustache';

export type RestrictedCosmetics = Record<CosmeticCategory, Set<string>>;

export async function getRestrictedCosmetics(): Promise<RestrictedCosmetics> {
  const result: RestrictedCosmetics = {
    hat: new Set(),
    clothes: new Set(),
    hair: new Set(),
    beard: new Set(),
    moustache: new Set(),
  };

  const { data, error } = await supabase
    .from('rewards')
    .select('item_key, item_type')
    .eq('requires_unlock', true)
    .eq('is_active', true)
    .in('item_type', ['hat', 'clothes', 'hair', 'beard', 'moustache']);

  if (error) throw new Error(error.message);
  if (!data) return result;

  for (const row of data) {
    if (!row.item_key || !row.item_type) continue;
    const bucket = result[row.item_type as CosmeticCategory];
    if (bucket) bucket.add(row.item_key);
  }

  return result;
}

export async function getEarnedRestrictedCosmetics(userId: string): Promise<RestrictedCosmetics> {
  const result: RestrictedCosmetics = {
    hat: new Set(),
    clothes: new Set(),
    hair: new Set(),
    beard: new Set(),
    moustache: new Set(),
  };

  // Step 1: get achievement_ids the user has earned
  const { data: earned, error: earnedError } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (earnedError) throw new Error(earnedError.message);
  if (!earned || earned.length === 0) return result;

  const earnedIds = earned.map((r) => r.achievement_id);

  // Step 2: get restricted rewards whose achievement the user has earned
  const { data, error } = await supabase
    .from('rewards')
    .select('item_key, item_type')
    .eq('requires_unlock', true)
    .eq('is_active', true)
    .in('achievement_id', earnedIds)
    .in('item_type', ['hat', 'clothes', 'hair', 'beard', 'moustache']);

  if (error) throw new Error(error.message);
  if (!data) return result;

  for (const row of data) {
    if (!row.item_key || !row.item_type) continue;
    const bucket = result[row.item_type as CosmeticCategory];
    if (bucket) bucket.add(row.item_key);
  }

  return result;
}
