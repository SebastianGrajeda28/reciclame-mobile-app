import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSectionLabel } from '@/src/features/profile/components/ProfileSectionLabel';
import { ProfileSettingsRow } from '@/src/features/profile/components/ProfileSettingsRow';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { useUserSettings } from '@/src/hooks/useUserSettings';
import { forceRefreshAllCaches } from '@/src/services/sync/syncService';
import { AppButton, AppIcon, AppIconButton, AppSwitch, theme } from '@/src/ui';

export function ProfileSettingsScreen() {
  const [signingOut, setSigningOut] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { signOut } = useAuth();
  const { settings, updateSetting } = useUserSettings();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/yo');
  }

  async function handleForceSync() {
    try {
      setSyncing(true);
      await forceRefreshAllCaches();
      Alert.alert('Listo', 'Datos actualizados correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar. Intenta de nuevo.');
    } finally {
      setSyncing(false);
    }
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
            <AppSwitch
              value={settings?.notificationsEnabled ?? true}
              onValueChange={(v) => updateSetting({ notificationsEnabled: v })}
            />
          }
        />
        <ProfileSettingsRow
          label="Omitir instrucciones de reciclaje"
          icon={
            <AppIcon
              name="eyeOff"
              size={theme.iconSizes.md}
              color={theme.colors.textSecondary}
            />
          }
          trailing={
            <AppSwitch
              value={settings?.skipRecyclingInstructions ?? false}
              onValueChange={(v) => updateSetting({ skipRecyclingInstructions: v })}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel>Datos</ProfileSectionLabel>
        <AppButton
          label="Actualizar datos"
          variant="outline"
          loading={syncing}
          onPress={handleForceSync}
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