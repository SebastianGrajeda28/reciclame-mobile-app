import { useRef } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';

import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, AppScreen, AppText, theme } from '@/src/ui';

export function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const { setCapturedPhotoUri } = useRecycleFlow();

  const capture = async () => {
    if (!cameraRef.current) return;
    const picture = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    if (!picture?.uri) {
      Alert.alert('Error', 'No se pudo capturar la imagen.');
      return;
    }
    setCapturedPhotoUri(picture.uri);
    router.replace('/recycle/processing');
  };

  if (Platform.OS === 'web') {
    return (
      <AppScreen style={styles.center} padded>
        <AppText variant="title">Camara nativa</AppText>
        <AppText muted style={styles.webGap}>
          Esta pantalla se usa en iOS/Android.
        </AppText>
        <AppButton label="Continuar con mock" onPress={() => router.replace('/recycle/processing')} />
      </AppScreen>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.actions}>
        <AppButton label="Tomar foto" onPress={capture} />
      </View>
    </View>
  );
}

export default CameraScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  actions: {
    padding: theme.spacing.lg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webGap: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
});

