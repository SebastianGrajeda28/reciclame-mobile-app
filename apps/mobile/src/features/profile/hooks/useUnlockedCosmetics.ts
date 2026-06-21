import { useEffect, useState } from 'react';

import { getRestrictedCosmetics, getEarnedRestrictedCosmetics, RestrictedCosmetics } from '@/src/features/profile/api/avatar';
import { useCosmeticsInvalidation } from '@/src/contexts/CosmeticsInvalidationContext';
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
  const { version } = useCosmeticsInvalidation();
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
        if (!cancelled) {
          setRestricted(restrictedData);
          setEarned(earnedData);
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, version]);

  return { restricted, earned, loading };
}
