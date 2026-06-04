import { useRef, useState } from 'react';
import { CameraView, FlashMode, useCameraPermissions } from 'expo-camera';

export type CameraFlashMode = Exclude<FlashMode, 'torch'>;

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

  async function capture(): Promise<string | null> {
    if (!cameraRef.current) return null;
    const picture = await cameraRef.current.takePictureAsync({
      quality: 0.6,
      base64: true,
    });
    if (!picture) return null;
    if (picture.base64) {
      return `data:image/jpeg;base64,${picture.base64}`;
    }
    return picture.uri;
  }

  return { permission, requestPermission, cameraRef, flash, toggleFlash, capture };
}
