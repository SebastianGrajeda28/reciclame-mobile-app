import {
  getLocalUserSettings,
  isUserSettingsCacheStale,
  saveUserSettings,
} from '@/src/services/local/userSettings';
import { supabase } from '@/src/services/supabase/client';
import type { UserSetting } from '@/src/types/user';

export type UserSettingPatch = {
  notificationsEnabled?: boolean;
  skipRecyclingInstructions?: boolean;
  locationVerificationEnabled?: boolean;
};

export async function getUserSettings(userId: string): Promise<UserSetting | null> {
  console.log(`[SETTINGS] getUserSettings userId=${userId}`);
  if (!isUserSettingsCacheStale(userId)) {
    const local = getLocalUserSettings(userId);
    if (local) {
      console.log('[SETTINGS] getUserSettings: devolviendo desde cache local');
      return local;
    }
  }

  console.log('[SETTINGS] getUserSettings: consultando Supabase');
  const { data, error } = await supabase
    .from('user_settings')
    .select('id, user_id, notifications_enabled, skip_recycling_instructions, profile_visibility, language, location_verification_enabled, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn(`[SETTINGS] getUserSettings: error Supabase — ${error.message} — intentando cache`);
    const stale = getLocalUserSettings(userId);
    if (stale) return stale;
    throw new Error(error.message);
  }

  if (!data) {
    console.log('[SETTINGS] getUserSettings: sin settings en Supabase');
    return null;
  }

  const settings: UserSetting = {
    id: data.id,
    userId: data.user_id,
    notificationsEnabled: data.notifications_enabled,
    skipRecyclingInstructions: data.skip_recycling_instructions,
    profileVisibility: data.profile_visibility ?? null,
    language: data.language ?? null,
    locationVerificationEnabled: data.location_verification_enabled ?? true,
    updatedAt: data.updated_at ?? null,
  };

  console.log('[SETTINGS] getUserSettings: settings obtenidos de Supabase y guardados en cache');
  
  settings.locationVerificationEnabled = true; // Forzar a true para que la app no bloquee la verificación de ubicación
  console.log('[SETTINGS] getUserSettings: settings guardados en cache:', settings);
  saveUserSettings(settings);
  console.log('[SETTINGS] getUserSettings: settings guardados en cache:', settings);
  return settings;
}

export async function updateUserSetting(userId: string, patch: UserSettingPatch): Promise<UserSetting> {
  console.log(`[SETTINGS] updateUserSetting userId=${userId} patch=`, patch);
  const snakePatch: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };

  if (patch.notificationsEnabled !== undefined) {
    snakePatch.notifications_enabled = patch.notificationsEnabled;
  }
  if (patch.skipRecyclingInstructions !== undefined) {
    snakePatch.skip_recycling_instructions = patch.skipRecyclingInstructions;
  }
  if (patch.locationVerificationEnabled !== undefined) {
    snakePatch.location_verification_enabled = patch.locationVerificationEnabled;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(snakePatch, { onConflict: 'user_id' })
    .select('id, user_id, notifications_enabled, skip_recycling_instructions, profile_visibility, language, location_verification_enabled, updated_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo actualizar la configuración del usuario.');
  }

  const updated: UserSetting = {
    id: data.id,
    userId: data.user_id,
    notificationsEnabled: data.notifications_enabled,
    skipRecyclingInstructions: data.skip_recycling_instructions,
    profileVisibility: data.profile_visibility ?? null,
    language: data.language ?? null,
    locationVerificationEnabled: data.location_verification_enabled ?? false,
    updatedAt: data.updated_at ?? null,
  };

  console.log('[SETTINGS] updateUserSetting: actualizado en Supabase y guardado en cache local');
  saveUserSettings(updated);
  return updated;
}
