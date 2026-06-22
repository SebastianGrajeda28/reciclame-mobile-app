import { supabase } from '@/src/services/supabase/client';
import type { BinType } from '@/src/features/recycling/types/recycling.types';
import type { BinTypeResolutionService } from '@/src/features/recycling/services/binTypeResolution/types';

type BinTypeRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  deposit_instruction: string | null;
  is_active: boolean;
};

type WasteTypeBinTypeRow = {
  bin_types: BinTypeRow | BinTypeRow[] | null;
};

function mapBinType(row: BinTypeRow): BinType {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url,
    depositInstruction: row.deposit_instruction,
  };
}

function pickBinTypeRow(row: WasteTypeBinTypeRow | null): BinTypeRow | null {
  if (!row?.bin_types) return null;
  return Array.isArray(row.bin_types) ? row.bin_types[0] ?? null : row.bin_types;
}

async function getBinTypeByWasteTypeId(
  wasteTypeId: string,
  universityId: string,
): Promise<BinType | null> {
  const { data, error } = await supabase
    .from('map_waste_type_bin_types')
    .select('bin_types(id,name,description,image_url,deposit_instruction,is_active)')
    .eq('waste_type_id', wasteTypeId)
    .eq('university_id', universityId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const binTypeRow = pickBinTypeRow(data as WasteTypeBinTypeRow | null);
  if (!binTypeRow || !binTypeRow.is_active) return null;

  return mapBinType(binTypeRow);
}

export const supabaseBinTypeResolution: BinTypeResolutionService = {
  getBinTypeByWasteTypeId,
};
