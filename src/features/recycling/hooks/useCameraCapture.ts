'use client';

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
    const picture = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    return picture?.uri ?? null;
  }

  return { permission, requestPermission, cameraRef, flash, toggleFlash, capture };
}
