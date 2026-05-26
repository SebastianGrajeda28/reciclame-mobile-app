'use client';

import { Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PermissionResponse } from 'expo-camera';

import { AppButton, AppScreen, AppText, theme } from '@/src/ui';

type Props = Readonly<{
  permission: PermissionResponse | null;
  onRequest: () => void;
  children: React.ReactNode;
}>;

export function CameraPermissionGate({ permission, onRequest, children }: Props) {
  if (permission?.granted) return <>{children}</>;

  const isDenied = permission?.status === 'denied';

  return (
    <AppScreen padded style={styles.screen}>
      <Ionicons name="camera-outline" size={48} color={theme.colors.textSecondary} />
      <AppText variant="title" style={styles.title}>
        Acceso a la cámara
      </AppText>
      <AppText muted style={styles.body}>
        {isDenied
          ? 'El acceso fue denegado. Habilítalo desde Configuración para escanear residuos.'
          : 'Necesitamos acceso a tu cámara para identificar el tipo de residuo.'}
      </AppText>
      {isDenied ? (
        <AppButton label="Abrir Configuración" onPress={() => Linking.openSettings()} />
      ) : (
        <AppButton label="Permitir acceso" onPress={onRequest} />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s4,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
