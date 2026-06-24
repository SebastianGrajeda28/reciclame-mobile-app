import { supabase } from '@/src/services/supabase/client';
import type { BinType, WasteType } from '@/src/features/recycling/types/recycling.types';
import {
  isWasteTypesCacheStale,
  isBinTypesCacheStale,
  isMappingsCacheStale,
  saveWasteTypesCache,
  saveBinTypesCache,
  saveMappingsCache,
  getLocalWasteTypes,
  getLocalBinTypes,
} from '@/src/services/local/referenceData';

export {
  isWasteTypesCacheStale,
  isBinTypesCacheStale,
  isMappingsCacheStale,
  getLocalWasteTypes,
  getLocalBinTypes,
};

// ---------------------------------------------------------------------------
// Waste types
// ---------------------------------------------------------------------------

export async function refreshWasteTypesCache(): Promise<void> {
  console.log('[REF] Refrescando waste_types desde Supabase...');
  const { data, error } = await supabase
    .from('waste_types')
    .select('id, name, description, estimated_weight_g')
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  const types: WasteType[] = (data ?? []).map((row) => ({
    id: row.id,
    label: row.name,
    description: row.description ?? undefined,
    categoryId: 'non_recoverable',   // será sobreescrito por el config estático en el getter
    categoryLabel: 'Desconocido',
  }));

  saveWasteTypesCache(types);
  console.log(`[REF] waste_types actualizados: ${types.length}`);
}

// ---------------------------------------------------------------------------
// Bin types
// ---------------------------------------------------------------------------

export async function refreshBinTypesCache(): Promise<void> {
  console.log('[REF] Refrescando bin_types desde Supabase...');
  const { data, error } = await supabase
    .from('bin_types')
    .select('id, name, description, image_url, deposit_instruction')
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  const types: BinType[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    imageUrl: row.image_url,
    depositInstruction: row.deposit_instruction,
  }));

  saveBinTypesCache(types);
  console.log(`[REF] bin_types actualizados: ${types.length}`);
}

// ---------------------------------------------------------------------------
// Waste type → bin type mappings
// ---------------------------------------------------------------------------

export async function refreshMappingsCache(universityId: string): Promise<void> {
  console.log(`[REF] Refrescando mappings desde Supabase (university=${universityId})...`);
  const { data, error } = await supabase
    .from('map_waste_type_bin_types')
    .select('waste_type_id, bin_type_id, university_id')
    .eq('university_id', universityId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  saveMappingsCache(
    (data ?? []).map((row) => ({
      wasteTypeId: row.waste_type_id,
      universityId: row.university_id,
      binTypeId: row.bin_type_id,
    })),
  );
  console.log(`[REF] mappings actualizados: ${(data ?? []).length}`);
}
