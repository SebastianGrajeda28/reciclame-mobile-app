import { StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';

type Props = {
  onClear: () => void;
};

export function HistoryFilteredEmptyState({ onClear }: Props) {
  return (
    <View style={styles.root}>
      <AppIcon name="filter" size={48} color={theme.colors.borderStrong} />
      <AppText style={styles.title}>No hay registros con estos filtros</AppText>
      <AppText style={styles.subtitle}>Prueba con otra categoría o rango.</AppText>
      <AppButton
        label="Quitar filtros"
        variant="outline"
        onPress={onClear}
        style={styles.btn}
        accessibilityLabel="Quitar todos los filtros"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  btn: {
    marginTop: theme.spacing.sm,
    minWidth: 160,
  },
});
