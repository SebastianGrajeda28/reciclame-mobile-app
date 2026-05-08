import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import {
  classifyWaste,
  getConfidenceThreshold,
} from '@/src/features/recycling/services/classification';
import { getNearbyContainersMock } from '@/src/features/recycling/services/containers';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

export function ProcessingScreen() {
  const { state, setPrediction, setSelectedContainerId } = useRecycleFlow();
  const { predictedWasteType } = useResolvedRecycleSelection();
  const [loading, setLoading] = useState(true);

  const threshold = getConfidenceThreshold();
  const isLowConfidence = (state.predictionConfidence ?? 0) < threshold;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      const result = await classifyWaste(state.capturedPhotoUri ?? 'manual-seed');
      if (!mounted) return;
      setPrediction(result.wasteTypeId, result.confidence);
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [setPrediction, state.capturedPhotoUri]);

  const confidenceText = useMemo(() => {
    if (state.predictionConfidence === undefined) return '--';
    return `${Math.round(state.predictionConfidence * 100)}%`;
  }, [state.predictionConfidence]);

  const acceptPrediction = async () => {
    if (!state.finalWasteTypeId) return;
    const position = await Location.getCurrentPositionAsync();
    const nearby = getNearbyContainersMock(
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      state.finalWasteTypeId,
      3,
    );

    if (nearby.length === 0) {
      Alert.alert('Sin contenedores', 'No se encontraron contenedores compatibles en 3 km.', [
        { text: 'Entendido', onPress: () => router.replace('/(tabs)') },
      ]);
      return;
    }

    setSelectedContainerId(nearby[0].id);
    router.replace('/(tabs)');
  };

  return (
    <AppScreen style={styles.root} padded>
      <AppCard style={styles.card}>
        <AppText variant="title">Procesando imagen...</AppText>
        {loading ? (
          <AppText muted style={styles.topGap}>
            Clasificando residuo...
          </AppText>
        ) : (
          <>
            <AppText muted style={styles.topGap}>
              Creemos que esto es:
            </AppText>
            <AppText variant="subtitle">{predictedWasteType?.label ?? 'No identificado'}</AppText>
            <AppText muted style={styles.topGap}>
              Confianza: {confidenceText} (umbral: {Math.round(threshold * 100)}%)
            </AppText>
            {isLowConfidence ? (
              <AppText muted style={styles.topGap}>
                La confianza es baja. Puedes corregir manualmente.
              </AppText>
            ) : null}
            <View style={styles.actions}>
              {isLowConfidence ? (
                <AppButton
                  label="Corregir manualmente"
                  variant="outline"
                  onPress={() => router.push('/recycle/manual')}
                />
              ) : null}
              <AppButton label="Aceptar" onPress={acceptPrediction} />
            </View>
          </>
        )}
      </AppCard>
    </AppScreen>
  );
}

export default ProcessingScreen;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: theme.components.maxContentWidth,
  },
  topGap: {
    marginTop: theme.spacing.sm,
  },
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
});
