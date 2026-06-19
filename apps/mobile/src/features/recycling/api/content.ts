import { supabase } from '@/src/services/supabase/client';
import type { FunFact } from '@/src/types/funFact';
import type { Instruction, InstructionStep } from '@/src/types/instruction';
import {
  getLocalFunFacts,
  saveFunFactsCache,
  getLocalInstruction,
  saveInstructionsCache,
} from '@/src/services/local/content';

export { isFunFactsCacheStale, isInstructionsCacheStale } from '@/src/services/local/content';

type FunFactRow = {
  id: string;
  text: string;
  waste_type_id: string | null;
  is_active: boolean;
};

type InstructionStepRow = {
  id: string;
  instruction_id: string;
  text: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

type InstructionRow = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  waste_type_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  instruction_steps?: InstructionStepRow[] | null;
};

function mapInstructionStep(row: InstructionStepRow): InstructionStep {
  return {
    id: row.id,
    instructionId: row.instruction_id,
    text: row.text,
    imageUrl: row.image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInstruction(row: InstructionRow): Instruction {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.image_url,
    wasteTypeId: row.waste_type_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps: (row.instruction_steps ?? []).map(mapInstructionStep),
  };
}

function mapFunFact(row: FunFactRow): FunFact {
  return {
    id: row.id,
    text: row.text,
    wasteTypeId: row.waste_type_id ?? undefined,
    isActive: row.is_active,
  };
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

// ---------------------------------------------------------------------------
// Instrucciones — caché-first
// ---------------------------------------------------------------------------

export async function fetchInstructionWithStepsByWasteTypeId(
  wasteTypeId: string,
): Promise<Instruction | null> {
  const cached = getLocalInstruction(wasteTypeId);
  if (cached) {
    console.log(`[CONTENT] Instruccion para waste=${wasteTypeId} desde cache: "${cached.title}"`);
    return cached;
  }

  console.log(`[CONTENT] Instruccion para waste=${wasteTypeId} — consultando Supabase...`);
  try {
    const { data, error } = await supabase
      .from('instructions')
      .select(
        'id,title,body,image_url,waste_type_id,is_active,created_at,updated_at,' +
          'instruction_steps(id,instruction_id,text,image_url,is_active,created_at,updated_at)',
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const all = ((data ?? []) as unknown as InstructionRow[]).map(mapInstruction);
    console.log(`[CONTENT] ${all.length} instrucciones desde Supabase — guardando en cache`);
    if (all.length > 0) saveInstructionsCache(all);

    const forType = all.filter((i) => i.wasteTypeId === wasteTypeId);
    return pickRandom(forType);
  } catch (e) {
    console.warn('[CONTENT] Sin red y sin cache de instrucciones:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Datos curiosos — caché-first
// ---------------------------------------------------------------------------

async function ensureFunFactsCache(): Promise<FunFact[]> {
  console.log('[CONTENT] Cargando fun facts desde Supabase...');
  const { data, error } = await supabase
    .from('fun_facts')
    .select('id,text,waste_type_id,is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const facts = ((data ?? []) as unknown as FunFactRow[]).map(mapFunFact);
  console.log(`[CONTENT] ${facts.length} fun facts desde Supabase — guardando en cache`);
  if (facts.length > 0) saveFunFactsCache(facts);
  return facts;
}

export async function fetchRandomFunFactByWasteTypeId(
  wasteTypeId: string,
): Promise<FunFact | null> {
  const localAll = getLocalFunFacts();
  if (localAll) {
    const match = pickRandom(localAll.filter((f) => f.wasteTypeId === wasteTypeId));
    console.log(
      `[CONTENT] Fun fact para waste=${wasteTypeId}: "${match?.text.slice(0, 40) ?? 'ninguno'}" (cache)`,
    );
    return match;
  }

  try {
    const all = await ensureFunFactsCache();
    return pickRandom(all.filter((f) => f.wasteTypeId === wasteTypeId));
  } catch (e) {
    console.warn('[CONTENT] Sin red y sin cache de fun facts:', e);
    return null;
  }
}

export async function fetchRandomFunFact(): Promise<FunFact | null> {
  const local = getLocalFunFacts();
  if (local) return pickRandom(local);

  try {
    const all = await ensureFunFactsCache();
    return pickRandom(all);
  } catch {
    return null;
  }
}

export async function fetchFunFacts(): Promise<FunFact[]> {
  const local = getLocalFunFacts();
  if (local) return local;

  try {
    return await ensureFunFactsCache();
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Refresco forzado de cachés (llamado al reconectar)
// ---------------------------------------------------------------------------

export async function refreshFunFactsCache(): Promise<void> {
  console.log('[CONTENT] Refrescando cache de fun facts...');
  const facts = await ensureFunFactsCache();
  console.log(`[CONTENT] Fun facts actualizados en cache: ${facts.length}`);
}

export async function refreshInstructionsCache(): Promise<void> {
  console.log('[CONTENT] Refrescando cache de instrucciones...');

  const { data, error } = await supabase
    .from('instructions')
    .select(
      'id,title,body,image_url,waste_type_id,is_active,created_at,updated_at,' +
        'instruction_steps(id,instruction_id,text,image_url,is_active,created_at,updated_at)',
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const all = ((data ?? []) as unknown as InstructionRow[]).map(mapInstruction);
  if (all.length > 0) saveInstructionsCache(all);
  console.log(`[CONTENT] Instrucciones actualizadas en cache: ${all.length}`);
}
