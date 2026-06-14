import { supabase } from '@/src/services/supabase/client';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import type { RecyclingPointsSource } from '../types';

/**
 * Obtiene los puntos de reciclaje activos desde Supabase con sus tipos de contenedor disponibles.
 *
 * @returns Lista de puntos de reciclaje con sus tipos de contenedor disponibles.
 * @throws Error si la consulta a Supabase falla.
 */
async function getAll(): Promise<RecyclingContainer[]> {
  const pointsRes = await supabase
    .from('recycling_points')
    .select('id, name, latitude, longitude, recycling_point_bins(bin_type_id, is_active)')
    .eq('is_active', true);

  if (pointsRes.error) throw new Error(pointsRes.error.message);

  return (pointsRes.data ?? []).map((point) => {
    const availableBinTypeIds = (
      point.recycling_point_bins as { bin_type_id: string; is_active?: boolean }[]
    )
      .filter((bin) => bin.is_active !== false)
      .map((bin) => bin.bin_type_id);

    return {
      id: point.id,
      name: point.name,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      acceptedWasteTypeIds: [],
      availableBinTypeIds,
      instructionsByWasteTypeId: {},
    };
  });
}

export const remoteRecyclingPoints: RecyclingPointsSource = { getAll };
