import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import Feather from '@expo/vector-icons/Feather';
import { router, useNavigation } from 'expo-router';

import { routes } from '@/src/constants/routes';
import { BadCaptureModal } from '@/src/features/recycling/components/BadCaptureModal';
import { CameraFlashToggle } from '@/src/features/recycling/components/CameraFlashToggle';
import { CameraShutterButton } from '@/src/features/recycling/components/CameraShutterButton';
import { useCameraCapture } from '@/src/features/recycling/hooks/useCameraCapture';
import { useCancelCapture } from '@/src/features/recycling/hooks/useCancelCapture';
import { useGalleryPicker } from '@/src/features/recycling/hooks/useGalleryPicker';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import type { ImageQualityReason } from '@/src/features/recycling/services/image-validation';
import { MAX_BAD_CAPTURE_RETRIES } from '@/src/features/recycling/services/image-validation/config';
import { analyzeImageQuality } from '@/src/features/recycling/services/image-validation/quality';
import { useAuth } from '@/src/hooks/useAuth';
import { AppText, theme } from '@/src/ui';

export function CameraScreen() {
  const navigation = useNavigation();
  const { setCapturedPhotoUri, resetFlow, startNewFlow, markStep } = useRecycleFlow();
  const { session } = useAuth();

  useEffect(() => {
    console.log('[NAV] Estoy en CameraScreen');
    startNewFlow(session?.user.id ?? null);
    markStep('camera');
  }, []);

  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      resetFlow('abandoned');
    });
  }, [navigation, resetFlow]);
  const { cameraRef, flash, toggleFlash, capture } = useCameraCapture();
  const { confirmCancel } = useCancelCapture();
  const { pickImage } = useGalleryPicker();

  // Reintentos de #265: cuenta capturas/galería mal tomadas. A la 3ra sale al menú.
  const badAttemptsRef = useRef(0);
  const [badReason, setBadReason] = useState<ImageQualityReason | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function exitToMenu() {
    setBadReason(null);
    router.replace(routes.home);
  }

  // Chequeo de calidad (#215) compartido por cámara y galería.
  async function processAcceptedImage(uri: string) {
    setAnalyzing(true);
    try {
      const quality = await analyzeImageQuality(uri);
      if (quality.ok) {
        badAttemptsRef.current = 0;
        setCapturedPhotoUri(uri);
        router.push('/recycle/processing');
        return;
      }
      badAttemptsRef.current += 1;
      if (badAttemptsRef.current >= MAX_BAD_CAPTURE_RETRIES) {
        exitToMenu();
      } else {
        setBadReason(quality.reason);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCapture() {
    if (analyzing) return;
    const result = await capture();
    if (result.status === 'ok') {
      await processAcceptedImage(result.uri);
    } else if (result.status === 'invalid') {
      Alert.alert('Imagen no válida', result.error, [{ text: 'Entendido' }]);
    }
  }

  async function handleGallery() {
    if (analyzing) return;
    const result = await pickImage();
    if (result.status === 'ok') {
      await processAcceptedImage(result.uri);
    } else if (result.status === 'invalid') {
      Alert.alert('Imagen no válida', result.error, [{ text: 'Entendido' }]);
    }
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash} />

      <View style={styles.topBar}>
        <Pressable
          testID="cancel-button"
          style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}
          onPress={confirmCancel}
        >
          <Feather name="x" size={22} color="white" />
        </Pressable>
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

      <View style={styles.modeTabs}>
        <Pressable style={[styles.modeTab, styles.modeTabActive]}>
          <Feather name="camera" size={14} color={theme.colors.primary} />
          <AppText style={styles.modeTabLabelActive}>Escanear</AppText>
        </Pressable>
        <Pressable style={styles.modeTab} onPress={() => router.push('/recycle/manual')}>
          <Feather name="list" size={14} color="rgba(255,255,255,0.6)" />
          <AppText style={styles.modeTabLabel}>Manual</AppText>
        </Pressable>
      </View>

      <BadCaptureModal
        reason={badReason}
        onRetry={() => setBadReason(null)}
        onExit={exitToMenu}
      />
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
    justifyContent: 'space-between',
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
  controlPressed: {
    opacity: 0.6,
  },
  modeTabs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingBottom: theme.spacing.s4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  modeTabLabel: {
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  modeTabLabelActive: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
});
