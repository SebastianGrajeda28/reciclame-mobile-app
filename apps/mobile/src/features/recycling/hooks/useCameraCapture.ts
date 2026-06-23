import { useRef, useState } from 'react';
import { CameraView, FlashMode, useCameraPermissions } from 'expo-camera';

import { validateImage } from '@/src/features/recycling/services/image-validation';

export type CameraFlashMode = Exclude<FlashMode, 'torch'>;

export type CaptureResult =
  | { status: 'ok'; uri: string }
  | { status: 'invalid'; error: string }
  | { status: 'cancelled' };

export function useCameraCapture() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<CameraFlashMode>('off');
  const cameraRef = useRef<CameraView | null>(null);

  function toggleFlash() {
    setFlash((prev) => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  }

  async function capture(): Promise<CaptureResult> {
    if (!cameraRef.current) return { status: 'cancelled' };

    const picture = await cameraRef.current.takePictureAsync({
      quality: 0.6,
      base64: true,
    });
    if (!picture?.uri) return { status: 'cancelled' };

    const validation = validateImage({
      uri: picture.uri,
      width: picture.width,
      height: picture.height,
    });

    if (!validation.valid) {
      return { status: 'invalid', error: validation.message };
    }

    const uri = picture.base64 ? `data:image/jpeg;base64,${picture.base64}` : picture.uri;
    return { status: 'ok', uri };
  }

  return { permission, requestPermission, cameraRef, flash, toggleFlash, capture };
}
