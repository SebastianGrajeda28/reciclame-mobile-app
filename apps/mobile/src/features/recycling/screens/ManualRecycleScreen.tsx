import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';

import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import type { WasteType } from '@/src/features/recycling/types/recycling.types';
import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

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
    <AppScreen style={styles.root} padded>
      <AppCard style={styles.card}>
        <AppText variant="title">Seleccionar tipo de residuo</AppText>
        <ScrollView style={styles.list}>
          {grouped.map(([categoryLabel, items]) => (
            <View key={categoryLabel} style={styles.group}>
              <AppText variant="subtitle">{categoryLabel}</AppText>
              {items.map((item) => {
                const selected = selectedWasteType?.id === item.id;
                return (
                  <AppText
                    key={item.id}
                    style={[styles.item, selected ? styles.selectedItem : null]}
                    onPress={() => setSelectedWasteType(item)}
                  >
                    {selected ? '●' : '○'} {item.label}
                  </AppText>
                );
              })}
            </View>
          ))}
        </ScrollView>
        <AppButton label="Confirmar" disabled={!selectedWasteType} onPress={confirm} />
      </AppCard>
    </AppScreen>
  );
}

export default ManualRecycleScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  list: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  group: {
    marginBottom: theme.spacing.lg,
  },
  item: {
    marginTop: theme.spacing.sm,
  },
  selectedItem: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
});
