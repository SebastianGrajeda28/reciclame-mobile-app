import { StyleSheet, View } from 'react-native';

import { AppCard, AppText, theme } from '@/src/ui';

type Props = {
  markers: { id: string; title: string }[];
  onMarkerPress: (id: string) => void;
};

export function RecycleMap({ markers, onMarkerPress }: Props) {
  return (
    <View style={styles.container}>
      <AppCard>
        <AppText variant="subtitle">Mapa nativo disponible en iOS/Android</AppText>
        <AppText muted style={styles.gap}>
          En web se muestra esta lista para debug.
        </AppText>
        {markers.map((item, index) => (
          <AppText key={item.id} style={styles.item} onPress={() => onMarkerPress(item.id)}>
            {index + 1}. {item.title}
          </AppText>
        ))}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  gap: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  item: {
    marginBottom: theme.spacing.sm,
    textDecorationLine: 'underline',
  },
});

