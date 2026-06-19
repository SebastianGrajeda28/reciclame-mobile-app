import * as Crypto from 'expo-crypto';

import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import type { RecyclingLog, RecyclingLogInput, RecyclingLogListItem } from '@/src/types/recycling';
import { db } from '@/src/services/db';
import { getLocalPointName } from './recyclingPoints';

type RecyclingRecordRow = {
  id: string;
  user_id: string;
  waste_type_id: string | null;
  waste_type_name: string | null;
  bin_type_id: string | null;
  recycling_point_id: string | null;
  recycling_point_name: string | null;
  detection_type: string | null;
  confidence_score: number | null;
  estimated_weight: number | null;
  status: string | null;
  created_at: string;
  synced: number;
};

export function createLocalRecyclingRecord(
  input: RecyclingLogInput,
): RecyclingLog & { id: string } {
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const wasteTypeName =
    wasteTypes.find((w) => w.id === input.wasteTypeId)?.label ?? 'Desconocido';
  const recyclingPointName = getLocalPointName(input.recyclingPointId) ?? 'Desconocido';

  db.runSync(
    `INSERT INTO recycling_records
       (id, user_id, waste_type_id, waste_type_name, bin_type_id,
        recycling_point_id, recycling_point_name, detection_type,
        confidence_score, status, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 0)`,
    [
      id,
      input.userId,
      input.wasteTypeId,
      wasteTypeName,
      input.binTypeId,
      input.recyclingPointId,
      recyclingPointName,
      input.detectionType ?? null,
      input.confidenceScore ?? null,
      createdAt,
    ],
  );

  console.log(`[DB] Registro creado localmente: id=${id}, waste=${input.wasteTypeId}`);

  return {
    id,
    userId: input.userId,
    wasteTypeId: input.wasteTypeId,
    binTypeId: input.binTypeId,
    recyclingPointId: input.recyclingPointId,
    detectionType: input.detectionType,
    confidenceScore: input.confidenceScore,
    createdAt,
  };
}

export function getLocalRecyclingLogs(userId: string): RecyclingLogListItem[] {
  const rows = db.getAllSync<RecyclingRecordRow>(
    `SELECT * FROM recycling_records WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    wasteTypeName: row.waste_type_name ?? 'Desconocido',
    recyclingPointName: row.recycling_point_name ?? 'Desconocido',
    detectionType: (row.detection_type as 'auto' | 'manual') ?? undefined,
    confidenceScore: row.confidence_score ?? undefined,
    status: row.status ?? undefined,
  }));
}

export function getPendingRecyclingRecords(): RecyclingLog[] {
  return db
    .getAllSync<RecyclingRecordRow>(
      `SELECT * FROM recycling_records WHERE synced = 0 ORDER BY created_at ASC`,
    )
    .map((row) => ({
      id: row.id,
      userId: row.user_id,
      wasteTypeId: row.waste_type_id ?? '',
      binTypeId: row.bin_type_id ?? '',
      recyclingPointId: row.recycling_point_id ?? '',
      detectionType: (row.detection_type as 'auto' | 'manual') ?? undefined,
      confidenceScore: row.confidence_score ?? undefined,
      createdAt: row.created_at,
    }));
}

export function markRecordSynced(id: string): void {
  db.runSync(`UPDATE recycling_records SET synced = 1 WHERE id = ?`, [id]);
}

export function upsertRemoteRecord(
  item: RecyclingLogListItem & { userId: string },
): void {
  db.runSync(
    `INSERT OR REPLACE INTO recycling_records
       (id, user_id, waste_type_id, waste_type_name, recycling_point_name,
        detection_type, confidence_score, status, created_at, synced)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, 1)`,
    [
      item.id,
      item.userId,
      item.wasteTypeName,
      item.recyclingPointName,
      item.detectionType ?? null,
      item.confidenceScore ?? null,
      item.status ?? 'confirmed',
      item.createdAt,
    ],
  );
}
