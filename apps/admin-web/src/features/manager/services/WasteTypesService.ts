import { supabase } from "@/lib/supabase";
import type { WasteType } from "@reciclame/shared-domain";

export type { WasteType };

type WasteTypeRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

function mapWasteType(row: WasteTypeRow): WasteType {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getWasteTypes(): Promise<WasteType[]> {
  const { data, error } = await supabase
    .from("waste_types")
    .select("id, name, description, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapWasteType);
}
