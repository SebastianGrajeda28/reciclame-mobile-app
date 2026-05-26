import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';

import { CameraFlashToggle } from '@/src/features/recycling/components/CameraFlashToggle';
import { CameraShutterButton } from '@/src/features/recycling/components/CameraShutterButton';
import { useCameraCapture } from '@/src/features/recycling/hooks/useCameraCapture';
import { useGalleryPicker } from '@/src/features/recycling/hooks/useGalleryPicker';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AppButton, theme } from '@/src/ui';

export function CameraScreen() {
  const { setCapturedPhotoUri } = useRecycleFlow();
  const { cameraRef, flash, toggleFlash, capture } = useCameraCapture();
  const { pickImage } = useGalleryPicker();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  async function handleCapture() {
    const uri = await capture();
if (uri) setPreviewUri(uri);
  }

  async function handleGallery() {
    const uri = await pickImage();
    if (uri) setPreviewUri(uri);
  }

  function handleConfirm() {
    if (!previewUri) return;
    setCapturedPhotoUri(previewUri);
    router.replace('/recycle/processing');
  }

  if (previewUri) {
    return (
      <View style={styles.root}>
        <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        <View style={styles.previewActions}>
          <AppButton
            variant="outline"
            label="Retomar"
            onPress={() => setPreviewUri(null)}
            style={styles.previewBtn}
          />
          <AppButton label="Usar foto" onPress={handleConfirm} style={styles.previewBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash} />

      <View style={styles.topBar}>
        <View style={styles.controlSpacer} />
        <Pressable style={styles.controlButton}>
          <Feather name="info" size={22} color="white" />
        </Pressable>
      </View>

      <View style={styles.bottomBar}>
        <CameraFlashToggle flash={flash} onToggle={toggleFlash} />

        <CameraShutterButton onPress={handleCapture} />

        <Pressable
          onPress={handleGallery}
          style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}
        >
          <Feather name="image" size={26} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

export default CameraScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: theme.spacing.s6,
    paddingBottom: theme.spacing.s4,
    paddingHorizontal: theme.spacing.s4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: theme.spacing.s4,
    paddingBottom: theme.spacing.s16 + theme.spacing.s4,
    paddingHorizontal: theme.spacing.s8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSpacer: {
    flex: 1,
  },
  controlPressed: {
    opacity: 0.6,
  },
  preview: {
    flex: 1,
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s4,
    paddingBottom: theme.spacing.s12,
    paddingTop: theme.spacing.s4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewBtn: {
    flex: 1,
  },
});
