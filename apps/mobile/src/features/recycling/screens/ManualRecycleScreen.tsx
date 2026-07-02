import { router, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import type { WasteType } from '@/src/features/recycling/types/recycling.types';
import { AppButton, AppScreen, AppText, theme } from '@/src/ui';

export function ManualRecycleScreen() {
  const navigation = useNavigation();
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType | undefined>();
  const { setFinalWasteType, clearFinalWasteType, markStep } = useRecycleFlow();

  useEffect(() => {
    markStep('manual');
  }, [markStep]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      clearFinalWasteType();
    });
  }, [navigation, clearFinalWasteType]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, typeof wasteTypes>();
    for (const item of wasteTypes) {
      const group = byCategory.get(item.categoryLabel) ?? [];
      group.push(item);
      byCategory.set(item.categoryLabel, group);
    }
    return Array.from(byCategory.entries());
  }, []);

  const confirm = () => {
    if (!selectedWasteType) return;
    setFinalWasteType(selectedWasteType);
    router.push('/recycle/map');
  };

  return (
    <AppScreen style={styles.root} padded insetTop={false}>
      <View style={styles.header}>
        <AppText variant="h3">Seleccionar tipo de residuo</AppText>
        <AppText variant="bodyS" muted>
          Elige el material que vas a depositar.
        </AppText>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {grouped.map(([categoryLabel, items]) => (
          <View key={categoryLabel} style={styles.group}>
            <AppText variant="overline" style={styles.groupTitle}>
              {categoryLabel}
            </AppText>
            <View style={styles.groupList}>
              {items.map((item) => {
                const selected = selectedWasteType?.id === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedWasteType(item)}
                    style={({ pressed }) => [
                      styles.item,
                      selected ? styles.selectedItem : null,
                      pressed ? styles.pressedItem : null,
                    ]}
                  >
                    <AppText style={[styles.itemLabel, selected ? styles.selectedItemLabel : null]}>
                      {item.label}
                    </AppText>
                    <View style={[styles.radio, selected ? styles.radioSelected : null]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label="Confirmar"
          size="lg"
          disabled={!selectedWasteType}
          onPress={confirm}
          style={styles.confirmButton}
        />
      </View>
    </AppScreen>
  );
}

export default ManualRecycleScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    gap: theme.spacing.s1,
    paddingTop: theme.spacing.s4,
    paddingBottom: theme.spacing.s4,
  },
  list: {
    flex: 1,
    marginHorizontal: -theme.components.screenPaddingHorizontal,
  },
  listContent: {
    paddingHorizontal: theme.components.screenPaddingHorizontal,
    paddingBottom: theme.spacing.s4,
  },
  group: {
    marginBottom: theme.spacing.s3,
  },
  groupTitle: {
    marginBottom: theme.spacing.s2,
    color: theme.colors.textSecondary,
  },
  groupList: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  item: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  pressedItem: {
    opacity: 0.82,
  },
  selectedItem: {
    backgroundColor: theme.colors.primaryLight,
    borderBottomColor: theme.colors.primarySubtle,
  },
  itemLabel: {
    flex: 1,
    color: theme.colors.secondary,
    fontWeight: theme.fontWeights.medium,
  },
  selectedItemLabel: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  footer: {
    paddingTop: theme.spacing.s3,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  confirmButton: {
    borderRadius: theme.radius.full,
  },
});
