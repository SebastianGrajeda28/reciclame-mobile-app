import { supabase } from '@/src/services/supabase/client';
import type { RecyclingLog, RecyclingLogInput, RecyclingLogListItem } from '@/src/types/recycling';
import {
  createLocalRecyclingRecord,
  getLocalRecyclingLogs,
  markRecordSynced,
  upsertRemoteRecord,
} from '@/src/services/local/recyclingRecords';

/**
 * Guarda un registro de reciclaje de forma offline-first:
 * 1. Escribe siempre en SQLite local (disponible sin red).
 * 2. Intenta sincronizar con Supabase inmediatamente si hay conexión.
 * 3. Si falla la red, el registro queda en cola (synced=0) y se envía
 *    automáticamente cuando se restaure la conexión vía useNetworkSync.
 */
export async function createRecyclingLog(input: RecyclingLogInput): Promise<RecyclingLog> {
  console.log(`[RECYCLE] Creando registro — waste: ${input.wasteTypeId}, punto: ${input.recyclingPointId}`);

  const local = createLocalRecyclingRecord(input);
  console.log(`[RECYCLE] Guardado en SQLite local con id=${local.id} (synced=0)`);

  try {
    const { error } = await supabase.from('recycling_records').insert({
      id: local.id,
      user_id: input.userId,
      waste_type_id: input.wasteTypeId,
      bin_type_id: input.binTypeId,
      recycling_point_id: input.recyclingPointId,
      detection_type: input.detectionType ?? null,
      confidence_score: input.confidenceScore ?? null,
      status: 'confirmed',
      created_at: local.createdAt,
    });

    if (!error) {
      markRecordSynced(local.id);
      console.log(`[RECYCLE] ✓ Subido a Supabase en tiempo real (online)`);
    } else {
      console.warn(`[RECYCLE] Supabase rechazo el insert: ${error.message}`);
    }
  } catch (e) {
    console.log(`[RECYCLE] Sin red — registro queda en cola offline: ${local.id}`);
  }

  return local;
}

/**
 * Devuelve el historial de reciclaje:
 * - Con red: obtiene desde Supabase y actualiza la caché local.
 * - Sin red: devuelve la caché local (incluye registros pendientes de sync).
 */
export async function getRecyclingLogs(userId: string): Promise<RecyclingLogListItem[]> {
  console.log(`[HISTORY] Cargando historial para userId=${userId}...`);
  try {
    const { data, error } = await supabase
      .from('recycling_records')
      .select(
        'id, created_at, detection_type, confidence_score, status, waste_types(name), recycling_points(name)',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) throw new Error(error?.message);

    console.log(`[HISTORY] ✓ ${data.length} registros desde Supabase (online)`);

    const items: RecyclingLogListItem[] = data.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      wasteTypeName:
        (row.waste_types as unknown as { name: string } | null)?.name ?? 'Desconocido',
      recyclingPointName:
        (row.recycling_points as unknown as { name: string } | null)?.name ?? 'Desconocido',
      detectionType: row.detection_type ?? undefined,
      confidenceScore: row.confidence_score ?? undefined,
      status: row.status ?? undefined,
    }));

    for (const item of items) {
      upsertRemoteRecord({ ...item, userId });
    }
    console.log(`[HISTORY] Cache local actualizada con ${items.length} registros`);

    return items;
  } catch (e) {
    console.log(`[HISTORY] Sin red — usando cache local. Error: ${e}`);
    const local = getLocalRecyclingLogs(userId);
    console.log(`[HISTORY] Cache local tiene ${local.length} registros`);
    return local;
  }
}
