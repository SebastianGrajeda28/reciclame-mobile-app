import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { PermissionStatus, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

import { AppButton, AppCard, AppScreen, AppText, theme } from '@/src/ui';

function AuthGate({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <AppScreen style={styles.center} padded>
      <AppCard style={styles.gateCard}>
        <AppText variant="title">Iniciar sesion</AppText>
        <AppText muted style={styles.gap}>
          Este es un mock temporal. El login real se integrara con Firebase.
        </AppText>
        <AppButton label="Entrar (mock)" onPress={() => setIsLoggedIn(true)} />
      </AppCard>
    </AppScreen>
  );
}

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
        <AppText variant="title">Permisos obligatorios</AppText>
        <AppText muted style={styles.gap}>
          {statusText}
        </AppText>
        <View style={styles.rowGap}>
          <AppButton label="Conceder permisos" onPress={askPermissions} loading={loading} />
          <AppButton
            label="Abrir ajustes"
            variant="outline"
            onPress={() => Linking.openSettings()}
          />
        </View>
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
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  rowGap: {
    gap: theme.spacing.sm,
  },
});
