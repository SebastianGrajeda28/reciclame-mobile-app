import { supabase } from "@/lib/supabase";
import type { InstructionStep } from "@reciclame/shared-domain";

export type { InstructionStep };

type InstructionStepRow = {
  id: string;
  instruction_id: string;
  text: string;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
};

function mapInstructionStep(row: InstructionStepRow): InstructionStep {
  return {
    id: row.id,
    instructionId: row.instruction_id,
    text: row.text,
    imageUrl: row.image_url,
    isActive: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getInstructionSteps(instructionId: string): Promise<InstructionStep[]> {
  const { data, error } = await supabase
    .from("instruction_steps")
    .select("id, instruction_id, text, image_url, created_at, updated_at")
    .eq("instruction_id", instructionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInstructionStep);
}

export async function createInstructionStep(values: { instructionId: string; text: string }) {
  const { data, error } = await supabase
    .from("instruction_steps")
    .insert({ instruction_id: values.instructionId, text: values.text })
    .select("id, instruction_id, text, image_url, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstructionStep(data);
}

export async function updateInstructionStep(id: string, patch: { text?: string; imageUrl?: string | null }) {
  const nextPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.text !== undefined) nextPatch.text = patch.text;
  if (patch.imageUrl !== undefined) nextPatch.image_url = patch.imageUrl;

  const { data, error } = await supabase
    .from("instruction_steps")
    .update(nextPatch)
    .eq("id", id)
    .select("id, instruction_id, text, image_url, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return mapInstructionStep(data);
}

export async function deleteInstructionStep(id: string): Promise<void> {
  const { error } = await supabase
    .from("instruction_steps")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
