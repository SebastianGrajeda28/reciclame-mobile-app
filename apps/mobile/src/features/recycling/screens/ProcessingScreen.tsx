import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FunFactCard } from '@/src/features/recycling/components/FunFactCard';
import { ProcessingLoadingView } from '@/src/features/recycling/components/ProcessingLoadingView';
import { useRotatingFunFact } from '@/src/features/recycling/hooks/useFunFact';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { useResolvedBinType } from '@/src/features/recycling/hooks/useResolvedBinType';
import { binTypeConfig } from '@/src/features/recycling/services/bin-type-config.mock';
import {
  classifyWaste,
  getConfidenceThreshold,
} from '@/src/features/recycling/services/classification';
import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteCategoryConfig } from '@/src/features/recycling/services/waste-category-config.mock';
import type { WasteCategoryId } from '@/src/features/recycling/types/recycling.types';
import { useStudentLocation } from '@/src/hooks/useStudentLocation';
import { useUserSettings } from '@/src/hooks/useUserSettings';
import { findClosestRecyclingPoint } from '@/src/services/closestRecyclingPoint';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';

export function ProcessingScreen() {
  const navigation = useNavigation();
  const { state, setPrediction, setUnidentifiedPrediction, clearPrediction, clearSelectedContainer, markStep, setSelectedContainerId } = useRecycleFlow();
  const { finalWasteType, selectedContainer } = useResolvedRecycleSelection();
  const { fact } = useRotatingFunFact();
  const { binType: resolvedBinType } = useResolvedBinType(state.finalWasteTypeId);
  // `classifying` cubre el tiempo que tarda el modelo. Al terminar puede haber:
  //  - finalWasteType definido  → confianza ≥ umbral (identificado)
  //  - finalWasteType ausente   → confianza < umbral o error (no identificado)
  const [classifying, setClassifying] = useState(!state.finalWasteTypeId);
  const navigatingForward = useRef(false);
  const studentLocation = useStudentLocation();
  const { settings } = useUserSettings();

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
    markStep('processing');
  }, [markStep]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    if (state.finalWasteTypeId) {
      setClassifying(false);
      return;
    }
    startedRef.current = true;
    let mounted = true;
    classifyWaste(state.capturedPhotoUri ?? 'manual-seed')
      .then((result) => {
        if (!mounted) return;
        if (result.confidence >= threshold) {
          setPrediction(result.wasteTypeId, result.confidence);

          // Auto-select closest recycling point if location verification is enabled
          if (settings?.locationVerificationEnabled) {
            const closestContainer = findClosestRecyclingPoint(
              studentLocation.latitude,
              studentLocation.longitude,
              result.wasteTypeId,
            );
            if (closestContainer) {
              setSelectedContainerId(closestContainer.id);
            }
          }
        } else {
          // Confianza insuficiente → estado "No identificado": no comprometemos categoría.
          setUnidentifiedPrediction(result.wasteTypeId, result.confidence);
        }
      })
      .catch(() => {
        // Si el modelo falla, lo tratamos como no identificado (reintentar/corregir).
      })
      .finally(() => {
        if (mounted) setClassifying(false);
      });
    return () => {
      mounted = false;
    };
  }, [setPrediction, setUnidentifiedPrediction, threshold, state.capturedPhotoUri, state.finalWasteTypeId, settings?.locationVerificationEnabled, studentLocation, setSelectedContainerId]);

  const containerMismatch = useMemo(() => {
    if (!state.selectedContainerId || !resolvedBinType) return false;
    const container = containers.find((c) => c.id === state.selectedContainerId);
    return container ? !container.availableBinTypeIds.includes(resolvedBinType.id) : false;
  }, [resolvedBinType, state.selectedContainerId]);

  const categoryConfig = useMemo(() => {
    if (!finalWasteType) return null;
    return wasteCategoryConfig[finalWasteType.categoryId as WasteCategoryId] ?? null;
  }, [finalWasteType]);

  const binTypeUiConfig = resolvedBinType ? binTypeConfig[resolvedBinType.id] : null;

  return (
    <AppScreen style={styles.root}>
      <View style={styles.imageSection}>
        <View style={styles.imageWrapper}>
          {state.capturedPhotoUri ? (
            <Image source={{ uri: state.capturedPhotoUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          {!classifying && confidence >= threshold && (
            <View style={styles.confidenceBadge}>
              <AppText style={styles.confidenceText}>
                ✓ {Math.round(confidence * 100)}% confianza
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {classifying ? (
          <>
            <AppText style={styles.eyebrow}>Creemos que esto es...</AppText>
            <ProcessingLoadingView slot={fact ? <FunFactCard text={fact.text} /> : null} />
          </>
        ) : finalWasteType ? (
          <>
            <AppText style={styles.eyebrow}>Creemos que esto es</AppText>
            <AppText style={[styles.wasteLabel, categoryConfig && { color: categoryConfig.color }]}>
              {finalWasteType.label}
            </AppText>

            {resolvedBinType && binTypeUiConfig && (
              <View style={styles.suggestionSection}>
                <AppText style={styles.suggestionLabel}>Contenedor correspondiente:</AppText>
                <View style={[styles.suggestionChip, { borderColor: binTypeUiConfig.color }]}>
                  <AppIcon
                    name={binTypeUiConfig.icon}
                    size={theme.iconSizes.sm}
                    color={binTypeUiConfig.color}
                  />
                  <AppText style={[styles.suggestionChipText, { color: binTypeUiConfig.color }]}>
                    {resolvedBinType.name}
                  </AppText>
                </View>
              </View>
            )}

            {containerMismatch && selectedContainer && (
              <View style={styles.mismatchCard}>
                <AppIcon name="alertCircle" size={theme.iconSizes.md} color={theme.colors.danger} />
                <AppText style={styles.mismatchText}>
                  {selectedContainer.name} no cuenta con{' '}
                  {resolvedBinType?.name ?? 'el contenedor correspondiente'}. Elige otro punto de
                  reciclaje.
                </AppText>
              </View>
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
                    const hasCompatibleContainer =
                      !!state.selectedContainerId && !containerMismatch;
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
        ) : (
          <>
            <AppText style={styles.eyebrow}>Resultado</AppText>
            <View style={styles.unidentifiedHeader}>
              <AppIcon name="alertCircle" size={theme.iconSizes.md} color={theme.colors.textSecondary} />
              <AppText style={styles.unidentifiedTitle}>No identificado</AppText>
            </View>
            <AppText muted style={styles.unidentifiedNote}>
              No pudimos identificar el residuo con seguridad. Vuelve a tomar la foto con mejor
              enfoque e iluminación, o indícanos tú de qué se trata.
            </AppText>

            <View style={styles.actions}>
              <AppButton
                variant="outline"
                label="Corregir"
                onPress={() => router.push('/recycle/manual')}
                style={styles.actionBtn}
              />
              <AppButton
                label="Reintentar foto"
                onPress={() => router.back()}
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
  unidentifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  unidentifiedTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  unidentifiedNote: {
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.xs,
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
