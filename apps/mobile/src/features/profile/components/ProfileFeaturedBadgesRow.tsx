import { StyleSheet, View } from 'react-native';

import { ProfileBadgeItem } from '@/src/features/profile/components/ProfileBadgeItem';
import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { AppIcon, theme } from '@/src/ui';

type ProfileBadgesRowProps = {
  badges: readonly ProfileBadge[];
  showTrophy?: boolean;
};

export function ProfileBadgesRow({
  badges,
  showTrophy = true,
}: Readonly<ProfileBadgesRowProps>) {
  return (
    <View style={styles.featuredRow}>
      {showTrophy ? (
        <View style={styles.trophyWrap}>
          <AppIcon name="trophy" size={theme.iconSizes.xl} color={theme.colors.textPrimary} />
        </View>
      ) : null}
      {badges.map((badge) => (
        <ProfileBadgeItem key={badge.id} badge={badge} size="sm" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    flexWrap: 'wrap',
  },
  trophyWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
});
