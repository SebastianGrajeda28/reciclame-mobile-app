import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { useResolvedRecycleSelection } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

export function InstructionsScreen() {
  const { selectedContainer, finalWasteType } = useResolvedRecycleSelection();

  useEffect(() => {
    if (!selectedContainer || !finalWasteType) {
      router.replace('/(tabs)');
    }
  }, [selectedContainer, finalWasteType]);

  if (!selectedContainer || !finalWasteType) return null;

  const steps = selectedContainer.instructionsByWasteTypeId[finalWasteType.id] ?? [
    'Deposita el residuo con cuidado en el contenedor seleccionado.',
  ];

  return (
    <AppScreen style={styles.root} padded>
      <AppCard>
        <AppText variant="title">Instrucciones de eliminacion</AppText>
        <AppText muted style={styles.topGap}>
          {selectedContainer.name}
        </AppText>
        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <AppText key={`${step}-${index}`} style={styles.step}>
              {index + 1}. {step}
            </AppText>
          ))}
        </View>
        <AppButton
          label="Confirmar finalizacion"
          onPress={() => router.replace('/recycle/success')}
        />
      </AppCard>
    </AppScreen>
  );
}

export default InstructionsScreen;

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
  },
  topGap: {
    marginTop: theme.spacing.sm,
  },
  stepList: {
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  step: {
    lineHeight: theme.fontSizes.lg + theme.spacing.xxs,
  },
});
