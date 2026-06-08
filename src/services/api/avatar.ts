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
  // TODO(#79): validar que hat/clothes/hair/beard/moustache en config están desbloqueados
  // en user_rewards antes de guardar. Hoy se acepta cualquier valor del catálogo frontend.
  // También migrar user_cosmetic_colors de AsyncStorage a DB (tabla pendiente de crear).
  const { error } = await supabase
    .from('avatars')
    .upsert(
      { user_id: userId, avatar_config: config, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

  if (error) throw new Error(error.message);
}
