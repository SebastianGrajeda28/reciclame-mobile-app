// Tokens visuales de la racha compartidos por features (profile, recycling).
// Viven en src/ui para respetar la frontera entre features (no cross-feature imports).

export type StreakLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STREAK_LEVEL_COLORS: Record<StreakLevel, string> = {
  1: '#6B0000',
  2: '#DC2626',
  3: '#F97316',
  4: '#FACC15',
  5: '#CBD5E1',
  6: '#38BDF8',
  7: '#A78BFA',
};

export function levelForStreakDays(streakDays: number): StreakLevel {
  if (streakDays >= 189) return 7;
  if (streakDays >= 93) return 6;
  if (streakDays >= 45) return 5;
  if (streakDays >= 21) return 4;
  if (streakDays >= 9) return 3;
  if (streakDays >= 3) return 2;
  return 1;
}
