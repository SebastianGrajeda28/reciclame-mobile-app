import { supabase } from "@/lib/supabase";
import type { FunFact, FunFactPayload } from "@reciclame/shared-domain";

export type { FunFact, FunFactPayload };

type FunFactRow = {
  id: string;
  text: string;
  waste_type_id: string | null;
  is_active: boolean;
};

function mapFunFact(row: FunFactRow): FunFact {
  return {
    id: row.id,
    text: row.text,
    wasteTypeId: row.waste_type_id ?? "",
    isActive: row.is_active,
  };
}

export async function getFunFacts(): Promise<FunFact[]> {
  const { data, error } = await supabase
    .from("fun_facts")
    .select("id, text, waste_type_id, is_active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFunFact);
}

export async function createFunFact(values: FunFactPayload) {
  const { data, error } = await supabase
    .from("fun_facts")
    .insert({ text: values.text, waste_type_id: values.wasteTypeId })
    .select("id, text, waste_type_id, is_active")
    .single();

  if (error) throw new Error(error.message);
  return mapFunFact(data);
}

export async function updateFunFact(id: string, values: FunFactPayload) {
  const { data, error } = await supabase
    .from("fun_facts")
    .update({ text: values.text, waste_type_id: values.wasteTypeId, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, text, waste_type_id, is_active")
    .single();

  if (error) throw new Error(error.message);
  return mapFunFact(data);
}

export async function deactivateFunFact(id: string) {
  const { data, error } = await supabase
    .from("fun_facts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, text, waste_type_id, is_active")
    .single();

  if (error) throw new Error(error.message);
  return mapFunFact(data);
}

export async function restoreFunFact(id: string) {
  const { data, error } = await supabase
    .from("fun_facts")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, text, waste_type_id, is_active")
    .single();

  if (error) throw new Error(error.message);
  return mapFunFact(data);
}
