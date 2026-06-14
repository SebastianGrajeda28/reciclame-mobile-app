import { router } from 'expo-router';

import { ProfileAchievementRow } from '@/src/features/profile/components/ProfileAchievementRow';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';
import { AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

export function ProfileAchievementsScreen() {
  const { allBadges } = profileGamificationSnapshot;
  const earned = allBadges.filter((b) => !!b.earnedAt);
  const locked = allBadges.filter((b) => !b.earnedAt);
  const sorted = [...earned, ...locked];

  return (
    <ProfileScreenContainer>
      <ProfileSubpageHeader
        title="Logros"
        leading={
          <AppIconButton
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            variant="outline"
            icon={
              <AppIcon name="arrowLeft" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
            }
          />
        }
      />

      <AppText muted>
        {earned.length} de {allBadges.length} obtenidos
      </AppText>

      {sorted.map((badge) => (
        <ProfileAchievementRow key={badge.id} badge={badge} />
      ))}
    </ProfileScreenContainer>
  );
}

export default ProfileAchievementsScreen;
