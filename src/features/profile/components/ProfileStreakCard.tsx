import { Alert, StyleSheet, View } from 'react-native';

import {
  AppCard,
  AppCardFooter,
  AppHeatMeter,
  AppIcon,
  AppIconButton,
  AppText,
  theme,
} from '@/src/ui';
import {
  STREAK_LEVEL_COLORS,
  STREAK_LEVEL_LABELS,
  heatColorForPercent,
  levelForStreakDays,
  nextMilestoneForLevel,
  type StreakLevel,
} from '@/src/features/profile/constants/streak';

type ProfileStreakCardProps = {
  currentStreakDays: number;
  heat: number;
  level: number;
};

export function ProfileStreakCard({ currentStreakDays, heat, level }: ProfileStreakCardProps) {
  const safeLevel = Math.max(1, Math.min(7, level)) as StreakLevel;
  const levelColor = STREAK_LEVEL_COLORS[safeLevel];
  const levelLabel = STREAK_LEVEL_LABELS[safeLevel];
  const heatColor = heatColorForPercent(heat);
  const nextMilestone = nextMilestoneForLevel(safeLevel);
  const barMax = nextMilestone ?? currentStreakDays;
  const barValue = Math.min(currentStreakDays, barMax);
  const heatDanger = heat <= 28;
  const flameSize = Math.round(theme.iconSizes.sm + (heat / 100) * (theme.iconSizes.xl - theme.iconSizes.sm));

  function handleInfoPress() {
    Alert.alert(
      'Nivel de calor',
      'Tu primer reciclaje del día aumenta el calor según tu nivel. El calor baja -30 por día sin reciclar. Si llega a 0, tu racha muere. Tu nivel de racha es permanente.',
    );
  }

  return (
    <AppCard>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <AppIcon name="flame" size={flameSize} color={levelColor} />
          <View>
            <AppText variant="h3">{currentStreakDays} días de racha</AppText>
            <AppText variant="caption" style={[styles.levelLabel, { color: levelColor }]}>
              {levelLabel}
            </AppText>
          </View>
        </View>
        <AppIconButton
          accessibilityLabel="Informacion sobre la racha"
          variant="ghost"
          onPress={handleInfoPress}
          icon={
            <AppIcon name="info" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
          }
        />
      </View>

      <AppHeatMeter
        value={barValue}
        maxValue={barMax}
        color={levelColor}
        label={nextMilestone !== null ? `${currentStreakDays} / ${nextMilestone} días` : `${currentStreakDays} días`}
      />

      <View style={styles.heatRow}>
        <AppIcon name="flame" size={theme.iconSizes.sm} color={heatColor} />
        <AppText
          variant="caption"
          style={[styles.heatLabel, { color: heatColor }]}
        >
          Calor: {heat}%{heatDanger ? ' — ¡en riesgo!' : ''}
        </AppText>
      </View>

      <AppCardFooter>
        {nextMilestone !== null ? (
          <AppText muted>
            Próximo nivel ({levelForStreakDays(nextMilestone)} — {STREAK_LEVEL_LABELS[levelForStreakDays(nextMilestone) as StreakLevel]}): {nextMilestone} días consecutivos
          </AppText>
        ) : (
          <AppText muted>Nivel máximo alcanzado 🔥</AppText>
        )}
      </AppCardFooter>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.s3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    flex: 1,
  },
  levelLabel: {
    fontWeight: theme.fontWeights.semibold,
  },
  heatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
    marginTop: theme.spacing.s1,
  },
  heatLabel: {
    fontWeight: theme.fontWeights.semibold,
  },
});
