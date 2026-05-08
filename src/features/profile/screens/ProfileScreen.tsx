import { StyleSheet } from 'react-native';

import { AppCard, AppScreen, AppText, theme } from '@/src/ui';

export function ProfileScreen() {
  return (
    <AppScreen style={styles.root} padded>
      <AppCard>
        <AppText variant="title">Yo</AppText>
        <AppText muted style={styles.gap}>
          Perfil del usuario pendiente de implementacion.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
  },
  gap: {
    marginTop: theme.spacing.sm,
  },
});

