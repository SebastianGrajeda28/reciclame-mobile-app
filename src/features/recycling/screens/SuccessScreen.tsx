import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { useRecycleFlow, useResolvedRecycleSelection } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

export function SuccessScreen() {
  const { resetFlow } = useRecycleFlow();
  const { finalWasteType } = useResolvedRecycleSelection();

  const backToMap = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  return (
    <AppScreen style={styles.root} padded>
      <AppCard style={styles.card}>
        <View style={styles.iconWrap}>
          <AppText style={styles.check}>
            ✓
          </AppText>
        </View>
        <AppText variant="title" style={styles.title}>
          Reciclaje registrado
        </AppText>
        <AppText muted style={styles.topGap}>
          Residuo: {finalWasteType?.label ?? 'No definido'}
        </AppText>
        <AppCard style={styles.fact}>
          <AppText variant="caption" style={styles.factTitle}>
            Dato curioso
          </AppText>
          <AppText muted>
            Reciclar una lata de aluminio ahorra suficiente energia para mantener un televisor durante tres horas.
          </AppText>
        </AppCard>
        <AppButton label="Volver al mapa" onPress={backToMap} />
      </AppCard>
    </AppScreen>
  );
}

export default SuccessScreen;

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: theme.components.maxContentWidth,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  check: {
    color: theme.colors.success,
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
  },
  title: {
    textAlign: 'center',
  },
  topGap: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  fact: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.infoTintBackground,
    borderColor: theme.colors.infoTintBorder,
  },
  factTitle: {
    color: theme.colors.info,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeights.bold,
  },
});

