import { StyleSheet, View } from 'react-native';

import { ProfileBadgeItem } from '@/src/features/profile/components/ProfileBadgeItem';
import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { theme } from '@/src/ui';

type ProfileBadgeGridProps = {
  badges: readonly ProfileBadge[];
  showName?: boolean;
};

export function ProfileBadgeGrid({ badges, showName = false }: ProfileBadgeGridProps) {
  return (
    <View style={styles.badgeGrid}>
      {badges.map((badge) => (
        <ProfileBadgeItem key={badge.id} badge={badge} size="md" showName={showName} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s3,
  },
});
