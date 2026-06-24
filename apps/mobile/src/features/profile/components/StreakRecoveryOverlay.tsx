import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { STREAK_LEVEL_COLORS, type StreakLevel } from '@/src/features/profile/constants/streak';
import type { RecoveryWindow } from '@/src/features/profile/utils/recovery';
import { AppButton, AppCard, AppIcon, AppText, theme } from '@/src/ui';

/** 'ask' = ofrecer recuperar; 'recovered' = celebración tras recuperar (la recompensa). */
type StreakRecoveryMode = 'ask' | 'recovered';

type StreakRecoveryOverlayProps = {
  visible: boolean;
  mode?: StreakRecoveryMode;
  /** Días en juego ('ask') o días reales recuperados ('recovered'). */
  streakDays: number;
  level: number;
  /** Calor real que devuelve el backend al recuperar. */
  heat: number;
  countdown: RecoveryWindow | null;
  loading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

/** Modal de recuperación de racha (#258): modo 'ask' (oferta) y 'recovered' (celebración). */
export function StreakRecoveryOverlay({
  visible,
  mode = 'ask',
  streakDays,
  level,
  heat,
  countdown,
  loading = false,
  onConfirm,
  onDismiss,
}: StreakRecoveryOverlayProps) {
  const safeLevel = Math.max(1, Math.min(7, level)) as StreakLevel;
  const levelColor = STREAK_LEVEL_COLORS[safeLevel];
  const recovered = mode === 'recovered';

  // Flama (celebración) = color de nivel; escudo (oferta) = verde de marca.
  const circleTint = {
    backgroundColor: theme.withAlpha(levelColor, 0.1),
    borderColor: levelColor,
    ...theme.shadows.glow,
    shadowColor: levelColor,
  };
  const shieldTint = {
    backgroundColor: theme.withAlpha(theme.colors.primary, 0.1),
    borderColor: theme.colors.primary,
    ...theme.shadows.glow,
    shadowColor: theme.colors.primary,
  };

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(
      recovered
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
  }, [visible, recovered]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      {visible ? (
        <Animated.View entering={FadeIn.duration(140)} style={styles.backdrop}>
          <Animated.View
            key={mode}
            entering={
              recovered
                ? FadeIn.duration(200)
                : FadeInUp.duration(300).easing(Easing.out(Easing.cubic))
            }
            style={styles.cardWrap}
          >
            <AppCard style={styles.card}>
              {recovered ? (
                <>
                  <View style={[styles.circle, circleTint]}>
                    <Animated.View entering={ZoomIn.duration(260)}>
                      <AppIcon name="flame" size={48} color={levelColor} />
                    </Animated.View>
                  </View>

                  <AppText variant="h2" style={styles.center}>
                    ¡Racha recuperada!
                  </AppText>

                  <AppText style={[styles.bigNum, styles.center, { color: levelColor }]}>
                    {streakDays}
                  </AppText>
                  <AppText variant="caption" muted style={styles.center}>
                    {streakDays === 1 ? 'día' : 'días'} de racha de vuelta
                  </AppText>

                  <AppText variant="caption" muted style={styles.center}>
                    Conservas tu nivel {safeLevel} y vuelves con {heat}% de calor.
                  </AppText>

                  <AppButton label="¡Genial!" onPress={onDismiss} style={styles.button} />
                </>
              ) : (
                <>
                  <View style={[styles.circle, shieldTint]}>
                    <AppIcon name="shield" size={48} color={theme.colors.primary} />
                  </View>

                  <AppText variant="h3" style={styles.center}>
                    ¡Perdiste tu racha de {streakDays} {streakDays === 1 ? 'día' : 'días'}!
                  </AppText>

                  <AppText variant="body" muted style={styles.center}>
                    Puedes recuperarla con el escudo que ganaste.
                  </AppText>

                  {countdown && !countdown.expired ? (
                    <View style={styles.chip}>
                      <AppIcon
                        name="clock"
                        size={theme.iconSizes.sm}
                        color={theme.colors.textSecondary}
                      />
                      <AppText variant="caption" style={styles.chipText}>
                        {countdown.label}
                      </AppText>
                    </View>
                  ) : null}

                  <AppButton
                    label="Recuperar mi racha"
                    loading={loading}
                    disabled={loading}
                    onPress={onConfirm}
                    style={styles.button}
                  />
                  <Pressable onPress={onDismiss} disabled={loading} hitSlop={8}>
                    <AppText variant="caption" style={styles.secondary}>
                      Ahora no
                    </AppText>
                  </Pressable>
                </>
              )}
            </AppCard>
          </Animated.View>
        </Animated.View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.scrim,
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
  circle: {
    width: 108,
    height: 108,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  bigNum: {
    fontSize: 56,
    lineHeight: 58,
    fontWeight: theme.fontWeights.extrabold,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  secondary: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
    paddingVertical: theme.spacing.xs,
  },
});
