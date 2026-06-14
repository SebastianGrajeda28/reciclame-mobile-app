import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { CameraScreen } from '@/src/features/recycling/screens/CameraScreen';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';
import { useCancelCapture } from '@/src/features/recycling/hooks/useCancelCapture';

jest.mock('@expo/vector-icons/Feather', () => 'Feather');

jest.mock('@/src/ui', () => {
  const { theme } = jest.requireActual('@/src/ui/theme');
  return { AppText: 'AppText', theme };
});

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useNavigation: () => ({ addListener: jest.fn(() => jest.fn()) }),
}));

jest.mock('@/src/features/recycling/hooks/useRecycleFlow', () => ({
  useRecycleFlow: jest.fn(),
}));

jest.mock('@/src/features/recycling/hooks/useCancelCapture', () => ({
  useCancelCapture: jest.fn(),
}));

jest.mock('@/src/features/recycling/hooks/useCameraCapture', () => ({
  useCameraCapture: () => ({
    cameraRef: { current: null },
    flash: 'off',
    toggleFlash: jest.fn(),
    capture: jest.fn(),
  }),
}));

jest.mock('@/src/features/recycling/hooks/useGalleryPicker', () => ({
  useGalleryPicker: () => ({ pickImage: jest.fn() }),
}));

jest.mock('@/src/features/recycling/components/CameraFlashToggle', () => ({
  CameraFlashToggle: () => null,
}));

jest.mock('@/src/features/recycling/components/CameraShutterButton', () => ({
  CameraShutterButton: () => null,
}));

const mockConfirmCancel = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRecycleFlow as jest.Mock).mockReturnValue({
    state: {},
    setCapturedPhotoUri: jest.fn(),
    setPrediction: jest.fn(),
    setFinalWasteTypeId: jest.fn(),
    setSelectedContainerId: jest.fn(),
    clearSelectedContainer: jest.fn(),
    clearFinalWasteType: jest.fn(),
    clearPrediction: jest.fn(),
    resetFlow: jest.fn(),
  });
  (useCancelCapture as jest.Mock).mockReturnValue({ confirmCancel: mockConfirmCancel });
});

describe('CameraScreen', () => {
  it('Debería invocar confirmCancel al pulsar el botón de cancelar', () => {
    render(<CameraScreen />);

    fireEvent.press(screen.getByTestId('cancel-button'));

    expect(mockConfirmCancel).toHaveBeenCalledTimes(1);
  });
});
