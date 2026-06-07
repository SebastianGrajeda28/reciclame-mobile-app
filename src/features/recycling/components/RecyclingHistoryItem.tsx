import { StyleSheet, View } from 'react-native';
import { AppCard, AppIcon, AppText, theme } from '@/src/ui';
import { formatShortDate } from '@/src/utils/dates';
import type { RecyclingLogListItem } from '@/src/types/recycling';

type Props = {
  item: RecyclingLogListItem;
};

export function RecyclingHistoryItem({ item }: Props) {
  const isAuto = item.detectionType === 'auto';

  return (
    <AppCard padding="sm" elevation="xs">
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <AppIcon name="recycle" size={theme.iconSizes.md} color={theme.colors.primary} />
        </View>
        <View style={styles.body}>
          <AppText style={styles.wasteType}>{item.wasteTypeName}</AppText>
          <AppText style={styles.point} numberOfLines={1}>{item.recyclingPointName}</AppText>
          <View style={styles.meta}>
            <AppText style={styles.date}>{formatShortDate(new Date(item.createdAt))}</AppText>
            <View style={[styles.badge, isAuto ? styles.badgeAuto : styles.badgeManual]}>
              <AppText style={styles.badgeText}>{isAuto ? 'Auto' : 'Manual'}</AppText>
            </View>
          </View>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  wasteType: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  point: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  date: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  badgeAuto: {
    backgroundColor: theme.colors.infoBg,
  },
  badgeManual: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  badgeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
});
