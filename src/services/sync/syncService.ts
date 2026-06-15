import {
  refreshFunFactsCache,
  refreshInstructionsCache,
  isFunFactsCacheStale,
  isInstructionsCacheStale,
} from '@/src/services/api/content';
import {
  refreshRecyclingPointsCache,
  isRecyclingPointsCacheStale,
} from '@/src/features/recycling/services/recycling-points';
import { supabase } from '@/src/services/supabase/client';
import {
  getPendingRecyclingRecords,
  markRecordSynced,
} from '@/src/services/local/recyclingRecords';

let isSyncing = false;
let isRefreshing = false;

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

/**
 * Actualiza las cachés locales de contenido estático (fun facts, instrucciones,
 * puntos de reciclaje) si están vencidas. Se llama automáticamente al reconectar.
 * Usa un semáforo para evitar refrescos simultáneos.
 */
export async function refreshStaleContentCaches(): Promise<void> {
  if (isRefreshing) {
    console.log('[SYNC] Ya hay un refresco de cache en curso, saltando.');
    return;
  }
  isRefreshing = true;

  const tasks: Array<{ name: string; stale: boolean; refresh: () => Promise<void> }> = [
    {
      name: 'fun_facts',
      stale: isFunFactsCacheStale(),
      refresh: refreshFunFactsCache,
    },
    {
      name: 'instructions',
      stale: isInstructionsCacheStale(),
      refresh: refreshInstructionsCache,
    },
    {
      name: 'recycling_points',
      stale: isRecyclingPointsCacheStale(),
      refresh: refreshRecyclingPointsCache,
    },
  ];

  const staleNames = tasks.filter((t) => t.stale).map((t) => t.name);
  if (staleNames.length === 0) {
    console.log('[SYNC] Todas las caches estan frescas — no se necesita refresco');
    isRefreshing = false;
    return;
  }

  console.log(`[SYNC] Caches vencidas: ${staleNames.join(', ')} — refrescando...`);

  await Promise.allSettled(
    tasks
      .filter((t) => t.stale)
      .map(async (t) => {
        try {
          await t.refresh();
        } catch (e) {
          console.warn(`[SYNC] Error al refrescar cache de ${t.name}:`, e);
        }
      }),
  );

  isRefreshing = false;
  console.log('[SYNC] Refresco de caches completado');
}
