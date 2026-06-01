import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MapScreen } from '../../src/features/map/screens/MapScreen';
import { RecycleFlowProvider } from '../../src/features/recycling/hooks/useRecycleFlow';

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: -12.0695, longitude: -77.0793 },
  }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../src/features/map/components/RecycleMap', () => ({
  RecycleMap: () => null,
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function renderWithProvider(ui: React.ReactElement) {
  return render(<RecycleFlowProvider>{ui}</RecycleFlowProvider>);
}

describe('MapScreen', () => {
  it('renders the title "Reciclaje"', () => {
    renderWithProvider(<MapScreen />);
    expect(screen.getByText('Reciclaje')).toBeTruthy();
  });

  it('renders all 7 filter chips', () => {
    renderWithProvider(<MapScreen />);
    const labels = ['Todos', 'Plástico', 'Papel', 'Vidrio', 'No rec.', 'Pilas', 'RAEE'];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('renders CTA section when no container selected', () => {
    renderWithProvider(<MapScreen />);
    expect(screen.getByText('Escanear tu residuo')).toBeTruthy();
    expect(screen.getByText('¿No sabes qué contenedor?')).toBeTruthy();
  });

  it('navigates to camera when CTA button pressed', () => {
    const { router } = require('expo-router');
    renderWithProvider(<MapScreen />);
    fireEvent.press(screen.getByText('Escanear tu residuo'));
    expect(router.push).toHaveBeenCalledWith('/recycle/camera');
  });

  it('renders filter section label', () => {
    renderWithProvider(<MapScreen />);
    expect(screen.getByText('Filtrar por contenedores')).toBeTruthy();
  });
});
