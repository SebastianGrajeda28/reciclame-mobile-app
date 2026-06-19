import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { useStreakActivity } from '@/src/features/profile/hooks/useStreakActivity';
import { AppButton, AppCard, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';
import type { HeatMapEntry, WeekDay } from '@/src/features/profile/api/streak';

const WEEK_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
const HEAT_MAP_DAYS = 28;
const HEAT_MAP_COLUMNS = 7;
const HEAT_TOOLTIP_WIDTH = 132;
const HEAT_TOOLTIP_HEIGHT = 54;
const HEAT_TOOLTIP_OFFSET = 6;
const LIMA_TIME_ZONE = 'America/Lima';
const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
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

function formatAverage(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getLimaDateString() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: LIMA_TIME_ZONE });
}

function formatHeatMapDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;

  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const dayLabel = WEEK_LABELS[(parsedDate.getUTCDay() + 6) % 7];

  return `${dayLabel}. ${day} ${MONTH_LABELS[month - 1]}`;
}

function normalizeHeatMap(entries: HeatMapEntry[]) {
  const normalized = entries.slice(-HEAT_MAP_DAYS);

  while (normalized.length < HEAT_MAP_DAYS) {
    normalized.unshift({ date: `placeholder-${normalized.length}`, count: 0 });
  }

  return Array.from({ length: HEAT_MAP_DAYS / HEAT_MAP_COLUMNS }, (_, rowIndex) =>
    normalized.slice(rowIndex * HEAT_MAP_COLUMNS, (rowIndex + 1) * HEAT_MAP_COLUMNS),
  );
}

function WeekStatusRow({ weekDays }: { weekDays: WeekDay[] }) {
  const today = useMemo(getLimaDateString, []);

  return (
    <View style={styles.weekRow}>
      {WEEK_LABELS.map((label, index) => {
        const done = Boolean(weekDays[index]?.recycled);
        const isToday = weekDays[index]?.date === today;
        return (
          <View key={label} style={styles.weekItem}>
            <View
              style={[
                styles.weekCircle,
                done ? styles.weekDone : styles.weekPending,
                isToday && styles.weekTodayCircle,
              ]}
            >
              {done ? (
                <AppIcon name="check" size={theme.iconSizes.xs} color={theme.colors.textInverse} />
              ) : (
                <AppText style={styles.pendingMark}>?</AppText>
              )}
            </View>
            <AppText variant="caption" style={styles.weekLabel}>
              {label}
            </AppText>
            {isToday ? (
              <AppText variant="caption" style={styles.weekTodayLabel}>
                Hoy
              </AppText>
            ) : (
              <View style={styles.weekTodayPlaceholder} />
            )}
          </View>
        );
      })}
    </View>
  );
}

function HeatMapCard({ heatMap }: { heatMap: HeatMapEntry[] }) {
  const weeks = normalizeHeatMap(heatMap);
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: HeatMapEntry;
    rowIndex: number;
    columnIndex: number;
  } | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const hasActivity = heatMap.some((entry) => entry.count > 0);
  const cellGap = theme.spacing.s3;
  const cellSize =
    gridWidth > 0 ? (gridWidth - cellGap * (HEAT_MAP_COLUMNS - 1)) / HEAT_MAP_COLUMNS : 0;
  const tooltipStyle =
    selectedEntry && cellSize > 0
      ? {
          left: Math.max(
            0,
            Math.min(
              gridWidth - HEAT_TOOLTIP_WIDTH,
              selectedEntry.columnIndex * (cellSize + cellGap) +
                cellSize / 2 -
                HEAT_TOOLTIP_WIDTH / 2,
            ),
          ),
          top:
            selectedEntry.rowIndex === 0
              ? cellSize + HEAT_TOOLTIP_OFFSET
              : selectedEntry.rowIndex * (cellSize + cellGap) -
                HEAT_TOOLTIP_HEIGHT -
                HEAT_TOOLTIP_OFFSET,
        }
      : null;

  return (
    <AppCard style={styles.heatCard} padding="lg" elevation="xs" bordered={false}>
      <AppText variant="caption" style={styles.heatTitle}>
        Mapa de calor - últimas 4 semanas
      </AppText>

      <View
        style={styles.heatGrid}
        onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
      >
        {weeks.map((week, rowIndex) => (
          <View key={`week-${rowIndex}`} style={styles.heatRow}>
            {week.map((entry, columnIndex) => {
              const isPlaceholder = entry.date.startsWith('placeholder-');
              const isSelected = selectedEntry?.entry.date === entry.date;

              return (
                <Pressable
                  key={`${entry.date}-${columnIndex}`}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPlaceholder
                      ? 'Día sin datos'
                      : `${formatHeatMapDate(entry.date)}. Reciclajes: ${entry.count}`
                  }
                  disabled={isPlaceholder}
                  delayLongPress={250}
                  onPress={() => {
                    if (isSelected) setSelectedEntry(null);
                  }}
                  onLongPress={() => setSelectedEntry({ entry, rowIndex, columnIndex })}
                  style={[
                    styles.heatCell,
                    { backgroundColor: heatColor(Math.min(entry.count, 4)) },
                    isSelected && styles.heatCellSelected,
                  ]}
                />
              );
            })}
          </View>
        ))}

        {selectedEntry && tooltipStyle ? (
          <View style={[styles.heatTooltip, tooltipStyle]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar detalle del día"
              hitSlop={8}
              onPress={() => setSelectedEntry(null)}
              style={styles.heatTooltipClose}
            >
              <AppIcon name="close" size={theme.iconSizes.xs} color={theme.colors.textSecondary} />
            </Pressable>
            <AppText variant="caption" style={styles.heatTooltipDate}>
              {formatHeatMapDate(selectedEntry.entry.date)}
            </AppText>
            <AppText variant="caption" style={styles.heatTooltipText}>
              Reciclajes: {selectedEntry.entry.count}
            </AppText>
          </View>
        ) : null}
      </View>

      {!hasActivity ? (
        <AppText variant="caption" style={styles.heatEmptyText}>
          Aún no tienes reciclajes en las últimas 4 semanas.
        </AppText>
      ) : null}

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

function StatsCard({ totalToday, dailyAverage }: { totalToday: number; dailyAverage: number }) {
  return (
    <AppCard style={styles.statsCard} padding="lg" elevation="xs" bordered={false}>
      <View style={styles.statColumn}>
        <AppText variant="overline" style={styles.statLabel}>
          Reciclajes hoy
        </AppText>
        <AppText variant="h1" style={styles.statGreen}>
          {totalToday}
        </AppText>
      </View>
      <View style={styles.statColumn}>
        <AppText variant="overline" style={styles.statLabel}>
          Promedio diario
        </AppText>
        <AppText variant="h1" style={styles.statBlue}>
          {formatAverage(dailyAverage)}
        </AppText>
      </View>
    </AppCard>
  );
}

export function StreakActivityScreen() {
  const { data, loading, error, refetch } = useStreakActivity();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/yo');
  }

  let body;
  if (loading) {
    body = (
      <View style={styles.stateCard}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText variant="caption" muted>
          Cargando tu actividad...
        </AppText>
      </View>
    );
  } else if (error) {
    body = (
      <AppCard style={styles.stateCard} variant="danger">
        <AppIcon name="alertCircle" size={theme.iconSizes.lg} color={theme.colors.danger} />
        <AppText variant="h3" style={styles.stateTitle}>
          No se pudo cargar tu racha
        </AppText>
        <AppText variant="caption" muted style={styles.stateText}>
          {error}
        </AppText>
        <AppButton label="Reintentar" variant="outline" onPress={refetch} />
      </AppCard>
    );
  } else {
    const activity = data ?? {
      streakDays: 0,
      bestStreakDays: 0,
      recycledToday: false,
      totalToday: 0,
      dailyAverage: 0,
      weekDays: [],
      heatMap: [],
    };

    body = (
      <>
        <View style={styles.hero}>
          <View style={styles.streakCircle}>
            <AppText style={styles.streakNumber}>{activity.streakDays}</AppText>
            <AppText variant="caption" style={styles.streakCaption}>
              días seguidos
            </AppText>
          </View>
          <View style={styles.bestRow}>
            <AppIcon name="trophy" size={theme.iconSizes.xs} color={theme.colors.warning} />
            <AppText variant="caption" style={styles.bestText}>
              Tu mejor racha: {activity.bestStreakDays} días
            </AppText>
          </View>
        </View>

        <WeekStatusRow weekDays={activity.weekDays} />
        <HeatMapCard heatMap={activity.heatMap} />
        <StatsCard totalToday={activity.totalToday} dailyAverage={activity.dailyAverage} />
      </>
    );
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
      {body}
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
  stateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s3,
    minHeight: 220,
  },
  stateTitle: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
  stateText: {
    textAlign: 'center',
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
  weekTodayCircle: {
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
  },
  weekTodayLabel: {
    minHeight: 12,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.primaryPressed,
    fontWeight: theme.fontWeights.bold,
  },
  weekTodayPlaceholder: {
    minHeight: 12,
  },
  heatCard: {
    gap: theme.spacing.s4,
    borderRadius: theme.radius.lg,
    position: 'relative',
    overflow: 'visible',
  },
  heatTitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  heatGrid: {
    gap: theme.spacing.s3,
    overflow: 'visible',
    position: 'relative',
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
  heatCellSelected: {
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
  },
  heatTooltip: {
    position: 'absolute',
    width: HEAT_TOOLTIP_WIDTH,
    minHeight: HEAT_TOOLTIP_HEIGHT,
    paddingVertical: theme.spacing.s2,
    paddingHorizontal: theme.spacing.s3,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: theme.spacing.s1,
    zIndex: 10,
    elevation: 3,
  },
  heatTooltipClose: {
    position: 'absolute',
    top: theme.spacing.s1,
    right: theme.spacing.s1,
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatTooltipDate: {
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeights.bold,
    paddingHorizontal: theme.spacing.s3,
  },
  heatTooltipText: {
    color: theme.colors.textSecondary,
  },
  heatEmptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
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
