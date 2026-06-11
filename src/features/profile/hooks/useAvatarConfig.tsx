import { createContext, Dispatch, PropsWithChildren, ReactElement, SetStateAction, useContext, useEffect, useState } from 'react';

import { AvatarConfig, DEFAULT_CONFIG, RACE_SKINS, EYE_COLORS } from '@/src/features/profile/data/avatarCatalog';
import { getAvatarConfig, saveAvatarConfig } from '@/src/services/api/avatar';
import { useAuth } from '@/src/hooks/useAuth';

type AvatarConfigContextValue = {
  config: AvatarConfig;
  setConfig: Dispatch<SetStateAction<AvatarConfig>>;
  save: (newConfig: AvatarConfig) => Promise<void>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
};

const AvatarConfigContext = createContext<AvatarConfigContextValue | null>(null);

export function AvatarConfigProvider({ children }: PropsWithChildren): ReactElement {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const saved = await getAvatarConfig(userId);
        if (!cancelled) {
          const base = saved ?? DEFAULT_CONFIG;
          const skinIdx = RACE_SKINS[base.race].indexOf(base.skin);
          const eyeColor = EYE_COLORS[base.race][skinIdx] ?? EYE_COLORS[base.race][0];
          const resolved = { ...base, eyeColor };
          setConfig(resolved);
          setSavedConfig(resolved);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  async function save(newConfig: AvatarConfig) {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      await saveAvatarConfig(userId, newConfig);
      setSavedConfig(newConfig);
      setConfig(newConfig);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  return (
    <AvatarConfigContext.Provider value={{ config, setConfig, save, loading, saving, error, hasChanges }}>
      {children}
    </AvatarConfigContext.Provider>
  );
}

export function useAvatarConfig() {
  const ctx = useContext(AvatarConfigContext);
  if (!ctx) throw new Error('useAvatarConfig must be used inside AvatarConfigProvider');
  return ctx;
}
