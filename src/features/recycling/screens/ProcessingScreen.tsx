import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { classifyWaste, getConfidenceThreshold } from '@/src/features/recycling/services/classification';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { wasteCategoryConfig } from '@/src/features/recycling/services/waste-category-config.mock';
import { AppButton, AppScreen, AppText, theme } from '@/src/ui';
import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

export function ProcessingScreen() {
  const { state, setPrediction } = useRecycleFlow();
  const { finalWasteType } = useResolvedRecycleSelection();
  const [loading, setLoading] = useState(true);

  const threshold = getConfidenceThreshold();
  const confidence = state.predictionConfidence ?? 0;

  useEffect(() => {
    let mounted = true;
    classifyWaste(state.capturedPhotoUri ?? 'manual-seed').then((result) => {
      if (!mounted) return;
      setPrediction(result.wasteTypeId, result.confidence);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [setPrediction, state.capturedPhotoUri]);

  const categoryConfig = useMemo(() => {
    if (!finalWasteType) return null;
    return wasteCategoryConfig[finalWasteType.categoryId as WasteCategoryId] ?? null;
  }, [finalWasteType]);

  return (
    <AppScreen>
      <View style={styles.imageContainer}>
        {state.capturedPhotoUri ? (
          <Image source={{ uri: state.capturedPhotoUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {!loading && confidence >= threshold && (
          <View style={styles.confidenceBadge}>
            <AppText style={styles.confidenceText}>
              ✓ {Math.round(confidence * 100)}% confianza
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <AppText style={styles.eyebrow}>Creemos que esto es</AppText>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <AppText muted style={styles.loadingLabel}>Analizando con IA...</AppText>
          </View>
        ) : (
          <>
            <AppText style={[styles.wasteLabel, categoryConfig && { color: categoryConfig.color }]}>
              {finalWasteType?.categoryLabel ?? 'No identificado'}
            </AppText>

            {finalWasteType && (
              <View style={styles.infoCard}>
                <AppText style={styles.infoText}>{finalWasteType.label}</AppText>
              </View>
            )}

            {confidence < threshold && (
              <AppText muted style={styles.lowConfidenceNote}>
                Confianza baja — puedes corregir manualmente.
              </AppText>
            )}

            <View style={styles.actions}>
              <AppButton
                variant="outline"
                label="Editar"
                onPress={() => router.push('/recycle/manual')}
                style={styles.actionBtn}
              />
              <AppButton
                label="Aceptar"
                onPress={() => router.replace('/recycle/map')}
                style={styles.actionBtn}
              />
            </View>
          </>
        )}
      </View>
    </AppScreen>
  );
}

export default ProcessingScreen;

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    backgroundColor: theme.colors.border,
  },
  image: {
    flex: 1,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.border,
  },
  confidenceBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
  },
  confidenceText: {
    color: '#fff',
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  eyebrow: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  loadingRow: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  loadingLabel: {
    fontSize: theme.fontSizes.sm,
  },
  wasteLabel: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
  },
  infoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  lowConfidenceNote: {
    fontSize: theme.fontSizes.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
