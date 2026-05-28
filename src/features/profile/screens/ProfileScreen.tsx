import { router } from 'expo-router';

import { routes } from '@/src/constants/routes';
import { ProfileAchievementsPreviewCard } from '@/src/features/profile/components/ProfileAchievementsPreviewCard';
import { ProfileHeroCard } from '@/src/features/profile/components/ProfileHeroCard';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileStatsGrid } from '@/src/features/profile/components/ProfileStatsGrid';
import { ProfileStreakCard } from '@/src/features/profile/components/ProfileStreakCard';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';
import { formatMemberSince } from '@/src/features/profile/utils/formatMemberSince';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

export function ProfileScreen() {
  const currentUser = useCurrentUser();
  const displayName = currentUser?.displayName ?? 'Tu perfil';

  const featuredIds = profileGamificationSnapshot.featuredBadgeIds as readonly string[];
  const featuredBadges = profileGamificationSnapshot.allBadges.filter((b) =>
    featuredIds.includes(b.id),
  );

  return (
    <ProfileScreenContainer>
      <ProfileHeroCard
        displayName={displayName}
        email={currentUser?.email}
        avatarUrl={currentUser?.avatarUrl}
        memberSinceLabel={formatMemberSince(currentUser?.createdAt)}
        onCustomizePress={() => router.push(routes.profileAvatar)}
        onSettingsPress={() => router.push(routes.profileSettings)}
      />
      <ProfileStreakCard
        currentStreakDays={profileGamificationSnapshot.currentStreakDays}
        nextStreakMilestoneDays={profileGamificationSnapshot.nextStreakMilestoneDays}
      />
      <ProfileAchievementsPreviewCard
        featuredBadges={featuredBadges}
        onSeeAllPress={() => router.push(routes.profileAchievements)}
        onCustomizePress={() => router.push(routes.profileFeaturedBadges)}
      />
      <ProfileStatsGrid stats={profileGamificationSnapshot.stats} />
    </ProfileScreenContainer>
  );
}

export default ProfileScreen;
