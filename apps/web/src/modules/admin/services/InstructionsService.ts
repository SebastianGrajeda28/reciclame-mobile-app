import { supabase } from "@/lib/supabase";

export type Instruction = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  wasteTypeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type StepOrderBody = { stepOrder: string[] };

export type InstructionPayload = {
  title?: string;
  wasteTypeId?: string | null;
  body?: string | null;
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
  };
}

export function parseStepOrder(instruction: Instruction): string[] {
  if (!instruction.body) return [];
  try {
    const parsed = JSON.parse(instruction.body) as StepOrderBody;
    return Array.isArray(parsed.stepOrder) ? parsed.stepOrder : [];
  } catch {
    return [];
  }
}

export function encodeStepOrder(ids: string[]): string {
  return JSON.stringify({ stepOrder: ids } satisfies StepOrderBody);
}

export async function getInstructions(): Promise<Instruction[]> {
  const { data, error } = await supabase
    .from("instructions")
    .select("id, title, body, image_url, waste_type_id, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInstruction);
}

export async function createInstruction(values: InstructionPayload) {
  const { data, error } = await supabase
    .from("instructions")
    .insert({
      title: values.title,
      waste_type_id: values.wasteTypeId ?? null,
      body: values.body ?? null,
    })
    .select("id, title, body, image_url, waste_type_id, is_active, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstruction(data);
}

export async function updateInstruction(id: string, values: InstructionPayload) {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (values.title !== undefined) patch.title = values.title;
  if (values.wasteTypeId !== undefined) patch.waste_type_id = values.wasteTypeId;
  if (values.body !== undefined) patch.body = values.body;

  const { data, error } = await supabase
    .from("instructions")
    .update(patch)
    .eq("id", id)
    .select("id, title, body, image_url, waste_type_id, is_active, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstruction(data);
}

export async function deactivateInstruction(id: string) {
  const { data, error } = await supabase
    .from("instructions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, title, body, image_url, waste_type_id, is_active, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstruction(data);
}

export async function restoreInstruction(id: string) {
  const { data, error } = await supabase
    .from("instructions")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, title, body, image_url, waste_type_id, is_active, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstruction(data);
}
