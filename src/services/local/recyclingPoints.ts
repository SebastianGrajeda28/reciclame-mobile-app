import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import { db } from '@/src/services/db';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

type PointRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available_bin_type_ids: string;
  cached_at: string;
};

function rowsToContainers(rows: PointRow[]): RecyclingContainer[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    availableBinTypeIds: JSON.parse(row.available_bin_type_ids) as string[],
    acceptedWasteTypeIds: [],
    instructionsByWasteTypeId: {},
  }));
}

/** Devuelve puntos en caché solo si están frescos (< 24 h). */
export function getLocalRecyclingPoints(): RecyclingContainer[] | null {
  const rows = db.getAllSync<PointRow>(`SELECT * FROM recycling_points`);
  if (rows.length === 0) return null;

  const cachedAt = new Date(rows[0].cached_at).getTime();
  if (Date.now() - cachedAt > CACHE_TTL_MS) return null;

  return rowsToContainers(rows);
}

/** Devuelve puntos en caché aunque estén vencidos (fallback offline). */
export function getLocalRecyclingPointsStale(): RecyclingContainer[] | null {
  const rows = db.getAllSync<PointRow>(`SELECT * FROM recycling_points`);
  return rows.length > 0 ? rowsToContainers(rows) : null;
}

export function saveRecyclingPointsCache(points: RecyclingContainer[]): void {
  const cachedAt = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM recycling_points`);
    for (const point of points) {
      db.runSync(
        `INSERT INTO recycling_points
           (id, name, latitude, longitude, available_bin_type_ids, cached_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          point.id,
          point.name,
          point.latitude,
          point.longitude,
          JSON.stringify(point.availableBinTypeIds),
          cachedAt,
        ],
      );
    }
  });
}

// Lookup helper used when creating offline records.
export function getLocalPointName(pointId: string): string | null {
  const row = db.getFirstSync<{ name: string }>(
    `SELECT name FROM recycling_points WHERE id = ?`,
    [pointId],
  );
  return row?.name ?? null;
}
