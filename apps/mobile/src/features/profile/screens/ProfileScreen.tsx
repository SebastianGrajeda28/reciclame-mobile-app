import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { routes } from '@/src/constants/routes';
import { ProfileAchievementsPreviewCard } from '@/src/features/profile/components/ProfileAchievementsPreviewCard';
import { ProfileHeroCard } from '@/src/features/profile/components/ProfileHeroCard';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileStatsGrid } from '@/src/features/profile/components/ProfileStatsGrid';
import { ProfileStreakCard } from '@/src/features/profile/components/ProfileStreakCard';
import { useAvatarConfig } from '@/src/features/profile/hooks/useAvatarConfig';
import { useProfileGamification } from '@/src/features/profile/hooks/useProfileGamification';
import { useStreakProgress } from '@/src/features/profile/hooks/useStreakProgress';
import { formatMemberSince } from '@/src/features/profile/utils/formatMemberSince';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { AppButton, AppCard, AppIcon, AppText, theme } from '@/src/ui';

export function ProfileScreen() {
  const currentUser = useCurrentUser();
  const { data: streakData } = useStreakProgress();
  const { config: avatarConfig } = useAvatarConfig();
  const { lastUnlockedBadges, stats } = useProfileGamification();
  const displayName = currentUser?.displayName ?? 'Tu perfil';
  const [lostDismissed, setLostDismissed] = useState(false);
  const showStreakLost = Boolean(streakData?.justExpired) && !lostDismissed;

  return (
    <ProfileScreenContainer>
      <ProfileHeroCard
        displayName={displayName}
        email={currentUser?.email}
        avatarUrl={currentUser?.avatarUrl}
        avatarConfig={avatarConfig}
        memberSinceLabel={formatMemberSince(currentUser?.createdAt)}
        onCustomizePress={() => router.push(routes.profileAvatar)}
        onSettingsPress={() => router.push(routes.profileSettings)}
      />
      {showStreakLost ? (
        <AppCard style={styles.lostCard}>
          <View style={styles.lostHeader}>
            <AppIcon name="alertCircle" size={theme.iconSizes.md} color={theme.colors.danger} />
            <AppText variant="h3" style={styles.lostTitle}>
              Perdiste tu racha
            </AppText>
          </View>
          <AppText variant="caption" muted style={styles.lostText}>
            Pasó el tiempo de gracia sin segregar. Tu nivel se mantiene — empieza una nueva racha
            reciclando hoy.
          </AppText>
          <AppButton variant="outline" label="Entendido" onPress={() => setLostDismissed(true)} />
        </AppCard>
      ) : null}
      <ProfileStreakCard
        currentStreakDays={streakData?.streakDays ?? 0}
        heat={streakData?.heat ?? 0}
        level={streakData?.level ?? 1}
        recycledToday={streakData?.recycledToday ?? false}
        expiresAt={streakData?.expiresAt ?? null}
      />
      <Pressable
        style={({ pressed }) => [styles.historyRow, pressed && styles.historyRowPressed]}
        onPress={() => router.push(routes.profileStreak)}
      >
        <View style={styles.historyLeft}>
          <AppIcon name="flame" size={theme.iconSizes.sm} color={theme.colors.primary} />
          <AppText style={styles.historyLabel}>Racha y actividad</AppText>
        </View>
        <AppIcon name="chevronRight" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
      </Pressable>
      <ProfileAchievementsPreviewCard
        featuredBadges={lastUnlockedBadges}
        onSeeAllPress={() => router.push(routes.profileAchievements)}
        onCustomizePress={() => router.push(routes.profileFeaturedBadges)}
      />
      <ProfileStatsGrid stats={stats} />
      <Pressable
        style={({ pressed }) => [styles.historyRow, pressed && styles.historyRowPressed]}
        onPress={() => router.push(routes.recycleHistory)}
      >
        <View style={styles.historyLeft}>
          <AppIcon name="recycle" size={theme.iconSizes.sm} color={theme.colors.primary} />
          <AppText style={styles.historyLabel}>Mi Historial</AppText>
        </View>
        <AppIcon name="chevronRight" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
      </Pressable>
    </ProfileScreenContainer>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  lostCard: {
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  lostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lostTitle: {
    color: theme.colors.danger,
  },
  lostText: {
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyRowPressed: {
    opacity: 0.7,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textPrimary,
  },
});
