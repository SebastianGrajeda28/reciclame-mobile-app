import type { UserSetting } from '@/src/types/user';
import { db } from '@/src/services/db';

const USER_SETTINGS_TTL_MS = 30 * 60 * 1000; // 30 min — se recarga al abrir si venció

type UserSettingRow = {
  user_id: string;
  notifications_enabled: number;
  skip_recycling_instructions: number;
  profile_visibility: string | null;
  language: string | null;
  location_verification_enabled: number;
  updated_at: string | null;
  cached_at: string;
};

function isFreshCache(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < USER_SETTINGS_TTL_MS;
}

function mapRow(row: UserSettingRow): UserSetting {
  return {
    id: row.user_id,
    userId: row.user_id,
    notificationsEnabled: row.notifications_enabled === 1,
    skipRecyclingInstructions: row.skip_recycling_instructions === 1,
    profileVisibility: row.profile_visibility,
    language: row.language,
    locationVerificationEnabled: row.location_verification_enabled === 1,
    updatedAt: row.updated_at,
  };
}

export function isUserSettingsCacheStale(userId: string): boolean {
  const row = db.getFirstSync<{ cached_at: string }>(
    `SELECT cached_at FROM user_settings WHERE user_id = ?`,
    [userId],
  );
  const stale = !row || !isFreshCache(row.cached_at);
  console.log(`[LOCAL] user_settings(${userId}): cache ${stale ? 'VENCIDA' : 'fresca'} (cached_at=${row?.cached_at ?? 'ninguna'})`);
  return stale;
}

export function getLocalUserSettings(userId: string): UserSetting | null {
  const row = db.getFirstSync<UserSettingRow>(
    `SELECT * FROM user_settings WHERE user_id = ?`,
    [userId],
  );
  if (!row) {
    console.log(`[LOCAL] user_settings(${userId}): tabla vacía → null`);
    return null;
  }
  if (!isFreshCache(row.cached_at)) {
    console.log(`[LOCAL] user_settings(${userId}): cache vencida → null`);
    return null;
  }
  console.log(`[LOCAL] user_settings(${userId}): HIT — notif=${row.notifications_enabled}, skipInstr=${row.skip_recycling_instructions}, locationVerif=${row.location_verification_enabled}`);
  return mapRow(row);
}

export function saveUserSettings(settings: UserSetting): void {
  const cachedAt = new Date().toISOString();
  db.runSync(
    `INSERT OR REPLACE INTO user_settings
       (user_id, notifications_enabled, skip_recycling_instructions,
        profile_visibility, language, location_verification_enabled,
        updated_at, cached_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      settings.userId,
      settings.notificationsEnabled ? 1 : 0,
      settings.skipRecyclingInstructions ? 1 : 0,
      settings.profileVisibility,
      settings.language,
      settings.locationVerificationEnabled ? 1 : 0,
      settings.updatedAt,
      cachedAt,
    ],
  );
  console.log(`[LOCAL] user_settings(${settings.userId}): guardado en SQLite`);
}

export function clearUserSettings(userId: string): void {
  db.runSync(`DELETE FROM user_settings WHERE user_id = ?`, [userId]);
  console.log(`[LOCAL] user_settings(${userId}): limpiado`);
}
