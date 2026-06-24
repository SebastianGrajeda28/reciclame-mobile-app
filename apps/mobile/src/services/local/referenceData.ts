import type { BinType, WasteType, WasteCategoryId } from '@/src/features/recycling/types/recycling.types';
import { db } from '@/src/services/db';

const REF_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días — datos de referencia cambian poco

function isFreshCache(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < REF_CACHE_TTL_MS;
}

// ---------------------------------------------------------------------------
// Mapeo estático ID → categoría (el remote no almacena categoryId, es concepto UI)
// ---------------------------------------------------------------------------

const WASTE_TYPE_CATEGORY: Record<string, { categoryId: WasteCategoryId; categoryLabel: string }> = {
  '11111111-1111-1111-1111-000000000001': { categoryId: 'cardboard',        categoryLabel: 'Cartón' },
  '11111111-1111-1111-1111-000000000002': { categoryId: 'plastic_bottle',   categoryLabel: 'Botella plástica' },
  '11111111-1111-1111-1111-000000000003': { categoryId: 'non_recoverable',  categoryLabel: 'No aprovechables' },
  '11111111-1111-1111-1111-000000000004': { categoryId: 'glass',            categoryLabel: 'Vidrio' },
  '11111111-1111-1111-1111-000000000005': { categoryId: 'battery',          categoryLabel: 'Pilas' },
  '11111111-1111-1111-1111-000000000006': { categoryId: 'electronic_waste', categoryLabel: 'RAEE' },
  '11111111-1111-1111-1111-000000000007': { categoryId: 'plastic',          categoryLabel: 'Plástico' },
  '11111111-1111-1111-1111-000000000008': { categoryId: 'metal',            categoryLabel: 'Metal' },
  '11111111-1111-1111-1111-000000000009': { categoryId: 'paper',            categoryLabel: 'Papel' },
  '11111111-1111-1111-1111-000000000010': { categoryId: 'organic',          categoryLabel: 'Orgánico' },
};

// ---------------------------------------------------------------------------
// Waste types
// ---------------------------------------------------------------------------

type WasteTypeRow = {
  id: string;
  name: string;
  description: string | null;
  estimated_weight_g: number;
  cached_at: string;
};

export function isWasteTypesCacheStale(): boolean {
  const row = db.getFirstSync<{ cached_at: string }>(`SELECT cached_at FROM waste_types LIMIT 1`);
  const stale = !row || !isFreshCache(row.cached_at);
  console.log(`[LOCAL] waste_types cache: ${stale ? 'VENCIDA' : 'fresca'} (cached_at=${row?.cached_at ?? 'ninguna'})`);
  return stale;
}

export function getLocalWasteTypes(): WasteType[] | null {
  const rows = db.getAllSync<WasteTypeRow>(`SELECT * FROM waste_types`);
  if (rows.length === 0) {
    console.log('[LOCAL] waste_types: tabla vacía → null');
    return null;
  }
  if (!isFreshCache(rows[0].cached_at)) {
    console.log(`[LOCAL] waste_types: cache vencida (${rows[0].cached_at}) → null`);
    return null;
  }
  console.log(`[LOCAL] waste_types: HIT — ${rows.length} tipos desde SQLite`);
  return rows.map((row) => {
    const cat = WASTE_TYPE_CATEGORY[row.id];
    return {
      id: row.id,
      label: row.name,
      description: row.description ?? undefined,
      categoryId: cat?.categoryId ?? 'non_recoverable',
      categoryLabel: cat?.categoryLabel ?? 'Desconocido',
    };
  });
}

export function saveWasteTypesCache(types: WasteType[]): void {
  const cachedAt = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM waste_types`);
    for (const t of types) {
      db.runSync(
        `INSERT INTO waste_types (id, name, description, estimated_weight_g, cached_at)
         VALUES (?, ?, ?, ?, ?)`,
        [t.id, t.label, t.description ?? null, 50, cachedAt],
      );
    }
  });
  console.log(`[LOCAL] waste_types: ${types.length} tipos guardados en SQLite`);
}

// ---------------------------------------------------------------------------
// Bin types
// ---------------------------------------------------------------------------

type BinTypeRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  deposit_instruction: string | null;
  cached_at: string;
};

export function isBinTypesCacheStale(): boolean {
  const row = db.getFirstSync<{ cached_at: string }>(`SELECT cached_at FROM bin_types LIMIT 1`);
  const stale = !row || !isFreshCache(row.cached_at);
  console.log(`[LOCAL] bin_types cache: ${stale ? 'VENCIDA' : 'fresca'} (cached_at=${row?.cached_at ?? 'ninguna'})`);
  return stale;
}

export function getLocalBinTypes(): BinType[] | null {
  const rows = db.getAllSync<BinTypeRow>(`SELECT * FROM bin_types`);
  if (rows.length === 0) {
    console.log('[LOCAL] bin_types: tabla vacía → null');
    return null;
  }
  if (!isFreshCache(rows[0].cached_at)) {
    console.log(`[LOCAL] bin_types: cache vencida → null`);
    return null;
  }
  console.log(`[LOCAL] bin_types: HIT — ${rows.length} contenedores desde SQLite`);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url,
    depositInstruction: row.deposit_instruction,
  }));
}

export function saveBinTypesCache(types: BinType[]): void {
  const cachedAt = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM bin_types`);
    for (const t of types) {
      db.runSync(
        `INSERT INTO bin_types (id, name, description, image_url, deposit_instruction, cached_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [t.id, t.name, t.description ?? null, t.imageUrl, t.depositInstruction, cachedAt],
      );
    }
  });
  console.log(`[LOCAL] bin_types: ${types.length} contenedores guardados en SQLite`);
}

// ---------------------------------------------------------------------------
// Waste type → bin type mappings
// ---------------------------------------------------------------------------

export function isMappingsCacheStale(): boolean {
  const row = db.getFirstSync<{ cached_at: string }>(
    `SELECT cached_at FROM waste_type_bin_type_mappings LIMIT 1`,
  );
  const stale = !row || !isFreshCache(row.cached_at);
  console.log(`[LOCAL] mappings cache: ${stale ? 'VENCIDA' : 'fresca'} (cached_at=${row?.cached_at ?? 'ninguna'})`);
  return stale;
}

export function getLocalBinTypeForMapping(
  wasteTypeId: string,
  universityId: string,
): BinType | null {
  const row = db.getFirstSync<BinTypeRow>(
    `SELECT b.id, b.name, b.description, b.image_url, b.deposit_instruction, b.cached_at
     FROM waste_type_bin_type_mappings m
     JOIN bin_types b ON b.id = m.bin_type_id
     WHERE m.waste_type_id = ? AND m.university_id = ?`,
    [wasteTypeId, universityId],
  );
  if (!row) {
    console.log(`[LOCAL] mapping MISS — wasteTypeId=${wasteTypeId}`);
    return null;
  }
  console.log(`[LOCAL] mapping HIT — wasteTypeId=${wasteTypeId} → binType="${row.name}"`);
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url,
    depositInstruction: row.deposit_instruction,
  };
}

type MappingInput = { wasteTypeId: string; universityId: string; binTypeId: string };

export function saveMappingsCache(mappings: MappingInput[]): void {
  const cachedAt = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM waste_type_bin_type_mappings`);
    for (const m of mappings) {
      db.runSync(
        `INSERT INTO waste_type_bin_type_mappings (waste_type_id, university_id, bin_type_id, cached_at)
         VALUES (?, ?, ?, ?)`,
        [m.wasteTypeId, m.universityId, m.binTypeId, cachedAt],
      );
    }
  });
  console.log(`[LOCAL] mappings: ${mappings.length} entradas guardadas en SQLite`);
}
