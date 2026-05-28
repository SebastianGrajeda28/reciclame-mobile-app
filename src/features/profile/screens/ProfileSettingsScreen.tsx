import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ProfileSectionLabel } from '@/src/features/profile/components/ProfileSectionLabel';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSettingsRow } from '@/src/features/profile/components/ProfileSettingsRow';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { AppButton, AppIcon, AppIconButton, AppSwitch, theme } from '@/src/ui';

export function ProfileSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const { signOut } = useAuth();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/yo');
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
    } catch {
      Alert.alert('No se pudo cerrar sesión', 'Intenta nuevamente en unos segundos.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <ProfileScreenContainer contentStyle={styles.content}>
      <ProfileSubpageHeader
        title="Configuración"
        titleVariant="h1"
        leading={
          <AppIconButton
            accessibilityLabel="Volver"
            variant="outline"
            onPress={handleBack}
            icon={
              <AppIcon
                name="arrowLeft"
                size={theme.iconSizes.md}
                color={theme.colors.textPrimary}
              />
            }
          />
        }
      />

      <View style={styles.section}>
        <ProfileSectionLabel>Cuenta</ProfileSectionLabel>
        <ProfileSettingsRow label="Editar datos" />
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel>Preferencias</ProfileSectionLabel>
        <ProfileSettingsRow
          label="Notificaciones"
          trailing={
            <AppSwitch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          }
        />
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel>Soporte</ProfileSectionLabel>
        <ProfileSettingsRow
          label="Términos y privacidad"
          icon={
            <AppIcon
              name="fileDocument"
              size={theme.iconSizes.md}
              color={theme.colors.textSecondary}
            />
          }
        />
      </View>

      <AppButton
        label="Cerrar sesión"
        variant="secondary"
        loading={signingOut}
        onPress={handleSignOut}
        style={styles.signOutButton}
      />
    </ProfileScreenContainer>
  );
}

export default ProfileSettingsScreen;

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.s4,
  },
  section: {
    gap: theme.spacing.s3,
  },
  signOutButton: {
    marginTop: theme.spacing.s2,
  },
});
