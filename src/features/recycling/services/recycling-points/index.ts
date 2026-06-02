import { RECYCLE_USE_MOCKS } from '@/src/features/recycling/services/config';
import { mockRecyclingPoints } from './mocks/mock-recycling-points';
import { remoteRecyclingPoints } from './providers/remote-recycling-points';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

export type { NearbyRecyclingPoint } from './types';

export async function getRecyclingPoints(): Promise<RecyclingContainer[]> {
  return RECYCLE_USE_MOCKS ? mockRecyclingPoints.getAll() : remoteRecyclingPoints.getAll();
}
