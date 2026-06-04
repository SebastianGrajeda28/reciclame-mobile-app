import { BIN_TYPE_RESOLUTION_USE_MOCKS } from '@/src/features/recycling/services/config';
import { mockBinTypeResolution } from '@/src/features/recycling/services/binTypeResolution/mocks/mock-bin-type-resolution';
import { supabaseBinTypeResolution } from '@/src/features/recycling/services/binTypeResolution/providers/supabase-bin-type-resolution';
import type { BinTypeResolutionService } from '@/src/features/recycling/services/binTypeResolution/types';

function getBinTypeResolutionService(): BinTypeResolutionService {
  return BIN_TYPE_RESOLUTION_USE_MOCKS ? mockBinTypeResolution : supabaseBinTypeResolution;
}

export async function getBinTypeByWasteTypeId(wasteTypeId: string, universityId: string) {
  return getBinTypeResolutionService().getBinTypeByWasteTypeId(wasteTypeId, universityId);
}
