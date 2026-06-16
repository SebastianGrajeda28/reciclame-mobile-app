import { StyleSheet, View } from 'react-native';
import { AppCard, AppIcon, AppText, theme } from '@/src/ui';
import { categoryStyleForWasteTypeId } from '@/src/features/recycling/services/historyCategories';
import { formatHistoryTime } from '@/src/features/recycling/utils/historyGrouping';
import type { RecyclingLogListItem } from '@/src/types/recycling';

type Props = {
  item: RecyclingLogListItem;
};

export function RecyclingHistoryItem({ item }: Props) {
  const iconStyle = categoryStyleForWasteTypeId(item.wasteTypeId);
  const heat = item.heatGained ?? 0;

  return (
    <AppCard padding="sm" elevation="xs">
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: iconStyle.bg }]}>
          <AppIcon name="recycle" size={theme.iconSizes.md} color={iconStyle.fg} />
        </View>
        <View style={styles.body}>
          <AppText style={styles.wasteType}>{item.wasteTypeName}</AppText>
          <AppText style={styles.point} numberOfLines={1}>
            {item.recyclingPointName}
          </AppText>
          <AppText style={styles.time}>{formatHistoryTime(item.createdAt)}</AppText>
        </View>
        {heat > 0 ? (
          <View style={styles.heatPill}>
            <AppIcon name="flame" size={theme.iconSizes.sm} color={theme.colors.warning} />
            <AppText style={styles.heatText}>+{heat}</AppText>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
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
  time: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  heatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  heatText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.warning,
  },
});
