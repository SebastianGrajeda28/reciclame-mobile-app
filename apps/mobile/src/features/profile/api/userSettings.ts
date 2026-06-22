import { supabase } from '@/src/services/supabase/client';
import type { UserSetting } from '@/src/types/user';

export type UserSettingPatch = {
  notificationsEnabled?: boolean;
  skipRecyclingInstructions?: boolean;
  locationVerificationEnabled?: boolean;
};

export async function getUserSettings(userId: string): Promise<UserSetting | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('id, user_id, notifications_enabled, skip_recycling_instructions, profile_visibility, language, location_verification_enabled, updated_at')
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
    profileVisibility: data.profile_visibility ?? null,
    language: data.language ?? null,
    locationVerificationEnabled: data.location_verification_enabled ?? false,
    updatedAt: data.updated_at ?? null,
  };
}

export async function updateUserSetting(userId: string, patch: UserSettingPatch): Promise<UserSetting> {
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

  return {
    id: data.id,
    userId: data.user_id,
    notificationsEnabled: data.notifications_enabled,
    skipRecyclingInstructions: data.skip_recycling_instructions,
    profileVisibility: data.profile_visibility ?? null,
    language: data.language ?? null,
    locationVerificationEnabled: data.location_verification_enabled ?? false,
    updatedAt: data.updated_at ?? null,
  };
}
