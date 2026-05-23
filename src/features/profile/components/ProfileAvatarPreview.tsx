import { StyleSheet, View } from 'react-native';

import { AppCard, AppText, theme } from '@/src/ui';

export function ProfileAvatarPreview() {
  return (
    <AppCard style={styles.sectionCard}>
      <View style={styles.previewShell}>
        <View style={styles.previewAvatar} />
        <View style={styles.previewText}>
          <AppText variant="bodyS">
            Placeholder navegable: aqui ira la previsualizacion editable del avatar conectado al
            perfil real.
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: theme.spacing.s4,
  },
  previewShell: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.s4,
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  previewAvatar: {
    width: 160,
    height: 220,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.disabled,
  },
  previewText: {
    width: '100%',
  },
});
