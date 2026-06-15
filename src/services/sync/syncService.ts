import { supabase } from '@/src/services/supabase/client';
import {
  getPendingRecyclingRecords,
  markRecordSynced,
} from '@/src/services/local/recyclingRecords';

let isSyncing = false;

/**
 * Envía a Supabase todos los registros de reciclaje que aún no se han sincronizado.
 * Es seguro llamarlo múltiples veces: usa un semáforo simple para evitar solapamiento.
 */
export async function syncPendingRecords(): Promise<void> {
  if (isSyncing) {
    console.log('[SYNC] Ya hay una sincronizacion en curso, saltando.');
    return;
  }
  isSyncing = true;

  try {
    const pending = getPendingRecyclingRecords();
    console.log(`[SYNC] Registros pendientes de subir: ${pending.length}`);

    if (pending.length === 0) return;

    let synced = 0;
    let failed = 0;

    for (const record of pending) {
      try {
        console.log(`[SYNC] Subiendo registro ${record.id} (waste: ${record.wasteTypeId})...`);
        const { error } = await supabase.from('recycling_records').insert({
          id: record.id,
          user_id: record.userId,
          waste_type_id: record.wasteTypeId ?? null,
          bin_type_id: record.binTypeId ?? null,
          recycling_point_id: record.recyclingPointId ?? null,
          detection_type: record.detectionType ?? null,
          confidence_score: record.confidenceScore ?? null,
          status: 'confirmed',
          created_at: record.createdAt,
        });

        if (!error) {
          markRecordSynced(record.id);
          synced++;
          console.log(`[SYNC] ✓ Registro ${record.id} sincronizado OK`);
        } else {
          failed++;
          console.warn(`[SYNC] ✗ Error al subir ${record.id}: ${error.message}`);
        }
      } catch (e) {
        failed++;
        console.warn(`[SYNC] ✗ Excepcion al subir ${record.id}:`, e);
      }
    }

    console.log(`[SYNC] Resultado: ${synced} subidos, ${failed} fallidos`);
  } finally {
    isSyncing = false;
  }
}
