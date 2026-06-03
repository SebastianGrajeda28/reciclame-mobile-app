import { supabase } from '@/src/services/supabase/client';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import type { RecyclingPointsSource } from '../types';

/**
 * Obtiene los puntos de reciclaje activos desde Supabase, resolviendo
 * los tipos de residuo aceptados vía recycling_point_bins → waste_types.recommended_bin_type_id.
 *
 * @returns Lista de puntos de reciclaje con sus tipos de residuo aceptados.
 * @throws Error si alguna de las consultas a Supabase falla.
 */
async function getAll(): Promise<RecyclingContainer[]> {
  const [pointsRes, wasteTypesRes] = await Promise.all([
    supabase
      .from('recycling_points')
      .select('id, name, latitude, longitude, recycling_point_bins(bin_type_id)')
      .eq('is_active', true),
    supabase
      .from('waste_types')
      .select('id, recommended_bin_type_id')
      .eq('is_active', true),
  ]);

  if (pointsRes.error) throw new Error(pointsRes.error.message);
  if (wasteTypesRes.error) throw new Error(wasteTypesRes.error.message);

  const wasteTypes = wasteTypesRes.data ?? [];

  return (pointsRes.data ?? []).map((point) => {
    const binTypeIds = (point.recycling_point_bins as { bin_type_id: string }[]).map(
      (b) => b.bin_type_id,
    );
    const acceptedWasteTypeIds = wasteTypes
      .filter((wt) => wt.recommended_bin_type_id && binTypeIds.includes(wt.recommended_bin_type_id))
      .map((wt) => wt.id);

    return {
      id: point.id,
      name: point.name,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      acceptedWasteTypeIds,
      instructionsByWasteTypeId: {},
    };
  });
}

export const remoteRecyclingPoints: RecyclingPointsSource = { getAll };
