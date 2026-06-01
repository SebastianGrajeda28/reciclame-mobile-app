import { useEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { ProcessingLoadingView } from '@/src/features/recycling/components/ProcessingLoadingView';
import { classifyWaste, getConfidenceThreshold } from '@/src/features/recycling/services/classification';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteCategoryConfig } from '@/src/features/recycling/services/waste-category-config.mock';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';
import type { AppIconName } from '@/src/ui/components/AppIcon';
import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';

const CATEGORY_ICON: Record<WasteCategoryId, AppIconName> = {
  plastic_pet: 'bottle',
  paper_cardboard: 'briefcase',
  glass: 'flask',
  non_recoverable: 'delete',
  battery: 'battery',
  electronic_waste: 'laptop',
};

export function ProcessingScreen() {
  const navigation = useNavigation();
  const { state, setPrediction, clearPrediction, clearSelectedContainer } = useRecycleFlow();
  const { finalWasteType, selectedContainer } = useResolvedRecycleSelection();
  const loading = !state.finalWasteTypeId;
  const navigatingForward = useRef(false);

  const threshold = getConfidenceThreshold();
  const confidence = state.predictionConfidence ?? 0;

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      if (!navigatingForward.current) {
        clearPrediction();
      }
    });
  }, [navigation, clearPrediction]);

  useEffect(() => {
    if (state.finalWasteTypeId) {
      return;
    }
    let mounted = true;
    classifyWaste(state.capturedPhotoUri ?? 'manual-seed').then((result) => {
      if (!mounted) return;
      setPrediction(result.wasteTypeId, result.confidence);
    });
    return () => {
      mounted = false;
    };
  }, [setPrediction, state.capturedPhotoUri, state.finalWasteTypeId, state.selectedContainerId]);

  const containerMismatch = useMemo(() => {
    if (!state.selectedContainerId || !state.finalWasteTypeId) return false;
    const container = containers.find((c) => c.id === state.selectedContainerId);
    return container ? !container.acceptedWasteTypeIds.includes(state.finalWasteTypeId) : false;
  }, [state.selectedContainerId, state.finalWasteTypeId]);

  const categoryConfig = useMemo(() => {
    if (!finalWasteType) return null;
    return wasteCategoryConfig[finalWasteType.categoryId as WasteCategoryId] ?? null;
  }, [finalWasteType]);

  const categoryIcon = finalWasteType
    ? CATEGORY_ICON[finalWasteType.categoryId as WasteCategoryId]
    : null;

  return (
    <AppScreen style={styles.root}>
      <View style={styles.imageSection}>
        <View style={styles.imageWrapper}>
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
      </View>

      <View style={styles.content}>
        <AppText style={styles.eyebrow}>
          {loading ? 'Creemos que esto es...' : 'Creemos que esto es'}
        </AppText>

        {loading ? (
          <ProcessingLoadingView />
        ) : (
          <>
            <AppText style={[styles.wasteLabel, categoryConfig && { color: categoryConfig.color }]}>
              {finalWasteType?.categoryLabel ?? 'No identificado'}
            </AppText>

            {finalWasteType && (
              <View style={styles.infoCard}>
                <AppIcon name="info" size={theme.iconSizes.md} color={theme.colors.primary} />
                <AppText style={styles.infoText}>{finalWasteType.label}</AppText>
              </View>
            )}

            {finalWasteType && categoryConfig && categoryIcon && (
              <View style={styles.suggestionSection}>
                <AppText style={styles.suggestionLabel}>Contenedor sugerido:</AppText>
                <View style={[styles.suggestionChip, { borderColor: categoryConfig.color }]}>
                  <AppIcon name={categoryIcon} size={theme.iconSizes.sm} color={categoryConfig.color} />
                  <AppText style={[styles.suggestionChipText, { color: categoryConfig.color }]}>
                    {finalWasteType.categoryLabel}
                  </AppText>
                </View>
              </View>
            )}

            {containerMismatch && selectedContainer && (
              <View style={styles.mismatchCard}>
                <AppIcon name="alertCircle" size={theme.iconSizes.md} color={theme.colors.danger} />
                <AppText style={styles.mismatchText}>
                  {selectedContainer.name} no acepta {finalWasteType?.categoryLabel ?? 'este residuo'}. Elige otro punto de reciclaje.
                </AppText>
              </View>
            )}

            {confidence < threshold && !containerMismatch && (
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
              {containerMismatch ? (
                <AppButton
                  label="Buscar punto"
                  onPress={() => {
                    navigatingForward.current = true;
                    clearSelectedContainer();
                    router.replace('/recycle/map');
                  }}
                  style={[styles.actionBtn, styles.mismatchBtn]}
                />
              ) : (
                <AppButton
                  label="Aceptar"
                  onPress={() => {
                    const hasCompatibleContainer = !!state.selectedContainerId && !containerMismatch;
                    if (hasCompatibleContainer) {
                      router.push('/recycle/instructions');
                    } else {
                      router.push('/recycle/map');
                    }
                  }}
                  style={styles.actionBtn}
                />
              )}
            </View>
          </>
        )}
      </View>
    </AppScreen>
  );
}

export default ProcessingScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  imageSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  imageWrapper: {
    height: 220,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
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
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  eyebrow: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  wasteLabel: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  suggestionSection: {
    gap: theme.spacing.xs,
  },
  suggestionLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  suggestionChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  suggestionChipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
  mismatchCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.dangerBg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  mismatchText: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.danger,
    fontWeight: theme.fontWeights.semibold,
  },
  mismatchBtn: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  lowConfidenceNote: {
    fontSize: theme.fontSizes.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 'auto',
    paddingBottom: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
