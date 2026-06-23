import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppScreen, AppText, BADGE_STATIC_DATA, BadgeFrame, theme } from '@/src/ui';

type QueuedItem =
  | { type: 'achievement'; badgeId: string; badgeName?: string; badgeReward?: string; badgeDescription?: string }
  | { type: 'streak'; streakDays: number; leveledUp?: boolean; level?: number; streakExtendedToday?: boolean };

type AchievementRewardScreenProps = {
  // achievement mode
  badgeId?: string;
  badgeName?: string;
  badgeReward?: string;
  badgeDescription?: string;
  // streak mode
  streakDays?: string;
  leveledUp?: string;
  level?: string;
  streakExtendedToday?: string;
  // shared
  queue?: string; // JSON-encoded QueuedItem[]
};

export function AchievementRewardScreen({
  badgeId,
  badgeName,
  badgeReward,
  badgeDescription,
  streakDays,
  leveledUp,
  level,
  streakExtendedToday,
  queue,
}: AchievementRewardScreenProps) {
  // Build the full sequence from the initial params + queue, once on mount.
  const allItems = useMemo<QueuedItem[]>(() => {
    const initial: QueuedItem | null = badgeId
      ? { type: 'achievement', badgeId, badgeName, badgeReward, badgeDescription }
      : streakDays !== undefined
        ? {
            type: 'streak',
            streakDays: parseInt(streakDays, 10),
            leveledUp: leveledUp === 'true',
            level: level ? parseInt(level, 10) : 1,
            streakExtendedToday: streakExtendedToday !== 'false',
          }
        : null;

    const queued: QueuedItem[] = (() => {
      try { return queue ? (JSON.parse(queue) as QueuedItem[]) : []; }
      catch { return []; }
    })();

    return initial ? [initial, ...queued] : queued;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount — props are route params that don't change

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  const current = allItems[index] ?? null;

  useEffect(() => {
    if (!current) {
      router.replace('/recycle/success');
      return;
    }
    // Skip badges that have no static data (slug not mapped in frontend)
    if (current.type === 'achievement' && !BADGE_STATIC_DATA[current.badgeId]) {
      setIndex((i) => i + 1);
      return;
    }
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;

  const remaining = allItems.length - index - 1;

  function handleContinue() {
    if (index + 1 < allItems.length) {
      setIndex(index + 1);
    } else {
      router.replace('/recycle/success');
    }
  }

  if (current.type === 'streak') {
    const didLevelUp = current.leveledUp ?? false;
    const levelNum = current.level ?? 1;
    const didExtendToday = current.streakExtendedToday !== false;

    return (
      <AppScreen padded centered style={styles.root}>
        <View style={[styles.iconWrap, animate && styles.iconWrapAnimated]}>
          <View style={styles.streakCircle}>
            <AppText style={styles.streakNumber}>{current.streakDays}</AppText>
            <AppText style={styles.streakLabel}>días seguidos</AppText>
          </View>
        </View>

        <AppText style={styles.title}>{didExtendToday ? '¡Racha extendida!' : '¡Racha activa!'}</AppText>

        {didLevelUp ? (
          <View style={styles.rewardCard}>
            <AppText variant="caption" muted style={styles.rewardLabel}>Nuevo nivel</AppText>
            <AppText variant="h3" style={styles.rewardText}>Nivel {levelNum} 🔥</AppText>
          </View>
        ) : null}

        {remaining > 0 ? (
          <AppText variant="caption" muted style={styles.moreHint}>
            +{remaining} logro{remaining > 1 ? 's' : ''} desbloqueado{remaining > 1 ? 's' : ''}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <AppButton label={remaining > 0 ? 'Siguiente' : 'Continuar'} onPress={handleContinue} />
        </View>
      </AppScreen>
    );
  }

  // achievement mode
  const staticData = BADGE_STATIC_DATA[current.badgeId];

  // useEffect handles the skip — render null while the index update is pending
  if (!staticData) return null;

  return (
    <AppScreen padded centered style={styles.root}>
      <View style={[styles.iconWrap, animate && styles.iconWrapAnimated]}>
        <BadgeFrame image={staticData.image} size="lg" />
      </View>

      <AppText style={styles.title}>¡Logro desbloqueado!</AppText>

      {current.badgeName ? <AppText style={styles.name}>{current.badgeName}</AppText> : null}

      {current.badgeReward ? (
        <View style={styles.rewardCard}>
          <AppText variant="caption" muted style={styles.rewardLabel}>Recompensa</AppText>
          <AppText variant="h3" style={styles.rewardText}>{current.badgeReward}</AppText>
        </View>
      ) : null}

      {current.badgeDescription ? (
        <AppText variant="body" style={styles.description}>{current.badgeDescription}</AppText>
      ) : null}

      {remaining > 0 ? (
        <AppText variant="caption" muted style={styles.moreHint}>
          +{remaining} logro{remaining > 1 ? 's' : ''} más desbloqueado{remaining > 1 ? 's' : ''}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        <AppButton label={remaining > 0 ? 'Siguiente' : 'Continuar'} onPress={handleContinue} />
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
  moreHint: {
    textAlign: 'center',
    color: theme.colors.primary,
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: theme.colors.primaryPressed,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  streakNumber: {
    color: theme.colors.primaryPressed,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: theme.fontWeights.extrabold,
  },
  streakLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
});
