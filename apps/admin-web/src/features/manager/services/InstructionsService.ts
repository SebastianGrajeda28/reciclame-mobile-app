import { supabase } from "@/lib/supabase";
import type { Instruction, InstructionBody, InstructionPayload, InstructionStep } from "@reciclame/shared-domain";

export type { Instruction, InstructionBody, InstructionStep, InstructionPayload };

type InstructionRow = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  waste_type_id: string | null;
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
    isActive: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseSteps(instruction: Instruction): InstructionStep[] {
  if (!instruction.body) return [];
  try {
    const parsed = JSON.parse(instruction.body) as InstructionBody;
    return Array.isArray(parsed.steps) ? parsed.steps : [];
  } catch {
    return [];
  }
}

export function encodeSteps(steps: InstructionStep[]): string {
  return JSON.stringify({ steps } satisfies InstructionBody);
}

export async function getInstructions(): Promise<Instruction[]> {
  const { data, error } = await supabase
    .from("instructions")
    .select("id, title, body, image_url, waste_type_id, created_at, updated_at")
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
      body: values.body ?? encodeSteps([]),
    })
    .select("id, title, body, image_url, waste_type_id, created_at, updated_at")
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
    .select("id, title, body, image_url, waste_type_id, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstruction(data);
}

export async function resetInstruction(id: string): Promise<void> {
  const { error } = await supabase
    .from("instructions")
    .update({ body: encodeSteps([]), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
