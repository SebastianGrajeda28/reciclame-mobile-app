import { containers } from '@/src/features/recycling/services/containers.mock';
import type { RecyclingPointsSource } from '../types';

export const mockRecyclingPoints: RecyclingPointsSource = {
  async getAll() {
    return containers;
  },
};
