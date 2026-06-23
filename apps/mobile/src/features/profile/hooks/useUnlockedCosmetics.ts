import { useEffect, useState } from 'react';

import { getRestrictedCosmetics, getEarnedRestrictedCosmetics, RestrictedCosmetics } from '@/src/features/profile/api/avatar';
import { useAuth } from '@/src/hooks/useAuth';

const EMPTY: RestrictedCosmetics = {
  hat: new Set(),
  clothes: new Set(),
  hair: new Set(),
  beard: new Set(),
  moustache: new Set(),
};

type UnlockedCosmeticsState = {
  restricted: RestrictedCosmetics;
  earned: RestrictedCosmetics;
  loading: boolean;
};

export function useUnlockedCosmetics(): UnlockedCosmeticsState {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [restricted, setRestricted] = useState<RestrictedCosmetics>(EMPTY);
  const [earned, setEarned] = useState<RestrictedCosmetics>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const [restrictedData, earnedData] = await Promise.all([
          getRestrictedCosmetics(),
          getEarnedRestrictedCosmetics(userId),
        ]);
        console.log('[COSMETICS] Cosméticos RESTRINGIDOS cargados:', {
          hat: [...restrictedData.hat],
          clothes: [...restrictedData.clothes],
          hair: [...restrictedData.hair],
          beard: [...restrictedData.beard],
          moustache: [...restrictedData.moustache],
        });
        console.log('[COSMETICS] Cosméticos DESBLOQUEADOS por el usuario:', {
          hat: [...earnedData.hat],
          clothes: [...earnedData.clothes],
          hair: [...earnedData.hair],
          beard: [...earnedData.beard],
          moustache: [...earnedData.moustache],
        });
        if (!cancelled) {
          setRestricted(restrictedData);
          setEarned(earnedData);
        }
      } catch (e) {
        console.error('[COSMETICS] Error al cargar cosméticos desbloqueados:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { restricted, earned, loading };
}
