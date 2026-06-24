import { StyleSheet, View } from 'react-native';

import { ProfileStat } from '@/src/features/profile/data/profileGamification';
import { AppCard, AppIcon, AppText, theme } from '@/src/ui';

type ProfileStatsGridProps = {
  stats: readonly ProfileStat[];
};

function resolveStatIcon(icon: ProfileStat['icon']) {
  switch (icon) {
    case 'scale':
      return <AppIcon name="weight" size={theme.iconSizes.lg} color={theme.colors.primary} />;
    case 'recycle':
      return <AppIcon name="recycle" size={theme.iconSizes.lg} color={theme.colors.primary} />;
    case 'package':
      return <AppIcon name="package" size={theme.iconSizes.lg} color={theme.colors.primary} />;
    case 'calendar':
      return <AppIcon name="calendar" size={theme.iconSizes.lg} color={theme.colors.primary} />;
    case 'award':
      return <AppIcon name="award" size={theme.iconSizes.lg} color={theme.colors.primary} />;
    default:
      return null;
  }
}

export function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      {stats.map((stat) => (
        <AppCard key={stat.id} style={styles.statCard}>
          <View style={styles.statIconWrap}>{resolveStatIcon(stat.icon)}</View>
          <AppText variant="h3" style={styles.statValue}>
            {stat.value}
          </AppText>
          <AppText muted style={styles.statLabel}>
            {stat.label}
          </AppText>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s3,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  statValue: {
    color: theme.colors.primary,
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
  },
});
