import type { FunFact } from '@/src/types/funFact';
import type { Instruction, InstructionStep } from '@/src/types/instruction';
import { db } from '@/src/services/db';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Fun facts
// ---------------------------------------------------------------------------

type FunFactRow = {
  id: string;
  text: string;
  waste_type_id: string | null;
  is_active: number;
  cached_at: string;
};

function mapFunFactRow(row: FunFactRow): FunFact {
  return {
    id: row.id,
    text: row.text,
    wasteTypeId: row.waste_type_id ?? undefined,
    isActive: row.is_active === 1,
  };
}

function isFreshCache(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;
}

export function isFunFactsCacheStale(): boolean {
  const row = db.getFirstSync<{ cached_at: string }>(`SELECT cached_at FROM fun_facts LIMIT 1`);
  return !row || !isFreshCache(row.cached_at);
}

export function isInstructionsCacheStale(): boolean {
  const row = db.getFirstSync<{ cached_at: string }>(
    `SELECT cached_at FROM instructions LIMIT 1`,
  );
  return !row || !isFreshCache(row.cached_at);
}

export function getLocalFunFacts(wasteTypeId?: string): FunFact[] | null {
  const rows = wasteTypeId
    ? db.getAllSync<FunFactRow>(
        `SELECT * FROM fun_facts WHERE waste_type_id = ? AND is_active = 1`,
        [wasteTypeId],
      )
    : db.getAllSync<FunFactRow>(`SELECT * FROM fun_facts WHERE is_active = 1`);

  if (rows.length === 0) return null;
  if (!isFreshCache(rows[0].cached_at)) return null;

  return rows.map(mapFunFactRow);
}

export function saveFunFactsCache(facts: FunFact[]): void {
  const cachedAt = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM fun_facts`);
    for (const fact of facts) {
      db.runSync(
        `INSERT INTO fun_facts (id, text, waste_type_id, is_active, cached_at)
         VALUES (?, ?, ?, ?, ?)`,
        [fact.id, fact.text, fact.wasteTypeId ?? null, fact.isActive ? 1 : 0, cachedAt],
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Instructions
// ---------------------------------------------------------------------------

type InstructionRow = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  waste_type_id: string | null;
  is_active: number;
  created_at: string;
  updated_at: string | null;
  steps_json: string;
  cached_at: string;
};

function mapInstructionRow(row: InstructionRow): Instruction {
  const steps: InstructionStep[] = JSON.parse(row.steps_json) as InstructionStep[];
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.image_url,
    wasteTypeId: row.waste_type_id,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps,
  };
}

export function getLocalInstruction(wasteTypeId: string): Instruction | null {
  const row = db.getFirstSync<InstructionRow>(
    `SELECT * FROM instructions WHERE waste_type_id = ? AND is_active = 1 ORDER BY created_at DESC`,
    [wasteTypeId],
  );
  if (!row) return null;
  if (!isFreshCache(row.cached_at)) return null;
  return mapInstructionRow(row);
}

export function saveInstructionsCache(instructions: Instruction[]): void {
  const cachedAt = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM instructions`);
    for (const inst of instructions) {
      db.runSync(
        `INSERT INTO instructions
           (id, title, body, image_url, waste_type_id, is_active,
            created_at, updated_at, steps_json, cached_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inst.id,
          inst.title,
          inst.body ?? null,
          inst.imageUrl ?? null,
          inst.wasteTypeId ?? null,
          inst.isActive ? 1 : 0,
          inst.createdAt,
          inst.updatedAt ?? null,
          JSON.stringify(inst.steps ?? []),
          cachedAt,
        ],
      );
    }
  });
}
