import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

type WasteCategoryConfig = {
  color: string;
  iconColor: string;
};

export const wasteCategoryConfig: Record<WasteCategoryId, WasteCategoryConfig> = {
  paper: { color: '#4B6F9B', iconColor: '#FFFFFF' },
  cardboard: { color: '#92400E', iconColor: '#FFFFFF' },
  plastic_bottle: { color: '#26B0CF', iconColor: '#FFFFFF' },
  plastic: { color: '#0E7490', iconColor: '#FFFFFF' },
  metal: { color: '#6B7280', iconColor: '#FFFFFF' },
  glass: { color: '#12B76A', iconColor: '#FFFFFF' },
  non_recoverable: { color: '#353C42', iconColor: '#FFFFFF' },
  organic: { color: '#65A30D', iconColor: '#FFFFFF' },
  battery: { color: '#F59E0B', iconColor: '#FFFFFF' },
  electronic_waste: { color: '#0B2F4E', iconColor: '#FFFFFF' },
};
