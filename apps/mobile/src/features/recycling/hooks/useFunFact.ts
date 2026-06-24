import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchFunFacts, fetchRandomFunFact, fetchRandomFunFactByWasteTypeId } from '../api/content';
import type { FunFact } from '@/src/types/funFact';

type FunFactState = {
  funFact: FunFact | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useFunFactByWasteTypeId(wasteTypeId?: string): FunFactState {
  const [funFact, setFunFact] = useState<FunFact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!wasteTypeId) {
      setFunFact(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRandomFunFactByWasteTypeId(wasteTypeId);
      setFunFact(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('No se pudo cargar el dato.'));
      setFunFact(null);
    } finally {
      setLoading(false);
    }
  }, [wasteTypeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { funFact, loading, error, refresh };
}

export function useRandomFunFact(): FunFactState {
  const [funFact, setFunFact] = useState<FunFact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRandomFunFact();
      setFunFact(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('No se pudo cargar el dato.'));
      setFunFact(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { funFact, loading, error, refresh };
}

const ROTATION_INTERVAL_MS = 4000;

/**
 * Carga todos los datos curiosos activos y rota entre ellos cada 4 s.
 * Una sola consulta por montaje; el intervalo se limpia al desmontar.
 * @returns fact - Dato curioso actual, null mientras carga o si la BD está vacía.
 * @returns loading - true durante la carga inicial.
 * @returns error - Error si la consulta falla.
 */
export function useRotatingFunFact(enabled = true): { fact: FunFact | null; loading: boolean; error: Error | null } {
  const [facts, setFacts] = useState<FunFact[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    fetchFunFacts()
      .then((data) => {
        if (!mounted) return;
        setFacts(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('No se pudieron cargar los datos curiosos.'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || facts.length === 0) return;
    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % facts.length;
      setIndex(indexRef.current);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [facts, enabled]);

  return { fact: facts[index] ?? null, loading, error };
}
