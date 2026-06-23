import { supabase } from '@/src/services/supabase/client';
import type { FunFact } from '@/src/types/funFact';
import type { InstructionBody, InstructionStep } from '@reciclame/shared-domain';
import type { Instruction } from '@/src/types/instruction';

type FunFactRow = {
  id: string;
  text: string;
  waste_type_id: string | null;
  is_active: boolean;
  created_at: string;
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
};

function parseStepsFromBody(body: string | null): InstructionStep[] {
  if (!body) return [];
  try {
    const parsed = JSON.parse(body) as InstructionBody;
    return Array.isArray(parsed.steps) ? parsed.steps : [];
  } catch {
    return [];
  }
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
    steps: parseStepsFromBody(row.body),
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
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? null;
}

export async function fetchInstructionWithStepsByWasteTypeId(
  wasteTypeId: string,
): Promise<Instruction | null> {
  const { data, error } = await supabase
    .from('instructions')
    .select('id,title,body,image_url,waste_type_id,is_active,created_at,updated_at')
    .eq('is_active', true)
    .eq('waste_type_id', wasteTypeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const row = pickRandom(data ?? []);
  return row ? mapInstruction(row) : null;
}

export async function fetchRandomFunFactByWasteTypeId(
  wasteTypeId: string,
): Promise<FunFact | null> {
  const { data, error } = await supabase
    .from('fun_facts')
    .select('id,text,waste_type_id,is_active,created_at')
    .eq('is_active', true)
    .eq('waste_type_id', wasteTypeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const row = pickRandom(data ?? []);
  return row ? mapFunFact(row) : null;
}

export async function fetchRandomFunFact(): Promise<FunFact | null> {
  const { data, error } = await supabase
    .from('fun_facts')
    .select('id,text,waste_type_id,is_active,created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const row = pickRandom(data ?? []);
  return row ? mapFunFact(row) : null;
}

export async function fetchFunFacts(): Promise<FunFact[]> {
  const { data, error } = await supabase
    .from('fun_facts')
    .select('id,text,waste_type_id,is_active,created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapFunFact);
}
