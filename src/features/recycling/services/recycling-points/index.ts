import { RECYCLE_POINTS_USE_MOCKS } from '@/src/features/recycling/services/config';
import { mockRecyclingPoints } from './mocks/mock-recycling-points';
import { remoteRecyclingPoints } from './providers/remote-recycling-points';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import {
  getLocalRecyclingPoints,
  getLocalRecyclingPointsStale,
  saveRecyclingPointsCache,
} from '@/src/services/local/recyclingPoints';

export type { NearbyRecyclingPoint } from './types';

/**
 * Obtiene los puntos de reciclaje con estrategia caché-first:
 * 1. Si hay caché local fresco (< 24 h), lo devuelve sin hacer red.
 * 2. Si no, consulta Supabase, guarda en caché y devuelve.
 * 3. Si Supabase falla (sin red), devuelve la caché aunque esté vencida.
 */
export async function getRecyclingPoints(): Promise<RecyclingContainer[]> {
  if (RECYCLE_POINTS_USE_MOCKS) {
    console.log('[POINTS] Usando datos mock de puntos de reciclaje');
    return mockRecyclingPoints.getAll();
  }

  const cached = getLocalRecyclingPoints();
  if (cached) {
    console.log(`[POINTS] ✓ ${cached.length} puntos desde cache local (fresca)`);
    return cached;
  }

  console.log('[POINTS] Cache vencida o vacia — consultando Supabase...');
  try {
    const points = await remoteRecyclingPoints.getAll();
    console.log(`[POINTS] ✓ ${points.length} puntos desde Supabase — guardando en cache`);
    if (points.length > 0) saveRecyclingPointsCache(points);
    return points;
  } catch (e) {
    console.warn('[POINTS] Sin red — usando cache vencida. Error:', e);
    const stale = getLocalRecyclingPointsStale();
    console.log(`[POINTS] Cache vencida tiene ${stale?.length ?? 0} puntos`);
    return stale ?? [];
  }
}
