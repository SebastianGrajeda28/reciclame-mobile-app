import { StyleSheet, View } from 'react-native';
import { AppIcon, AppText, theme } from '@/src/ui';
import {
  categoryIconForWasteTypeId,
  categoryStyleForWasteTypeId,
} from '@/src/features/recycling/services/historyCategories';
import { formatHistoryTime } from '@/src/features/recycling/utils/historyGrouping';
import type { RecyclingLogListItem } from '@/src/types/recycling';

type Props = {
  item: RecyclingLogListItem;
};

export function RecyclingHistoryItem({ item }: Props) {
  const iconStyle = categoryStyleForWasteTypeId(item.wasteTypeId);
  const iconName = categoryIconForWasteTypeId(item.wasteTypeId);
  const heat = item.heatGained ?? 0;
  const a11yLabel = [
    item.wasteTypeName,
    item.recyclingPointName,
    formatHistoryTime(item.createdAt).replace(' · ', ', '),
    heat > 0 ? `+${heat} de calor` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.row} accessible accessibilityLabel={a11yLabel}>
      <View style={[styles.iconWrap, { backgroundColor: iconStyle.bg }]}>
        <AppIcon name={iconName} size={theme.iconSizes.md} color={iconStyle.fg} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText style={styles.wasteType} numberOfLines={1}>
            {item.wasteTypeName}
          </AppText>
          {heat > 0 ? (
            <View style={styles.heatPill}>
              <AppIcon name="flame" size={theme.iconSizes.sm} color={theme.colors.warning} />
              <AppText style={styles.heatText} numberOfLines={1}>
                +{heat}
              </AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.metaRow}>
          <AppText style={styles.point} numberOfLines={1}>
            {item.recyclingPointName}
          </AppText>
          <AppText style={styles.time}>{formatHistoryTime(item.createdAt)}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
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
    minWidth: 0,
    gap: theme.spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  wasteType: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  point: {
    flex: 1,
    minWidth: 0,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  time: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  heatPill: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  heatText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.warning,
  },
});
