import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

export function ManualRecycleScreen() {
  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState<string | undefined>();
  const { setFinalWasteTypeId } = useRecycleFlow();

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
    if (!selectedWasteTypeId) return;
    setFinalWasteTypeId(selectedWasteTypeId);
    router.replace('/recycle/map');
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
                const selected = selectedWasteTypeId === item.id;
                return (
                  <AppText
                    key={item.id}
                    style={[styles.item, selected ? styles.selectedItem : null]}
                    onPress={() => setSelectedWasteTypeId(item.id)}
                  >
                    {selected ? '●' : '○'} {item.label}
                  </AppText>
                );
              })}
            </View>
          ))}
        </ScrollView>
        <AppButton label="Confirmar" disabled={!selectedWasteTypeId} onPress={confirm} />
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
