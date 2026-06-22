import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getUserSettings, updateUserSetting, type UserSettingPatch } from '@/src/features/profile/api/userSettings';
import type { UserSetting } from '@/src/types/user';
import { useAuth } from './useAuth';

type UserSettingsContextType = {
  settings: UserSetting | null;
  loading: boolean;
  updateSetting: (patch: UserSettingPatch) => Promise<void>;
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

/**
 * Context provider that loads and exposes the user's persisted preferences
 * from Supabase. Must be placed inside AuthProvider.
 */
export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [settings, setSettings] = useState<UserSetting | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setSettings((prev: UserSetting | null) => prev ?? { id: '', userId: '', notificationsEnabled: true, skipRecyclingInstructions: false, profileVisibility: null, language: null, locationVerificationEnabled: false, updatedAt: null });
      return;
    }

    setLoading(true);
    getUserSettings(userId)
      .then((result) => setSettings(result))
      .catch((err) => console.error('[UserSettingsProvider] Error loading settings:', err))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  const updateSetting = useCallback(
    async (patch: UserSettingPatch) => {
      const userId = session?.user?.id;
      if (!userId) {
        setSettings((prev: UserSetting | null) => prev ? { ...prev, ...patch } : null);
        return;
      }

      const optimistic: UserSetting = {
        id: settings?.id ?? '',
        userId,
        notificationsEnabled: settings?.notificationsEnabled ?? true,
        skipRecyclingInstructions: settings?.skipRecyclingInstructions ?? false,
        profileVisibility: settings?.profileVisibility ?? null,
        language: settings?.language ?? null,
        locationVerificationEnabled: settings?.locationVerificationEnabled ?? false,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setSettings(optimistic);

      try {
        const updated = await updateUserSetting(userId, patch);
        setSettings(updated);
      } catch (err) {
        console.error('[UserSettingsProvider] Error updating setting:', err);
        setSettings(settings);
      }
    },
    [session?.user?.id, settings],
  );

  return (
    <UserSettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

/**
 * Hook to access the user's persisted preferences and update them.
 *
 * @returns `settings` — current UserSetting or null if not loaded / unauthenticated.
 * @returns `loading` — true while settings are being fetched.
 * @returns `updateSetting` — function to partially update settings in Supabase.
 * @throws {Error} if used outside of UserSettingsProvider.
 */
export function useUserSettings(): UserSettingsContextType {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}
