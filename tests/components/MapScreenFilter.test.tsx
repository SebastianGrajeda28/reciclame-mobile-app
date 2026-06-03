import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { MapScreen } from '@/src/features/map/screens/MapScreen';
import {
  useRecycleFlow,
  useResolvedRecycleSelection,
} from '@/src/features/recycling/hooks/useRecycleFlow';

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: -12.0695, longitude: -77.0793 },
  }),
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
    // container-1 accepts paper_cardboard_bin + plastic_pet_bin only
    (useRecycleFlow as jest.Mock).mockReturnValue({
      state: { selectedContainerId: 'container-1' },
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
    // container-1 accepts plastic_pet_bin
    (useRecycleFlow as jest.Mock).mockReturnValue({
      state: { selectedContainerId: 'container-1' },
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
      state: { selectedContainerId: 'container-1' },
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
