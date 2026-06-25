import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { routes } from '@/src/constants/routes';
import { FunFactCard } from '@/src/features/recycling/components/FunFactCard';
import { StreakCelebrationOverlay } from '@/src/features/recycling/components/StreakCelebrationOverlay';
import { useFunFactByWasteTypeId } from '@/src/features/recycling/hooks/useFunFact';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppIcon, AppScreen, AppText, StreakHeatBadge, theme } from '@/src/ui';

export function SuccessScreen() {
  const navigation = useNavigation();
  const { resetFlow, state } = useRecycleFlow();
  const { finalWasteType, selectedContainer } = useResolvedRecycleSelection();
  const { funFact } = useFunFactByWasteTypeId(finalWasteType?.id);
  const streak = state.streakResult;
  const [showCelebration, setShowCelebration] = useState(Boolean(streak?.streakExtendedToday));

  // Limpia el flujo al salir definitivamente (replace/dismiss). No se dispara con push,
  // así que navegar a historial deja el estado intacto para que el usuario pueda volver.
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      resetFlow();
    });
  }, [navigation, resetFlow]);

  function handleDone() {
    router.replace('/(tabs)');
  }

  function handleRecycleAnother() {
    router.replace('/recycle/camera');
  }

  function handleViewHistory() {
    router.push(routes.recycleHistory);
  }

  return (
    <AppScreen padded centered style={styles.root}>
      <View style={styles.iconCircle}>
        <AppIcon name="check" size={theme.iconSizes.xl} color={theme.colors.textInverse} />
      </View>

      <AppText variant="h2" style={styles.center}>
        ¡Reciclaje registrado!
      </AppText>

      {(finalWasteType || selectedContainer) && (
        <View style={styles.metaWrap}>
          {finalWasteType && (
            <AppText variant="body" muted style={styles.center}>
              {finalWasteType.categoryLabel}
            </AppText>
          )}
          {selectedContainer && (
            <AppText variant="bodyS" muted style={styles.center}>
              {selectedContainer.name}
            </AppText>
          )}
        </View>
      )}

      {streak?.alreadyRecycledToday ? (
        <View style={styles.streakPill}>
          <AppText variant="caption" style={styles.streakPillText}>
            Ya aseguraste tu racha hoy
          </AppText>
          <StreakHeatBadge
            streakDays={streak.streakDays}
            level={streak.level}
            heat={streak.heat}
            size="sm"
          />
        </View>
      ) : null}

      {funFact ? <FunFactCard text={funFact.text} style={styles.funFact} /> : null}

      <View style={styles.actions}>
        <AppButton label="Reciclar otro ítem" onPress={handleRecycleAnother} />
        <AppButton variant="outline" label="Volver al mapa" onPress={handleDone} />
        <AppButton
          variant="outline"
          label="Ver mi historial"
          onPress={handleViewHistory}
        />
      </View>

      {streak ? (
        <StreakCelebrationOverlay
          visible={showCelebration}
          streakDays={streak.streakDays}
          level={streak.level}
          leveledUp={streak.leveledUp}
          onDismiss={() => setShowCelebration(false)}
        />
      ) : null}
    </AppScreen>
  );
}

export default SuccessScreen;

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.s3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.s2,
    ...theme.shadows.md,
  },
  center: {
    textAlign: 'center',
  },
  metaWrap: {
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s1,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.s1,
  },
  streakPillText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  funFact: {
    width: '100%',
    marginTop: 0,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.s2,
    marginTop: theme.spacing.s5,
  },
});