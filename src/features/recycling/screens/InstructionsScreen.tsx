import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { useRecycleFlow, useResolvedRecycleSelection } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppIcon, AppScreen, AppText, theme } from '@/src/ui';

export function InstructionsScreen() {
  const navigation = useNavigation();
  const { selectedContainer, finalWasteType } = useResolvedRecycleSelection();
  const { clearSelectedContainer } = useRecycleFlow();
  const [showAgain, setShowAgain] = useState(true);

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

      <ScrollView contentContainerStyle={styles.stepList} showsVerticalScrollIndicator={false} style={styles.scroll}>
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
        <Pressable style={styles.checkRow} onPress={() => setShowAgain((v) => !v)}>
          <View style={[styles.checkbox, showAgain && styles.checkboxChecked]}>
            {showAgain && (
              <AppIcon name="check" size={theme.iconSizes.sm} color="#fff" />
            )}
          </View>
          <AppText style={styles.checkLabel}>Seguir mostrando instrucciones</AppText>
        </Pressable>
        <AppButton
          label="Confirmar finalización"
          onPress={() => router.replace('/recycle/success')}
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
