import { useCallback, useEffect, useMemo, useState } from 'react';

import { haversineDistanceKm } from '@/src/features/recycling/services/distance';
import {
  getRecyclingPoints,
  type NearbyRecyclingPoint,
} from '@/src/features/recycling/services/recycling-points';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

type Params = {
  location: { latitude: number; longitude: number };
  wasteTypeIds?: string[];
};

/**
 * Carga puntos de reciclaje, calcula distancias en cliente y ordena por cercanía.
 * @param location - Coordenadas del usuario para calcular distancias.
 * @param wasteTypeIds - Filtra por tipos de residuo. Sin valor devuelve todos.
 * @returns `{ data, loading, error, refetch }`
 */
export function useNearbyRecyclingPoints({ location, wasteTypeIds }: Params) {
  const [allPoints, setAllPoints] = useState<RecyclingContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAllPoints(await getRecyclingPoints());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar puntos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const data = useMemo<NearbyRecyclingPoint[]>(() => {
    const wasteSet = wasteTypeIds?.length ? new Set(wasteTypeIds) : null;
    return allPoints
      .map((p) => ({
        ...p,
        distanceKm: haversineDistanceKm(location, { latitude: p.latitude, longitude: p.longitude }),
      }))
      .filter((p) => !wasteSet || p.acceptedWasteTypeIds.some((id) => wasteSet.has(id)))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [allPoints, location, wasteTypeIds]);

  return { data, loading, error, refetch: load };
}
