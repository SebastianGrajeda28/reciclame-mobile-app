import { binTypes } from '@/src/features/recycling/services/bin-types.mock';
import { wasteTypeBinTypeMappings } from '@/src/features/recycling/services/waste-type-bin-types.mock';
import type { BinTypeResolutionService } from '@/src/features/recycling/services/binTypeResolution/types';

async function getBinTypeByWasteTypeId(
  wasteTypeId: string,
  universityId: string,
) {
  const mapping = wasteTypeBinTypeMappings.find(
    (item) =>
      item.wasteTypeId === wasteTypeId &&
      item.universityId === universityId &&
      item.isActive !== false,
  );

  if (!mapping) return null;

  return binTypes.find((item) => item.id === mapping.binTypeId) ?? null;
}

export const mockBinTypeResolution: BinTypeResolutionService = {
  getBinTypeByWasteTypeId,
};
