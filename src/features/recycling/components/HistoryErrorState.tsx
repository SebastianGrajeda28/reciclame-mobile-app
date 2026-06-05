import { StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppText, theme } from '@/src/ui';

type Props = {
  onRetry: () => void;
};

export function HistoryErrorState({ onRetry }: Props) {
  return (
    <View style={styles.root}>
      <AppIcon name="alertCircle" size={48} color={theme.colors.danger} />
      <AppText style={styles.title}>No se pudo cargar el historial</AppText>
      <AppText style={styles.subtitle}>
        Verifica tu conexión e inténtalo de nuevo.
      </AppText>
      <AppButton label="Reintentar" onPress={onRetry} style={styles.btn} />
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
    minWidth: 140,
  },
});
