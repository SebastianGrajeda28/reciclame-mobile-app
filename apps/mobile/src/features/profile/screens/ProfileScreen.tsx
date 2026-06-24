import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { routes } from '@/src/constants/routes';
import { recoverStreak } from '@/src/features/profile/api/streak';
import { ProfileAchievementsPreviewCard } from '@/src/features/profile/components/ProfileAchievementsPreviewCard';
import { ProfileHeroCard } from '@/src/features/profile/components/ProfileHeroCard';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileStatsGrid } from '@/src/features/profile/components/ProfileStatsGrid';
import { ProfileStreakCard } from '@/src/features/profile/components/ProfileStreakCard';
import { StreakRecoveryOverlay } from '@/src/features/profile/components/StreakRecoveryOverlay';
import { RECOVERY_BASE_HEAT } from '@/src/features/profile/constants/streak';
import { useAvatarConfig } from '@/src/features/profile/hooks/useAvatarConfig';
import { useProfileGamification } from '@/src/features/profile/hooks/useProfileGamification';
import { useRecoveryCountdown } from '@/src/features/profile/hooks/useRecoveryCountdown';
import { useStreakProgress } from '@/src/features/profile/hooks/useStreakProgress';
import { formatMemberSince } from '@/src/features/profile/utils/formatMemberSince';
import { isRecoveryUrgent } from '@/src/features/profile/utils/recovery';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { AppButton, AppCard, AppIcon, AppText, theme } from '@/src/ui';

// QA (__DEV__): simula una racha recuperable para probar la UI sin backend. Ponlo en true localmente.
const DEV_SIMULATE_RECOVERY = __DEV__ && false;

export function ProfileScreen() {
  const currentUser = useCurrentUser();
  const { data: streakData, refetch } = useStreakProgress();
  const { config: avatarConfig } = useAvatarConfig();
  const { lastUnlockedBadges, stats } = useProfileGamification();
  const displayName = currentUser?.displayName ?? 'Tu perfil';

  const [recoverVisible, setRecoverVisible] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoverMode, setRecoverMode] = useState<'ask' | 'recovered'>('ask');
  const [justRecovered, setJustRecovered] = useState(false);
  const [recoveredDays, setRecoveredDays] = useState<number | null>(null);
  const [recoveredHeat, setRecoveredHeat] = useState(RECOVERY_BASE_HEAT);
  const [lostDismissed, setLostDismissed] = useState(false);

  // Oferta visible solo con escudo y dentro de la ventana (override de QA en DEV).
  const recoveries = DEV_SIMULATE_RECOVERY ? 1 : (streakData?.recoveries ?? 0);
  const recoverableUntil = DEV_SIMULATE_RECOVERY
    ? new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString()
    : (streakData?.recoverableUntil ?? null);
  const level = DEV_SIMULATE_RECOVERY ? 3 : (streakData?.level ?? 1);
  // Días reales perdidos (no streakDays, que vale 0 tras morir) para que la oferta no diga "0 días".
  const lostStreakDays = DEV_SIMULATE_RECOVERY ? 12 : (streakData?.streakDaysLost ?? 0);

  const recoveryCountdown = useRecoveryCountdown(recoverableUntil);
  const canRecover = recoveries > 0 && recoveryCountdown != null && !recoveryCountdown.expired;
  const showRecover = canRecover && !justRecovered;
  // Card de pérdida estándar solo cuando NO se ofrece recuperación (ni se acaba de recuperar).
  const showStreakLost =
    Boolean(streakData?.justExpired) && !showRecover && !justRecovered && !lostDismissed;
  const recoverUrgent = isRecoveryUrgent(recoveryCountdown);
  // Plazo en gris; rojo si urge (<6h).
  const recoverAccent = recoverUrgent ? theme.colors.danger : theme.colors.textSecondary;

  async function handleRecover() {
    if (recovering) return;
    setRecovering(true);
    try {
      if (DEV_SIMULATE_RECOVERY) {
        setRecoveredDays(lostStreakDays);
        setRecoveredHeat(RECOVERY_BASE_HEAT);
      } else {
        const userId = currentUser?.id;
        if (!userId) return;
        const result = await recoverStreak(userId);
        setRecoveredDays(result.streakDays);
        setRecoveredHeat(result.heat);
        refetch(); // el escudo ya se consumió en el backend
      }
      setJustRecovered(true);
      setRecoverMode('recovered');
    } catch (err) {
      Alert.alert(
        'No se pudo recuperar',
        err instanceof Error ? err.message : 'Intenta nuevamente más tarde.',
      );
    } finally {
      setRecovering(false);
    }
  }

  function closeRecover() {
    setRecoverVisible(false);
    setRecoverMode('ask');
  }

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
      {showRecover ? (
        <AppCard style={styles.recoverCard}>
          <View style={styles.recoverHeader}>
            <AppIcon name="shield" size={theme.iconSizes.md} color={theme.colors.primary} />
            <AppText variant="h3">Tu racha llegó a su fin</AppText>
          </View>
          <AppText variant="caption" muted>
            Aún puedes recuperarla con tu escudo. Conservas tu nivel {level}.
          </AppText>
          {recoveryCountdown ? (
            <View style={styles.recoverCountdownRow}>
              <AppIcon name="clock" size={theme.iconSizes.sm} color={recoverAccent} />
              <AppText variant="caption" style={{ color: recoverAccent }}>
                {recoveryCountdown.label}
              </AppText>
            </View>
          ) : null}
          <AppButton label="Recuperar mi racha" onPress={() => setRecoverVisible(true)} />
        </AppCard>
      ) : showStreakLost ? (
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
      <StreakRecoveryOverlay
        visible={recoverVisible}
        mode={recoverMode}
        streakDays={recoveredDays ?? lostStreakDays}
        level={level}
        heat={recoveredHeat}
        countdown={recoveryCountdown}
        loading={recovering}
        onConfirm={handleRecover}
        onDismiss={closeRecover}
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
  recoverCard: {
    gap: theme.spacing.sm,
  },
  recoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  recoverCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
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
