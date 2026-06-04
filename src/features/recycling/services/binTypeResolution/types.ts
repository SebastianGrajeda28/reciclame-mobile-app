import type { BinType } from '@/src/features/recycling/types/recycling.types';

export type BinTypeResolutionService = {
  getBinTypeByWasteTypeId: (wasteTypeId: string, universityId: string) => Promise<BinType | null>;
};
