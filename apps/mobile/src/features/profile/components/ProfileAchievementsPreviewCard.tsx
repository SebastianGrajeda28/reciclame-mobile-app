import { StyleSheet, View } from 'react-native';

import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { ProfileBadgesRow } from '@/src/features/profile/components/ProfileFeaturedBadgesRow';
import { AppButton, AppCard, AppCardFooter, AppCardTitle, theme } from '@/src/ui';

type ProfileAchievementsPreviewCardProps = {
  featuredBadges: readonly ProfileBadge[];
  onSeeAllPress: () => void;
  onCustomizePress: () => void;
};

export function ProfileAchievementsPreviewCard({
  featuredBadges,
  onSeeAllPress,
  onCustomizePress,
}: Readonly<ProfileAchievementsPreviewCardProps>) {
  return (
    <AppCard>
      <AppCardTitle>Insignias destacadas</AppCardTitle>

      <View style={styles.badgeRow}>
        <ProfileBadgesRow badges={featuredBadges} />
      </View>

      <AppCardFooter align="between" style={styles.achievementActions}>
        <AppButton
          label="Ver todos los logros"
          variant="outline"
          size="sm"
          onPress={onSeeAllPress}
        />
        <AppButton label="Personalizar" size="sm" onPress={onCustomizePress} />
      </AppCardFooter>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    marginTop: theme.spacing.s3,
    marginBottom: theme.spacing.s3,
  },
  achievementActions: {
    gap: theme.spacing.s2,
  },
});
