import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useRewardOverlay } from '@/src/contexts/RewardOverlayContext';
import { AppIcon, AppText, BADGE_STATIC_DATA, BadgeFrame, STREAK_LEVEL_COLORS, theme, type StreakLevel } from '@/src/ui';

// ─── Phase machine ────────────────────────────────────────────────────────────
// ENTERING  : overlay fades in, title shown, tap interrupts and goes to ITEM
// TITLE     : "¡Bien hecho!" + hint visible, waiting for first tap
// ITEM      : showing item at `index`, waiting for tap
// EXITING   : fade out, then hideReward()
type Phase = 'entering' | 'title' | 'item' | 'exiting';

const ENTER_DURATION = 1500; // ms before auto-advancing from entering → title
const FADE_DURATION = 220;   // ms for item-to-item crossfade
const EXIT_DURATION = 300;

export function RecycleRewardOverlay() {
  const { items, visible, hideReward } = useRewardOverlay();

  const [phase, setPhase] = useState<Phase>('entering');
  const [index, setIndex] = useState(0);

  // Animated values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

  // Reset state whenever overlay becomes visible
  useEffect(() => {
    if (!visible) return;
    setPhase('entering');
    setIndex(0);
    backdropOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardTranslateY.setValue(40);

    // Animate in
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(cardOpacity,    { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
    ]).start();

    // Auto-advance to title after ENTER_DURATION
    const timer = setTimeout(() => setPhase('title'), ENTER_DURATION);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function crossfadeTo(next: () => void) {
    Animated.timing(cardOpacity, { toValue: 0, duration: FADE_DURATION / 2, useNativeDriver: true }).start(() => {
      next();
      Animated.timing(cardOpacity, { toValue: 1, duration: FADE_DURATION / 2, useNativeDriver: true }).start();
    });
  }

  function exit() {
    setPhase('exiting');
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(cardOpacity,     { toValue: 0, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(cardTranslateY,  { toValue: 40, duration: EXIT_DURATION, useNativeDriver: true }),
    ]).start(() => hideReward());
  }

  function handleTap() {
    if (phase === 'exiting') return;

    if (phase === 'entering' || phase === 'title') {
      // First tap: skip to first item
      crossfadeTo(() => {
        setPhase('item');
        setIndex(0);
      });
      return;
    }

    // phase === 'item'
    const nextIndex = index + 1;
    if (nextIndex < items.length) {
      crossfadeTo(() => setIndex(nextIndex));
    } else {
      exit();
    }
  }

  if (!visible) return null;

  const current = phase === 'item' ? items[index] : null;
  const remaining = phase === 'item' ? items.length - index - 1 : items.length;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={exit}>
      <Pressable style={styles.backdrop} onPress={handleTap}>
        <Animated.View style={[styles.backdropFill, { opacity: backdropOpacity }]} />

        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] },
          ]}
          // Prevent the card's own touch from double-firing the backdrop press
          pointerEvents="box-none"
        >
          {(phase === 'entering' || phase === 'title') && (
            <TitleCard remaining={remaining} />
          )}

          {phase === 'item' && current?.type === 'streak' && (
            <StreakCard item={current} remaining={remaining} />
          )}

          {phase === 'item' && current?.type === 'achievement' && (
            <AchievementCard item={current} remaining={remaining} />
          )}
        </Animated.View>

        {/* Tap-anywhere hint at the bottom */}
        <Animated.View style={[styles.tapHint, { opacity: backdropOpacity }]}>
          <AppText style={styles.tapHintText}>
            {phase === 'exiting' ? '' : phase === 'item' && remaining === 0 ? 'Toca para cerrar' : 'Toca para continuar'}
          </AppText>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ─── Sub-cards ────────────────────────────────────────────────────────────────

function TitleCard({ remaining }: { remaining: number }) {
  return (
    <View style={styles.cardInner}>
      <AppText style={styles.titleEmoji}>♻️</AppText>
      <AppText style={styles.titleMain}>¡Bien hecho!</AppText>
      <AppText style={styles.titleSub}>
        {remaining === 0
          ? 'Sin novedades esta vez.'
          : remaining === 1
            ? 'Tienes 1 novedad'
            : `Tienes ${remaining} novedades`}
      </AppText>
    </View>
  );
}

function StreakCard({ item, remaining }: { item: Extract<import('@/src/contexts/RewardOverlayContext').RewardItem, { type: 'streak' }>; remaining: number }) {
  const safeLevel = Math.max(1, Math.min(7, item.level)) as StreakLevel;
  const levelColor = STREAK_LEVEL_COLORS[safeLevel];

  return (
    <View style={styles.cardInner}>
      <View style={[styles.flameCircle, { backgroundColor: `${levelColor}22`, borderColor: levelColor }]}>
        <AppIcon name="flame" size={theme.iconSizes.xl} color={levelColor} />
      </View>

      <AppText style={styles.titleMain}>
        {item.leveledUp ? `¡Subiste a nivel ${safeLevel}!` : item.streakExtendedToday ? '¡Racha extendida!' : '¡Racha activa!'}
      </AppText>

      <View style={[styles.chip, { backgroundColor: `${levelColor}1A` }]}>
        <AppIcon name="flame" size={theme.iconSizes.sm} color={levelColor} />
        <AppText style={[styles.chipText, { color: levelColor }]}>
          {item.streakDays} {item.streakDays === 1 ? 'día' : 'días'} seguidos
          {item.leveledUp ? ` · Nivel ${safeLevel}` : ''}
        </AppText>
      </View>

      {remaining > 0 ? (
        <AppText style={styles.moreHint}>
          +{remaining} logro{remaining > 1 ? 's' : ''} desbloqueado{remaining > 1 ? 's' : ''}
        </AppText>
      ) : null}
    </View>
  );
}

function AchievementCard({ item, remaining }: { item: Extract<import('@/src/contexts/RewardOverlayContext').RewardItem, { type: 'achievement' }>; remaining: number }) {
  const staticData = BADGE_STATIC_DATA[item.badgeId];

  return (
    <View style={styles.cardInner}>
      {staticData ? (
        <BadgeFrame image={staticData.image} size="lg" />
      ) : (
        <View style={styles.badgePlaceholder} />
      )}
      <AppText style={styles.titleMain}>¡Logro desbloqueado!</AppText>
      {item.badgeName ? <AppText style={styles.achievementName}>{item.badgeName}</AppText> : null}
      {item.badgeReward ? (
        <View style={styles.pill}>
          <AppText style={styles.pillText}>{item.badgeReward}</AppText>
        </View>
      ) : null}
      {item.badgeDescription ? (
        <AppText style={styles.description}>{item.badgeDescription}</AppText>
      ) : null}
      {remaining > 0 ? (
        <AppText style={styles.moreHint}>
          +{remaining} más
        </AppText>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  card: {
    width: '82%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  cardInner: {
    alignItems: 'center',
    padding: theme.spacing.s6 ?? 32,
    gap: theme.spacing.s3 ?? 12,
  },
  tapHint: {
    position: 'absolute',
    bottom: 48,
  },
  tapHintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: theme.fontSizes.sm,
    letterSpacing: 0.5,
  },
  titleEmoji: {
    fontSize: 56,
    lineHeight: 68,
  },
  titleMain: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  titleSub: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  flameCircle: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s1,
    borderRadius: theme.radius.pill,
  },
  chipText: {
    fontWeight: theme.fontWeights.semibold,
    fontSize: theme.fontSizes.sm,
  },
  pill: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s1,
  },
  pillText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
    fontSize: theme.fontSizes.md,
  },
  achievementName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  moreHint: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  badgePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.border,
  },
});
