import { supabase } from '@/src/services/supabase/client';
import type { RecyclingLog, RecyclingLogInput, RecyclingLogListItem } from '@/src/types/recycling';

/**
 * Delta de racha devuelto por el RPC `confirm_segregation`. Alimenta la celebración (#175):
 * el cliente sabe si esta segregación avanzó la racha, si subió de nivel, etc.
 */
export type StreakResult = {
  recordId: string;
  streakDays: number;
  heat: number;
  level: number;
  previousLevel: number;
  leveledUp: boolean;
  streakExtendedToday: boolean;
  alreadyRecycledToday: boolean;
};

function normalizeUntilDate(untilDate: string | Date): string {
  if (untilDate instanceof Date) {
    return untilDate.toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(untilDate)) {
    return `${untilDate}T23:59:59.999Z`;
  }

  return untilDate;
}

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
  const { data: wasteType } = await supabase
    .from('waste_types')
    .select('estimated_weight_g')
    .eq('id', input.wasteTypeId)
    .single();

  const { data, error } = await supabase
    .from('recycling_records')
    .insert({
      user_id: input.userId,
      waste_type_id: input.wasteTypeId,
      bin_type_id: input.binTypeId,
      recycling_point_id: input.recyclingPointId,
      detection_type: input.detectionType ?? null,
      confidence_score: input.confidenceScore ?? null,
      estimated_weight: wasteType?.estimated_weight_g ?? null,
      status: 'confirmed',
    })
    .select(
      'id, user_id, waste_type_id, bin_type_id, recycling_point_id, detection_type, confidence_score, estimated_weight, created_at',
    )
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

/**
 * Confirma una segregación vía el RPC `confirm_segregation` (SECURITY DEFINER): inserta el
 * `recycling_record` (disparando el trigger de progreso) y devuelve el delta de racha.
 * Sustituye al insert directo en `recycling_records`, que choca con RLS.
 */
export async function confirmSegregation(input: RecyclingLogInput): Promise<StreakResult> {
  const { data, error } = await supabase.rpc('confirm_segregation', {
    p_user_id: input.userId,
    p_waste_type_id: input.wasteTypeId,
    p_bin_type_id: input.binTypeId,
    p_recycling_point_id: input.recyclingPointId,
    p_detection_type: input.detectionType ?? null,
    p_confidence_score: input.confidenceScore ?? null,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) {
    throw new Error(error?.message ?? 'No se pudo registrar la segregacion.');
  }

  return {
    recordId: row.record_id,
    streakDays: row.streak_days ?? 0,
    heat: Math.min(100, Math.max(0, row.heat ?? 0)),
    level: row.level ?? 1,
    previousLevel: row.previous_level ?? 1,
    leveledUp: Boolean(row.leveled_up),
    streakExtendedToday: Boolean(row.streak_extended_today),
    alreadyRecycledToday: Boolean(row.already_recycled_today),
  };
}

export async function getRecyclingLogs(userId: string): Promise<RecyclingLogListItem[]> {
  const { data, error } = await supabase
    .from('recycling_records')
    .select(
      'id, created_at, detection_type, confidence_score, status, waste_types(name), recycling_points(name)',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo obtener el historial de reciclaje.');
  }

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    wasteTypeName: (row.waste_types as unknown as { name: string } | null)?.name ?? 'Desconocido',
    recyclingPointName:
      (row.recycling_points as unknown as { name: string } | null)?.name ?? 'Desconocido',
    detectionType: row.detection_type ?? undefined,
    confidenceScore: row.confidence_score ?? undefined,
    status: row.status ?? undefined,
  }));
}

export async function getRecyclingLogsFiltered(
  userId: string,
  untilDate: string | Date | null = null,
  wasteTypeId: string | null = null,
): Promise<RecyclingLogListItem[]> {
  let query = supabase
    .from('recycling_records')
    .select(
      'id, created_at, detection_type, confidence_score, status, waste_types(name), recycling_points(name)',
    )
    .eq('user_id', userId);

  if (untilDate) {
    query = query.lte('created_at', normalizeUntilDate(untilDate));
  }

  if (wasteTypeId) {
    query = query.eq('waste_type_id', wasteTypeId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo obtener el historial de reciclaje.');
  }

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    wasteTypeName: (row.waste_types as unknown as { name: string } | null)?.name ?? 'Desconocido',
    recyclingPointName:
      (row.recycling_points as unknown as { name: string } | null)?.name ?? 'Desconocido',
    detectionType: row.detection_type ?? undefined,
    confidenceScore: row.confidence_score ?? undefined,
    status: row.status ?? undefined,
  }));
}

export type RecyclingHistoryFilter = {
  wasteTypeIds?: string[] | null;
  fromDate?: string | null;
};

export const RECYCLING_HISTORY_PAGE_SIZE = 20;

/** Página del historial: filtra (categoría + tiempo), ordena por fecha desc y pagina por rango. */
export async function getRecyclingHistoryPage(
  userId: string,
  page: number,
  filter: RecyclingHistoryFilter = {},
  pageSize: number = RECYCLING_HISTORY_PAGE_SIZE,
): Promise<{ items: RecyclingLogListItem[]; hasMore: boolean }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('recycling_records')
    .select(
      'id, created_at, waste_type_id, heat_gained, detection_type, confidence_score, status, waste_types(name), recycling_points(name)',
    )
    .eq('user_id', userId);

  if (filter.wasteTypeIds && filter.wasteTypeIds.length > 0) {
    query = query.in('waste_type_id', filter.wasteTypeIds);
  }
  if (filter.fromDate) {
    query = query.gte('created_at', filter.fromDate);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo obtener el historial de reciclaje.');
  }

  const items: RecyclingLogListItem[] = data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    wasteTypeId: row.waste_type_id ?? undefined,
    wasteTypeName: (row.waste_types as unknown as { name: string } | null)?.name ?? 'Desconocido',
    recyclingPointName:
      (row.recycling_points as unknown as { name: string } | null)?.name ?? 'Desconocido',
    detectionType: row.detection_type ?? undefined,
    confidenceScore: row.confidence_score ?? undefined,
    status: row.status ?? undefined,
    heatGained: row.heat_gained ?? undefined,
  }));

  return { items, hasMore: items.length === pageSize };
}
