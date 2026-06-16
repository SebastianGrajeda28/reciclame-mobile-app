import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { AppCard, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

const WEEK_DAYS = [
  { label: 'Lun', status: 'done' },
  { label: 'Mar', status: 'done' },
  { label: 'Mié', status: 'done' },
  { label: 'Jue', status: 'done' },
  { label: 'Vie', status: 'done' },
  { label: 'Sab', status: 'done' },
  { label: 'Dom', status: 'pending' },
] as const;

const HEAT_WEEKS = [
  [3, 2, 4, 1, 3, 4, 0],
  [2, 4, 3, 2, 1, 3, 2],
  [4, 3, 2, 4, 3, 4, 1],
  [3, 4, 2, 3, 4, 3, 0],
] as const;

const HEAT_LEGEND = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
] as const;

function heatColor(value: number) {
  switch (value) {
    case 1:
      return '#A6F4C5';
    case 2:
      return '#6CE9A6';
    case 3:
      return '#34D399';
    case 4:
      return '#039855';
    default:
      return '#E3E7EB';
  }
}

function WeekStatusRow() {
  return (
    <View style={styles.weekRow}>
      {WEEK_DAYS.map((day) => {
        const done = day.status === 'done';
        return (
          <View key={day.label} style={styles.weekItem}>
            <View style={[styles.weekCircle, done ? styles.weekDone : styles.weekPending]}>
              {done ? (
                <AppIcon name="check" size={theme.iconSizes.xs} color={theme.colors.textInverse} />
              ) : (
                <AppText style={styles.pendingMark}>?</AppText>
              )}
            </View>
            <AppText variant="caption" style={styles.weekLabel}>
              {day.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function HeatMapCard() {
  return (
    <AppCard style={styles.heatCard} padding="lg" elevation="xs" bordered={false}>
      <AppText variant="caption" style={styles.heatTitle}>
        Mapa de calor - últimas 4 semanas
      </AppText>

      <View style={styles.heatGrid}>
        {HEAT_WEEKS.map((week, rowIndex) => (
          <View key={`week-${rowIndex}`} style={styles.heatRow}>
            {week.map((value, columnIndex) => (
              <View
                key={`${rowIndex}-${columnIndex}`}
                style={[styles.heatCell, { backgroundColor: heatColor(value) }]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        {HEAT_LEGEND.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: heatColor(item.value) }]} />
            <AppText variant="caption" style={styles.legendText}>
              {item.label}
            </AppText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function StatsCard() {
  return (
    <AppCard style={styles.statsCard} padding="lg" elevation="xs" bordered={false}>
      <View style={styles.statColumn}>
        <AppText variant="overline" style={styles.statLabel}>
          Reciclajes hoy
        </AppText>
        <AppText variant="h1" style={styles.statGreen}>
          2
        </AppText>
      </View>
      <View style={styles.statColumn}>
        <AppText variant="overline" style={styles.statLabel}>
          Promedio diario
        </AppText>
        <AppText variant="h1" style={styles.statBlue}>
          3.2
        </AppText>
      </View>
    </AppCard>
  );
}

export function StreakActivityScreen() {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/yo');
  }

  return (
    <ProfileScreenContainer contentStyle={styles.content}>
      <ProfileSubpageHeader
        title="Racha y actividad"
        leading={
          <AppIconButton
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            variant="outline"
            icon={
              <AppIcon
                name="arrowLeft"
                size={theme.iconSizes.md}
                color={theme.colors.textPrimary}
              />
            }
          />
        }
      />

      <View style={styles.hero}>
        <View style={styles.streakCircle}>
          <AppText style={styles.streakNumber}>14</AppText>
          <AppText variant="caption" style={styles.streakCaption}>
            días seguidos
          </AppText>
        </View>
        <View style={styles.bestRow}>
          <AppIcon name="trophy" size={theme.iconSizes.xs} color={theme.colors.warning} />
          <AppText variant="caption" style={styles.bestText}>
            Tu mejor racha: 21 días
          </AppText>
        </View>
      </View>

      <WeekStatusRow />
      <HeatMapCard />
      <StatsCard />
    </ProfileScreenContainer>
  );
}

export default StreakActivityScreen;

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.s5,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  streakCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 6,
    borderColor: theme.colors.primaryPressed,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  streakNumber: {
    color: theme.colors.primaryPressed,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: theme.fontWeights.extrabold,
  },
  streakCaption: {
    color: theme.colors.textSecondary,
    lineHeight: 14,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  bestText: {
    color: theme.colors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s2,
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  weekCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDone: {
    backgroundColor: theme.colors.primaryPressed,
  },
  weekPending: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primaryPressed,
  },
  pendingMark: {
    color: theme.colors.primaryPressed,
    fontWeight: theme.fontWeights.bold,
    lineHeight: 18,
  },
  weekLabel: {
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.textSecondary,
  },
  heatCard: {
    gap: theme.spacing.s4,
    borderRadius: theme.radius.lg,
  },
  heatTitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  heatGrid: {
    gap: theme.spacing.s3,
  },
  heatRow: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
  },
  heatCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.xs,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.s4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: theme.radius.xs,
  },
  legendText: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: theme.radius.lg,
  },
  statColumn: {
    flex: 1,
    gap: theme.spacing.s1,
  },
  statLabel: {
    color: theme.colors.textSecondary,
  },
  statGreen: {
    color: theme.colors.primaryPressed,
  },
  statBlue: {
    color: '#3B82F6',
  },
});
