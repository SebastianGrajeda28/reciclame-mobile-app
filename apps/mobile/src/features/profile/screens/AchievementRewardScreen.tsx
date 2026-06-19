import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { BADGE_STATIC_DATA } from '@/src/features/profile/data/profileGamification';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';

type AchievementRewardScreenProps = {
  badgeId: string;
  badgeName?: string;
  badgeReward?: string;
  badgeDescription?: string;
};

export function AchievementRewardScreen({
  badgeId,
  badgeName,
  badgeReward,
  badgeDescription,
}: AchievementRewardScreenProps) {
  const [animate, setAnimate] = useState(false);
  const staticData = BADGE_STATIC_DATA[badgeId];

  useEffect(() => {
    if (!staticData) {
      router.replace('/recycle/success');
      return;
    }
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, [staticData]);

  if (!staticData) return null;

  return (
    <AppScreen padded centered style={styles.root}>
      <View style={[styles.iconWrap, animate && styles.iconWrapAnimated]}>
        <View style={styles.iconCircle}>
          <Image source={staticData.image} style={styles.image} resizeMode="contain" />
        </View>
      </View>

      <AppText style={styles.title}>¡Logro desbloqueado!</AppText>

      {badgeName ? <AppText style={styles.name}>{badgeName}</AppText> : null}

      {badgeReward ? (
        <View style={styles.rewardCard}>
          <AppText variant="caption" muted style={styles.rewardLabel}>
            Recompensa
          </AppText>
          <AppText variant="h3" style={styles.rewardText}>
            {badgeReward}
          </AppText>
        </View>
      ) : null}

      {badgeDescription ? (
        <AppText variant="body" style={styles.description}>
          {badgeDescription}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        <AppButton label="Continuar" onPress={() => router.replace('/recycle/success')} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.s4,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.s2,
    opacity: 0,
    transform: [{ scale: 0.5 }],
  },
  iconWrapAnimated: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.successBg,
  },
  image: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  name: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.s4,
    alignItems: 'center',
    width: '100%',
  },
  rewardLabel: {
    textAlign: 'center',
    marginBottom: theme.spacing.s1,
  },
  rewardText: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.s4,
  },
  actions: {
    width: '100%',
    marginTop: theme.spacing.s2,
  },
});
