import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import {
  AppButton,
  AppCard,
  AppCardDescription,
  AppCardEyebrow,
  AppCardHeaderText,
  AppCardTitle,
  AppScreen,
  AppText,
  theme,
} from '@/src/ui';

export function SuccessScreen() {
  const { resetFlow } = useRecycleFlow();
  const { finalWasteType } = useResolvedRecycleSelection();

  const backToMap = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  return (
    <AppScreen padded centered>
      <AppCard style={styles.card}>
        <View style={styles.iconWrap}>
          <AppText style={styles.check}>✓</AppText>
        </View>
        <AppCardHeaderText style={styles.headerText}>
          <AppCardTitle variant="title" style={styles.title}>
            Reciclaje registrado
          </AppCardTitle>
          <AppCardDescription style={styles.topGap}>
            Residuo: {finalWasteType?.label ?? 'No definido'}
          </AppCardDescription>
        </AppCardHeaderText>
        <AppCard variant="info" padding="sm" style={styles.fact}>
          <AppCardEyebrow style={styles.factTitle}>Dato curioso</AppCardEyebrow>
          <AppText muted>
            Reciclar una lata de aluminio ahorra suficiente energia para mantener un televisor
            durante tres horas.
          </AppText>
        </AppCard>
        <AppButton label="Volver al mapa" onPress={backToMap} />
      </AppCard>
    </AppScreen>
  );
}

export default SuccessScreen;

const styles = StyleSheet.create({
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
  headerText: {
    alignItems: 'center',
  },
  topGap: {
    textAlign: 'center',
  },
  fact: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  factTitle: {
    color: theme.colors.info,
    fontWeight: theme.fontWeights.bold,
  },
});
