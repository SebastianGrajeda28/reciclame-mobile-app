import { supabase } from "@/lib/supabase";
import type { BinType } from "@reciclame/shared-domain";

export type { BinType };

type BinTypeRow = {
  id: string;
  university_id: string | null;
  name: string;
  color: string | null;
  description: string | null;
  image_url: string | null;
  deposit_instruction: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

function mapBinType(row: BinTypeRow): BinType {
  return {
    id: row.id,
    universityId: row.university_id,
    name: row.name,
    color: row.color,
    description: row.description,
    imageUrl: row.image_url,
    depositInstruction: row.deposit_instruction,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBinTypeByWasteTypeId(wasteTypeId: string, universityId?: string): Promise<BinType | null> {
  let query = supabase
    .from("map_waste_type_bin_types")
    .select("bin_types(id,university_id,name,color,description,image_url,deposit_instruction,is_active,created_at,updated_at)")
    .eq("waste_type_id", wasteTypeId)
    .eq("is_active", true);

  if (universityId) query = query.eq("university_id", universityId);

  const { data, error } = await query.limit(1);

  if (error) throw new Error(error.message);
  if (!data?.length) return null;

  const binTypes = data[0].bin_types;
  const row = Array.isArray(binTypes) ? binTypes[0] : binTypes;
  return row ? mapBinType(row as BinTypeRow) : null;
}

export type BinTypePayload = {
  imageUrl?: string | null;
  depositInstruction?: string | null;
};

export async function updateBinType(id: string, payload: BinTypePayload): Promise<void> {
  const { error } = await supabase
    .from("bin_types")
    .update({
      ...(payload.imageUrl !== undefined && { image_url: payload.imageUrl }),
      ...(payload.depositInstruction !== undefined && { deposit_instruction: payload.depositInstruction }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
