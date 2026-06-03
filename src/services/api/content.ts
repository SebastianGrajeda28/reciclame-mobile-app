import { supabase } from '@/src/services/supabase/client';
import type { FunFact } from '@/src/types/funFact';
import type { Instruction, InstructionStep } from '@/src/types/instruction';

type FunFactRow = {
  id: string;
  text: string;
  waste_type_id: string | null;
  is_active: boolean;
  created_at: string;
};

type InstructionStepRow = {
  id: string;
  instruction_id: string;
  text: string;
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
    isActive: row.is_active,
    createdAt: row.created_at as unknown as Date,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

function mapInstruction(row: InstructionRow): Instruction {
  const steps = (row.instruction_steps ?? []).filter(Boolean).map(mapInstructionStep);

  return {
    id: row.id,
    title: row.title,
    body: row.body ?? undefined,
    imageUrl: row.image_url ?? undefined,
    wasteTypeId: row.waste_type_id ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at as unknown as Date,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    steps,
  };
}

function mapFunFact(row: FunFactRow): FunFact {
  return {
    id: row.id,
    text: row.text,
    wasteTypeId: row.waste_type_id ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at as unknown as Date,
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
    .select(
      'id,title,body,image_url,waste_type_id,is_active,created_at,updated_at,instruction_steps(id,instruction_id,text,is_active,created_at,updated_at)',
    )
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

/**
 * Obtiene todos los datos curiosos activos para rotar en memoria.
 * @returns Lista de datos curiosos activos (puede estar vacía si la BD no tiene datos).
 * @throws Error si la consulta a Supabase falla.
 */
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
