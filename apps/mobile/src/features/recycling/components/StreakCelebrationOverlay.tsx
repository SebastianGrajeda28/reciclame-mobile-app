import { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  AppButton,
  AppCard,
  AppIcon,
  AppText,
  STREAK_LEVEL_COLORS,
  type StreakLevel,
  theme,
} from '@/src/ui';

type StreakCelebrationOverlayProps = {
  visible: boolean;
  streakDays: number;
  level: number;
  leveledUp: boolean;
  onDismiss: () => void;
};

/**
 * Celebración tipo Duolingo al cumplir la racha (#175). Respeta el nivel de calor: la flama y
 * el acento toman el color del nivel. Si subió de nivel muestra la variante de nivel.
 */
export function StreakCelebrationOverlay({
  visible,
  streakDays,
  level,
  leveledUp,
  onDismiss,
}: StreakCelebrationOverlayProps) {
  const safeLevel = Math.max(1, Math.min(7, level)) as StreakLevel;
  const levelColor = STREAK_LEVEL_COLORS[safeLevel];

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.cardWrap}>
          <AppCard style={styles.card}>
            <Animated.View
              entering={FadeIn.delay(120)}
              style={[styles.flameCircle, { backgroundColor: `${levelColor}22`, borderColor: levelColor }]}
            >
              <AppIcon name="flame" size={theme.iconSizes.xl} color={levelColor} />
            </Animated.View>

            <AppText variant="h2" style={styles.title}>
              {leveledUp ? `¡Subiste a nivel ${safeLevel}!` : '¡Racha en marcha!'}
            </AppText>

            <View style={[styles.chip, { backgroundColor: `${levelColor}1A` }]}>
              <AppIcon name="flame" size={theme.iconSizes.sm} color={levelColor} />
              <AppText variant="caption" style={[styles.chipText, { color: levelColor }]}>
                {streakDays} {streakDays === 1 ? 'día' : 'días'} seguidos
                {leveledUp ? ` · Nivel ${safeLevel}` : ''}
              </AppText>
            </View>

            <AppText variant="caption" muted style={styles.subtitle}>
              {leveledUp
                ? 'Cuanto más alto tu nivel, más calor ganas al reciclar.'
                : 'Vuelve mañana a segregar para no perder tu racha.'}
            </AppText>

            <AppButton label="¡Genial!" onPress={onDismiss} style={styles.button} />
          </AppCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  flameCircle: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
  },
  chipText: {
    fontWeight: theme.fontWeights.semibold,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
});
