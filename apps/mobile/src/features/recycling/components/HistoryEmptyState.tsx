import { StyleSheet, View } from 'react-native';
import { AppIcon, AppText, theme } from '@/src/ui';

export function HistoryEmptyState() {
  return (
    <View style={styles.root}>
      <AppIcon name="recycle" size={48} color={theme.colors.border} />
      <AppText style={styles.title}>Aún no tienes registros</AppText>
      <AppText style={styles.subtitle}>
        Cuando recicles tu primer ítem aparecerá aquí.
      </AppText>
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
});
