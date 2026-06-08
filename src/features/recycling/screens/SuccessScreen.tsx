import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { routes } from '@/src/constants/routes';
import { FunFactCard } from '@/src/features/recycling/components/FunFactCard';
import { useFunFactByWasteTypeId } from '@/src/features/recycling/hooks/useFunFact';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppScreen, AppText, theme } from '@/src/ui';

export function SuccessScreen() {
  const { resetFlow } = useRecycleFlow();
  const { finalWasteType, selectedContainer } = useResolvedRecycleSelection();
  const { funFact } = useFunFactByWasteTypeId(finalWasteType?.id);

  function handleDone() {
    resetFlow();
    router.replace('/(tabs)');
  }

  function handleRecycleAnother() {
    resetFlow();
    router.replace('/recycle/camera');
  }

  return (
    <AppScreen padded centered style={styles.root}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <AppText style={styles.check}>✓</AppText>
        </View>
      </View>

      <AppText style={styles.title}>¡Reciclaje registrado!</AppText>

      {finalWasteType && (
        <AppText muted style={styles.subtitle}>
          {finalWasteType.categoryLabel}
        </AppText>
      )}
      {selectedContainer && (
        <AppText muted style={styles.subtitle}>
          {selectedContainer.name}
        </AppText>
      )}

      {funFact ? <FunFactCard text={funFact.text} style={styles.funFact} /> : null}

      <View style={styles.actions}>
        <AppButton label="Reciclar otro ítem" onPress={handleRecycleAnother} />
        <AppButton variant="outline" label="Volver al mapa" onPress={handleDone} />
        <AppButton
          variant="outline"
          label="Ver mi historial"
          onPress={() => router.push(routes.recycleHistory)}
        />
      </View>
    </AppScreen>
  );
}

export default SuccessScreen;

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#fff',
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
  },
  funFact: {
    width: '100%',
  },
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
});
