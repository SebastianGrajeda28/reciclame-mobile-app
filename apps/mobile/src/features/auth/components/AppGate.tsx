import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { PermissionStatus, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

import {
  AppButton,
  AppCard,
  AppCardDescription,
  AppCardFooter,
  AppCardHeaderText,
  AppCardTitle,
  AppScreen,
  theme,
} from '@/src/ui';
import { LoginScreen } from '@/src/features/auth/screens/LoginScreen';
import { useAuth } from '@/src/hooks/useAuth';
import { registerPushToken } from '@/src/services/pushNotifications';

function AuthGate({ children }: PropsWithChildren) {
  const { session, loading, offlineMode, setOfflineMode } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      registerPushToken(session.user.id).catch(() => {});
    }
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={authGateStyles.splash}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!session && !offlineMode) {
    return <LoginScreen onContinueOffline={() => setOfflineMode(true)} />;
  }

  return <>{children}</>;
}

const authGateStyles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
});

function PermissionGate({ children }: PropsWithChildren) {
  const [cameraPermission, requestCameraPermission, getCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission, getLocationPermission] =
    Location.useForegroundPermissions();
  const [loading, setLoading] = useState(false);
  const [grantedOverride, setGrantedOverride] = useState(false);

  const cameraGranted = cameraPermission?.status === PermissionStatus.GRANTED;
  const locationGranted = locationPermission?.status === Location.PermissionStatus.GRANTED;
  const permissionsGranted = grantedOverride || (cameraGranted && locationGranted);

  useEffect(() => {
    if (cameraGranted && locationGranted) {
      setGrantedOverride(true);
    }
  }, [cameraGranted, locationGranted]);

  const statusText = useMemo(() => {
    if (permissionsGranted) {
      return 'Permisos listos';
    }
    return 'Debes conceder permisos de camara y ubicacion para usar la app.';
  }, [permissionsGranted]);

  const askPermissions = async () => {
    setLoading(true);
    try {
      const camera = await requestCameraPermission();
      const location = await requestLocationPermission();
      const [freshCamera, freshLocation] = await Promise.all([
        getCameraPermission(),
        getLocationPermission(),
      ]);

      const cameraStatus = freshCamera.status ?? camera.status;
      const locationStatus = freshLocation.status ?? location.status;
      const bothGranted =
        cameraStatus === PermissionStatus.GRANTED &&
        locationStatus === Location.PermissionStatus.GRANTED;

      if (bothGranted) {
        setGrantedOverride(true);
        return;
      }

      if (Platform.OS === 'web') {
        Alert.alert(
          'Permisos pendientes',
          `Camara: ${cameraStatus}. Ubicacion: ${locationStatus}. Si ya aceptaste, recarga la pagina una vez.`,
        );
      } else {
        Alert.alert('Permisos requeridos', 'Sin estos permisos no se puede usar la app.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (permissionsGranted) {
    return <>{children}</>;
  }

  return (
    <AppScreen style={styles.center} padded>
      <AppCard style={styles.gateCard}>
        <AppCardHeaderText>
          <AppCardTitle variant="title">Permisos obligatorios</AppCardTitle>
          <AppCardDescription style={styles.gap}>{statusText}</AppCardDescription>
        </AppCardHeaderText>
        <AppCardFooter style={styles.rowGap}>
          <AppButton label="Conceder permisos" onPress={askPermissions} loading={loading} />
          <AppButton
            label="Abrir ajustes"
            variant="outline"
            onPress={() => Linking.openSettings()}
          />
        </AppCardFooter>
      </AppCard>
    </AppScreen>
  );
}

export function AppGate({ children }: PropsWithChildren) {
  return (
    <AuthGate>
      <PermissionGate>{children}</PermissionGate>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateCard: {
    width: '100%',
    maxWidth: theme.components.maxContentWidth,
  },
  gap: {
    marginTop: theme.spacing.s2,
    marginBottom: theme.spacing.s4,
  },
  rowGap: {
    gap: theme.spacing.s2,
  },
});
