import { useEffect, useState } from 'react';

import { getUserCosmetics, UnlockedCosmetics } from '@/src/features/profile/api/avatar';
import { useAuth } from '@/src/hooks/useAuth';

const EMPTY: UnlockedCosmetics = {
  hat: new Set(),
  clothes: new Set(),
  hair: new Set(),
  beard: new Set(),
  moustache: new Set(),
};

export function useUnlockedCosmetics() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [cosmetics, setCosmetics] = useState<UnlockedCosmetics>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const unlocked = await getUserCosmetics(userId);
        if (!cancelled) setCosmetics(unlocked);
      } catch {
        // silently fall back to empty — avatar editor just shows nothing locked
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { cosmetics, loading };
}
