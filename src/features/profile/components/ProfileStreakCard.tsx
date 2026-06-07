import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  STREAK_LEVEL_COLORS,

  STREAK_LEVEL_THRESHOLDS,
  nextMilestoneForLevel,
  type StreakLevel,
} from '@/src/features/profile/constants/streak';
import { AppCard, AppHeatMeter, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

type ProfileStreakCardProps = {
  currentStreakDays: number;
  heat: number;
  level: number;
  recycledToday: boolean;
};

const LEVELS: StreakLevel[] = [1, 2, 3, 4, 5, 6, 7];

export function ProfileStreakCard({
  currentStreakDays,
  heat,
  level,
  recycledToday,
}: ProfileStreakCardProps) {
  const [expanded, setExpanded] = useState(false);

  const safeLevel = Math.max(1, Math.min(7, level)) as StreakLevel;
  const levelColor = STREAK_LEVEL_COLORS[safeLevel];
  const nextMilestone = nextMilestoneForLevel(safeLevel);
  const levelThreshold = STREAK_LEVEL_THRESHOLDS[safeLevel];
  const daysInLevel = Math.max(0, currentStreakDays - levelThreshold);
  const daysToNextLevel = nextMilestone !== null ? nextMilestone - levelThreshold : null;
  const barMax = daysToNextLevel ?? daysInLevel;
  const barValue = Math.min(daysInLevel, barMax);
  const heatDanger = heat > 0 && heat <= 28 && !recycledToday;
  const flameSize = Math.round(
    theme.iconSizes.sm + (heat / 100) * (theme.iconSizes.xl - theme.iconSizes.sm),
  );

  return (
    <AppCard>
      <View style={styles.topRow}>
        <View style={styles.streakRow}>
          <AppIcon name="flame" size={flameSize} color={levelColor} />
          <AppText variant="h3">{currentStreakDays} días de racha</AppText>
        </View>
        <View style={styles.heatRow}>
          <AppText variant="caption" style={[styles.heatLabel, { color: levelColor }]}>
            Calor: {heat}%
          </AppText>
          {heatDanger && (
            <AppIcon name="alertCircle" size={theme.iconSizes.sm} color={theme.colors.danger} />
          )}
        </View>
        <View style={styles.infoButtonWrap}>
          <AppIconButton
            accessibilityLabel="Informacion sobre la racha"
            variant="ghost"
            onPress={() => setExpanded((v) => !v)}
            icon={
              <AppIcon
                name="info"
                size={theme.iconSizes.sm}
                color={expanded ? theme.colors.primary : theme.colors.textSecondary}
              />
            }
          />
        </View>
      </View>

      <View style={styles.separator} />
      <AppHeatMeter
        value={barValue}
        maxValue={barMax}
        color={levelColor}
        label={
          daysToNextLevel === null
            ? `${daysInLevel} días — nivel máximo`
            : `${daysInLevel}/${daysToNextLevel} días para el siguiente nivel`
        }
      />

      {expanded && (
        <View style={styles.explanation}>

          <AppText variant="caption" muted style={styles.explanationText}>
            Calor: Sube cada vez que reciclás (máx. 1 vez por día). Baja cada día que no reciclás.
            Si llega a 0, tu racha muere.
          </AppText>
          <AppText variant="caption" muted style={styles.explanationText}>
            Nivel: Se gana acumulando días de racha, se mantiene una vez alcanzado. Cuanto más alto
            tu nivel, más calor ganas al reciclar.
          </AppText>

          <View style={styles.levelsGrid}>
            <View style={styles.levelIconsRow}>
              {LEVELS.map((lvl, i) => (
                <>
                  {i > 0 && (
                    <View key={`line-${lvl}`} style={styles.levelConnectorWrap}>
                      <View style={styles.levelConnector} />
                      <AppText variant="caption" style={styles.levelConnectorLabel}>
                        {STREAK_LEVEL_THRESHOLDS[lvl] -
                          STREAK_LEVEL_THRESHOLDS[(lvl - 1) as StreakLevel]}
                        d
                      </AppText>
                    </View>
                  )}
                  <View key={lvl} style={styles.levelItemWrap}>
                    <AppIcon
                      name="flame"
                      size={lvl === safeLevel ? theme.iconSizes.xl : theme.iconSizes.md}
                      color={STREAK_LEVEL_COLORS[lvl]}
                      style={lvl !== safeLevel && styles.levelIconMuted}
                    />
                  </View>
                </>
              ))}
            </View>
          </View>
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s2,
    width: '100%',
  },
  infoButtonWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  heatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  heatLabel: {
    fontWeight: theme.fontWeights.semibold,
  },
  explanation: {
    gap: theme.spacing.s3,
    paddingTop: theme.spacing.s3,
    borderTopWidth: 3,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.s2,
  },
  explanationText: {
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.s3,
    marginBottom: theme.spacing.s3,
  },
  levelsGrid: {},
  levelIconsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  levelItemWrap: {
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  levelConnectorWrap: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: theme.iconSizes.sm / 2,
  },
  levelConnector: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.border,
  },
  levelConnectorLabel: {
    color: theme.colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  levelIconMuted: {
    opacity: 0.35,
  },
  levelItemLabel: {
    color: theme.colors.textSecondary,
    fontSize: 9,
  },
});
