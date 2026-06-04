import { supabase } from '@/src/services/supabase/client';
import type { RecyclingLog, RecyclingLogInput } from '@/src/types/recycling';

/**
 * Guarda el registro final de una acción de segregación en Supabase.
 *
 * La iteración 1 asume conectividad online: inserta directamente en
 * `recycling_records`. El soporte para guardado offline / sincronización
 * diferida queda pendiente para una siguiente iteración.
 *
 * @param input Datos de la segregación confirmada por el estudiante.
 * @returns El registro recién creado, tal como lo devuelve la base.
 * @throws Error si la inserción falla (red, RLS, restricciones de FK, etc.).
 */
export async function createRecyclingLog(input: RecyclingLogInput): Promise<RecyclingLog> {
  const { data, error } = await supabase
    .from('recycling_records')
    .insert({
      user_id: input.userId,
      waste_type_id: input.wasteTypeId,
      bin_type_id: input.binTypeId,
      recycling_point_id: input.recyclingPointId,
      detection_type: input.detectionType ?? null,
      confidence_score: input.confidenceScore ?? null,
      status: 'confirmed',
    })
    .select('id, user_id, waste_type_id, bin_type_id, recycling_point_id, detection_type, confidence_score, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo registrar la segregacion.');
  }

  return {
    id: data.id,
    userId: data.user_id,
    wasteTypeId: data.waste_type_id,
    binTypeId: data.bin_type_id,
    recyclingPointId: data.recycling_point_id,
    detectionType: data.detection_type ?? undefined,
    confidenceScore: data.confidence_score ?? undefined,
    createdAt: data.created_at,
  };
}
