import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

export type NearbyRecyclingPoint = RecyclingContainer & { distanceKm: number };

export type RecyclingPointsSource = {
  getAll: () => Promise<RecyclingContainer[]>;
};
