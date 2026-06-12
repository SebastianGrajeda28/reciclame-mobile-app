import { useEffect, useState } from 'react';

import { getBinTypeByWasteTypeId } from '@/src/features/recycling/services/binTypeResolution';
import { PUCP_UNIVERSITY_ID } from '@/src/features/recycling/services/waste-type-bin-types.mock';
import type { BinType } from '@/src/features/recycling/types/recycling.types';

type ResolvedBinTypeState = {
  binType: BinType | null;
  loading: boolean;
  error: Error | null;
};

export function useResolvedBinType(wasteTypeId?: string): ResolvedBinTypeState {
  const [binType, setBinType] = useState<BinType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveBinType() {
      if (!wasteTypeId) {
        setBinType(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const resolved = await getBinTypeByWasteTypeId(wasteTypeId, PUCP_UNIVERSITY_ID);
        if (!cancelled) {
          setBinType(resolved);
        }
      } catch (unknownError) {
        const resolvedError =
          unknownError instanceof Error
            ? unknownError
            : new Error('No se pudo resolver el contenedor institucional.');
        console.error('No se pudo resolver el contenedor institucional.', resolvedError);
        if (!cancelled) {
          setBinType(null);
          setError(resolvedError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    resolveBinType();

    return () => {
      cancelled = true;
    };
  }, [wasteTypeId]);

  return { binType, loading, error };
}
