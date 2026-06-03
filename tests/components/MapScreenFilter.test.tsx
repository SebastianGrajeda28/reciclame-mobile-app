import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { MapScreen } from '@/src/features/map/screens/MapScreen';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';
import { containers } from '@/src/features/recycling/services/containers.mock';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
}));

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/features/map/components/RecycleMap', () => ({
  RecycleMap: () => null,
}));

jest.mock('@/src/features/recycling/hooks/useRecycleFlow');

const mockClearSelectedContainer = jest.fn();
const libraryContainerId = containers[0].id;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  (useResolvedRecycleSelection as jest.Mock).mockReturnValue({
    selectedContainer: null,
    finalWasteType: null,
  });
});

describe('MapScreen filter chips', () => {
  it('renders all 7 filter chips', () => {
    (useRecycleFlow as jest.Mock).mockReturnValue({
      state: { selectedContainerId: undefined },
      setSelectedContainerId: jest.fn(),
      clearSelectedContainer: mockClearSelectedContainer,
    });
    const { getByText } = render(<MapScreen />);
    ['Todos', 'Plástico', 'Papel', 'Vidrio', 'No rec.', 'Pilas', 'RAEE'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('clears selected container when active filter excludes it', async () => {
    (useRecycleFlow as jest.Mock).mockReturnValue({
      state: { selectedContainerId: libraryContainerId },
      setSelectedContainerId: jest.fn(),
      clearSelectedContainer: mockClearSelectedContainer,
    });

    const { getByText } = render(<MapScreen />);

    // Switch to glass filter — container-1 has no glass waste type
    await act(async () => {
      fireEvent.press(getByText('Vidrio'));
    });

    expect(mockClearSelectedContainer).toHaveBeenCalled();
  });

  it('does not clear container when filter still includes it', async () => {
    (useRecycleFlow as jest.Mock).mockReturnValue({
      state: { selectedContainerId: libraryContainerId },
      setSelectedContainerId: jest.fn(),
      clearSelectedContainer: mockClearSelectedContainer,
    });

    const { getByText } = render(<MapScreen />);

    // Switch to plastic filter — container-1 accepts plastic
    await act(async () => {
      fireEvent.press(getByText('Plástico'));
    });

    expect(mockClearSelectedContainer).not.toHaveBeenCalled();
  });

  it('does not clear container when filter is all', async () => {
    (useRecycleFlow as jest.Mock).mockReturnValue({
      state: { selectedContainerId: libraryContainerId },
      setSelectedContainerId: jest.fn(),
      clearSelectedContainer: mockClearSelectedContainer,
    });

    const { getByText } = render(<MapScreen />);

    await act(async () => {
      fireEvent.press(getByText('Todos'));
    });

    expect(mockClearSelectedContainer).not.toHaveBeenCalled();
  });
});
