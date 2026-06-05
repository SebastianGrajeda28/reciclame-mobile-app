import { supabase } from '@/src/services/supabase/client';
import type { UserSetting } from '@/src/types/user';

export type UserSettingPatch = {
  notificationsEnabled?: boolean;
  skipRecyclingInstructions?: boolean;
};

/**
 * Obtiene la configuración del usuario desde Supabase.
 *
 * @param userId - ID del usuario autenticado.
 * @returns El UserSetting del usuario, o null si aún no existe registro.
 * @throws Error si la consulta falla por red o permisos RLS.
 */
export async function getUserSettings(userId: string): Promise<UserSetting | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('id, user_id, notifications_enabled, skip_recycling_instructions, profile_visibility, language, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    notificationsEnabled: data.notifications_enabled,
    skipRecyclingInstructions: data.skip_recycling_instructions,
    profileVisibility: data.profile_visibility ?? undefined,
    language: data.language ?? undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
}

/**
 * Crea o actualiza la configuración del usuario en Supabase.
 *
 * Usa upsert para manejar tanto el primer acceso (sin registro previo) como
 * actualizaciones posteriores, basándose en la restricción única de user_id.
 *
 * @param userId - ID del usuario autenticado.
 * @param patch - Campos a crear o actualizar.
 * @returns El UserSetting resultante.
 * @throws Error si la operación falla (red, RLS, restricciones de FK, etc.).
 */
export async function updateUserSetting(userId: string, patch: UserSettingPatch): Promise<UserSetting> {
  const snakePatch: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };

  if (patch.notificationsEnabled !== undefined) {
    snakePatch.notifications_enabled = patch.notificationsEnabled;
  }
  if (patch.skipRecyclingInstructions !== undefined) {
    snakePatch.skip_recycling_instructions = patch.skipRecyclingInstructions;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(snakePatch, { onConflict: 'user_id' })
    .select('id, user_id, notifications_enabled, skip_recycling_instructions, profile_visibility, language, updated_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo actualizar la configuración del usuario.');
  }

  return {
    id: data.id,
    userId: data.user_id,
    notificationsEnabled: data.notifications_enabled,
    skipRecyclingInstructions: data.skip_recycling_instructions,
    profileVisibility: data.profile_visibility ?? undefined,
    language: data.language ?? undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
}
