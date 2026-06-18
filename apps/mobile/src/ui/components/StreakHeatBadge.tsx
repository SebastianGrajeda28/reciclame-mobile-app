import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon } from '@/src/ui/components/AppIcon';
import { AppText } from '@/src/ui/components/AppText';
import {
  levelForStreakDays,
  normalizeStreakLevel,
  STREAK_LEVEL_COLORS,
} from '@/src/ui/streakColors';
import { theme } from '@/src/ui/theme';

type StreakHeatBadgeSize = 'sm' | 'md';

type StreakHeatBadgeProps = {
  streakDays: number;
  level?: number | null;
  heat?: number | null;
  size?: StreakHeatBadgeSize;
  showHeat?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SIZE_CONFIG = {
  sm: {
    iconMin: theme.iconSizes.sm,
    iconMax: theme.iconSizes.lg,
    textVariant: 'caption',
  },
  md: {
    iconMin: theme.iconSizes.md,
    iconMax: theme.iconSizes.xl,
    textVariant: 'h4',
  },
} as const;

function clampHeat(heat?: number | null) {
  return Math.max(0, Math.min(100, heat ?? 100));
}

export function StreakHeatBadge({
  streakDays,
  level,
  heat,
  size = 'md',
  showHeat = false,
  style,
}: StreakHeatBadgeProps) {
  const safeLevel = level == null ? levelForStreakDays(streakDays) : normalizeStreakLevel(level);
  const color = STREAK_LEVEL_COLORS[safeLevel];
  const config = SIZE_CONFIG[size];
  const hasHeat = heat != null;
  const safeHeat = clampHeat(heat);
  const flameSize = hasHeat
    ? Math.round(config.iconMin + (safeHeat / 100) * (config.iconMax - config.iconMin))
    : config.iconMax;

  return (
    <View
      accessibilityLabel={`Racha: ${streakDays} días, calor: ${safeHeat}%`}
      style={[styles.root, style]}
    >
      <AppText variant={config.textVariant} style={[styles.text, { color }]}>
        {streakDays}
      </AppText>
      {showHeat ? (
        <AppText variant="caption" style={[styles.heatText, { color }]}>
          · {safeHeat}%
        </AppText>
      ) : null}
      <AppIcon name="flame" size={flameSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  text: {
    fontWeight: theme.fontWeights.extrabold,
  },
  heatText: {
    fontWeight: theme.fontWeights.semibold,
  },
});
