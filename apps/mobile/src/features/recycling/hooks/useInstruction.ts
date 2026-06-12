import { useCallback, useEffect, useState } from 'react';

import { fetchInstructionWithStepsByWasteTypeId } from '@/src/services/api/content';
import type { Instruction } from '@/src/types/instruction';

type InstructionState = {
  instruction: Instruction | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useInstructionByWasteTypeId(wasteTypeId?: string): InstructionState {
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!wasteTypeId) {
      setInstruction(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchInstructionWithStepsByWasteTypeId(wasteTypeId);
      setInstruction(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('No se pudo cargar el dato.'));
      setInstruction(null);
    } finally {
      setLoading(false);
    }
  }, [wasteTypeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { instruction, loading, error, refresh };
}
