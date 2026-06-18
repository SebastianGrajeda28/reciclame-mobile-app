import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { useResolvedBinType } from '@/src/features/recycling/hooks/useResolvedBinType';
import { useAuth } from '@/src/hooks/useAuth';
import { useUserSettings } from '@/src/hooks/useUserSettings';
import { checkUnlockedAchievements } from '@/src/services/achievements';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';
import { createRecyclingLog } from '../api/recyclingLogs';
import { confirmSegregation } from '../api/recyclingLogs';

export function InstructionsScreen() {
  const navigation = useNavigation();
  const { state, clearSelectedContainer, markStep, markConfirmed } = useRecycleFlow();
  const { selectedContainer, finalWasteType } = useResolvedRecycleSelection();
  const { binType: resolvedBinType } = useResolvedBinType(
    state.finalWasteTypeId,
  );
  const { session } = useAuth();
  const { settings, updateSetting } = useUserSettings();
  const [submitting, setSubmitting] = useState(false);
  const [showAgain, setShowAgain] = useState(() => !(settings?.skipRecyclingInstructions ?? false));
  const autoSubmitted = useRef(false);
  const initialSkip = useRef(settings?.skipRecyclingInstructions ?? false);

  useEffect(() => {
    markStep('instructions');
  }, [markStep]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      clearSelectedContainer();
    });
  }, [navigation, clearSelectedContainer]);

  useEffect(() => {
    if (!selectedContainer || !finalWasteType) {
      router.replace('/(tabs)');
    }
  }, [selectedContainer, finalWasteType]);

  const notify = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!finalWasteType || !selectedContainer) {
      notify('Datos incompletos', 'Falta categoría o contenedor seleccionado.');
      return;
    }

    if (!session?.user) {
      router.replace('/recycle/success');
      return;
    }

    setSubmitting(true);
    try {
      const usedManual =
        state.predictedWasteTypeId !== undefined &&
        state.predictedWasteTypeId !== state.finalWasteTypeId;
      const log = await createRecyclingLog({
        userId: session.user.id,
        wasteTypeId: finalWasteType.id,
        binTypeId: '33333333-3333-3333-3333-000000000001',//esto es un parche, se deberia ver que datos se pone realmente en este log.
        recyclingPointId: selectedContainer.id,
        detectionType: usedManual ? 'manual' : 'auto',
        confidenceScore: state.predictionConfidence,
      });

      markConfirmed(streak.recordId);
      
      // Check if any achievement was unlocked
      const unlockedAchievement = await checkUnlockedAchievements(session.user.id);
      if (unlockedAchievement) {
        // Navigate to reward screen with the unlocked achievement
        router.replace({
          pathname: '/recycle/reward',
          params: { badgeId: unlockedAchievement.id },
        });
      } else {
        router.replace('/recycle/success');
      }
    } catch (err) {
      console.error('[InstructionsScreen] createRecyclingLog failed:', err);
      notify(
        'No se pudo registrar',
        err instanceof Error ? err.message : 'Intenta nuevamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [session, finalWasteType, selectedContainer, state, notify, resolvedBinType]);

  useEffect(() => {
    if (
      initialSkip.current &&
      !autoSubmitted.current &&
      selectedContainer &&
      finalWasteType
    ) {
      autoSubmitted.current = true;
      handleConfirm();
    }
  }, [selectedContainer, finalWasteType, handleConfirm]);

  const handleToggleShowAgain = () => {
    const next = !showAgain;
    setShowAgain(next);
    updateSetting({ skipRecyclingInstructions: !next });
  };

  if (!selectedContainer || !finalWasteType) return null;

  const steps = selectedContainer.instructionsByWasteTypeId[finalWasteType.id] ?? [
    'Deposita el residuo con cuidado en el contenedor seleccionado.',
  ];

  return (
    <AppScreen style={styles.root}>
      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <AppText style={styles.tagText}>
            {finalWasteType.categoryLabel} · {selectedContainer.name}
          </AppText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.stepList}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {steps.map((step, index) => {
          const imageFirst = index % 2 === 0;
          const textBlock = (
            <View style={styles.textBlock}>
              <View style={styles.stepNumber}>
                <AppText style={styles.stepNumberText}>{index + 1}</AppText>
              </View>
              <AppText style={styles.stepText}>{step}</AppText>
            </View>
          );
          const imageBlock = <View style={styles.stepImage} />;
          return (
            <View key={`${step}-${index}`} style={styles.stepRow}>
              {imageFirst ? imageBlock : textBlock}
              {imageFirst ? textBlock : imageBlock}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.checkRow} onPress={handleToggleShowAgain}>
          <View style={[styles.checkbox, showAgain && styles.checkboxChecked]}>
            {showAgain && <AppIcon name="check" size={theme.iconSizes.sm} color="#fff" />}
          </View>
          <AppText style={styles.checkLabel}>Seguir mostrando instrucciones</AppText>
        </Pressable>
        <AppButton
          label="Confirmar finalización"
          loading={submitting}
          disabled={submitting}
          onPress={handleConfirm}
        />
      </View>
    </AppScreen>
  );
}

export default InstructionsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tagRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  stepList: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    justifyContent: 'space-evenly',
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSizes.lg,
    lineHeight: theme.fontSizes.lg + theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  stepImage: {
    width: 150,
    height: 150,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
    flexShrink: 0,
  },
  footer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});
