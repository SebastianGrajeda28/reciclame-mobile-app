import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

type WasteCategoryConfig = {
  color: string;
  iconColor: string;
};

export const wasteCategoryConfig: Record<WasteCategoryId, WasteCategoryConfig> = {
  plastic_pet: { color: '#26B0CF', iconColor: '#FFFFFF' },
  paper_cardboard: { color: '#4B6F9B', iconColor: '#FFFFFF' },
  glass: { color: '#12B76A', iconColor: '#FFFFFF' },
  non_recoverable: { color: '#353C42', iconColor: '#FFFFFF' },
  battery: { color: '#F59E0B', iconColor: '#FFFFFF' },
  electronic_waste: { color: '#0B2F4E', iconColor: '#FFFFFF' },
};
