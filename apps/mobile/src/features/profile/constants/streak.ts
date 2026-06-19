// Tokens visuales compartidos (color por nivel) viven en src/ui para respetar la frontera
// entre features; se re-exportan aquí por compatibilidad con los imports existentes.
import type { StreakLevel } from '@/src/ui/streakColors';
export { levelForStreakDays, STREAK_LEVEL_COLORS, type StreakLevel } from '@/src/ui/streakColors';

export const STREAK_LEVEL_THRESHOLDS: Record<StreakLevel, number> = {
  1: 0,
  2: 3,
  3: 9,
  4: 21,
  5: 45,
  6: 93,
  7: 189,
};

export const STREAK_LEVEL_LABELS: Record<StreakLevel, string> = {
  1: 'Dark red',
  2: 'Red',
  3: 'Orange',
  4: 'Yellow',
  5: 'White',
  6: 'Blue',
  7: 'Violet',
};

export const HEAT_FIRE_COLORS: { maxPercent: number; color: string }[] = [
  { maxPercent: 14, color: '#6B0000' },
  { maxPercent: 28, color: '#DC2626' },
  { maxPercent: 42, color: '#F97316' },
  { maxPercent: 57, color: '#FACC15' },
  { maxPercent: 71, color: '#CBD5E1' },
  { maxPercent: 85, color: '#38BDF8' },
  { maxPercent: 100, color: '#A78BFA' },
];

export const HEAT_MAX = 100;
export const HEAT_DECAY = 30;

export function heatGainForLevel(level: StreakLevel): number {
  return (level * (level + 1)) / 2;
}

export function heatColorForPercent(percent: number): string {
  const tier = HEAT_FIRE_COLORS.find((t) => percent <= t.maxPercent);
  return tier?.color ?? HEAT_FIRE_COLORS[HEAT_FIRE_COLORS.length - 1].color;
}

export function nextMilestoneForLevel(level: StreakLevel): number | null {
  if (level === 7) return null;
  return STREAK_LEVEL_THRESHOLDS[(level + 1) as StreakLevel];
}
