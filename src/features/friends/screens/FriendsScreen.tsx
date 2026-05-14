import { StyleSheet } from 'react-native';

import { AppCard, AppScreen, AppText, theme } from '@/src/ui';

export function FriendsScreen() {
  return (
    <AppScreen style={styles.root} padded>
      <AppCard>
        <AppText variant="title">Amigos</AppText>
        <AppText muted style={styles.gap}>
          Esta seccion se implementara en la siguiente iteracion.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

export default FriendsScreen;

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
  },
  gap: {
    marginTop: theme.spacing.sm,
  },
});
