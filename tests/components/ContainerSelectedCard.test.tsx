import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ContainerSelectedCard } from '../../src/features/map/components/ContainerSelectedCard';
import type { RecyclingContainer } from '../../src/features/recycling/types/recycling.types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockContainer: RecyclingContainer = {
  id: 'container-1',
  name: 'Biblioteca Central',
  latitude: -12.0692,
  longitude: -77.0794,
  acceptedWasteTypeIds: ['paper_cardboard_bin', 'plastic_pet_bin'],
  availableBinTypeIds: ['paper_cardboard_container', 'plastic_container'],
  instructionsByWasteTypeId: {},
};

const userLocation = { latitude: -12.0695, longitude: -77.0793 };

describe('ContainerSelectedCard', () => {
  it('renders container name', () => {
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        onDismiss={jest.fn()}
        onRecycleHere={jest.fn()}
      />,
    );
    expect(screen.getByText(/Biblioteca Central/)).toBeTruthy();
  });

  it('renders distance in km', () => {
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        onDismiss={jest.fn()}
        onRecycleHere={jest.fn()}
      />,
    );
    expect(screen.getByText(/Distancia:/)).toBeTruthy();
  });

  it('renders "Reciclar aquí" button', () => {
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        onDismiss={jest.fn()}
        onRecycleHere={jest.fn()}
      />,
    );
    expect(screen.getByText('Reciclar aquí')).toBeTruthy();
  });

  it('calls onRecycleHere when button pressed', () => {
    const onRecycleHere = jest.fn();
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        onDismiss={jest.fn()}
        onRecycleHere={onRecycleHere}
      />,
    );
    fireEvent.press(screen.getByText('Reciclar aquí'));
    expect(onRecycleHere).toHaveBeenCalledTimes(1);
  });

  it('hides dismiss button when hideDismiss is true', () => {
    const onDismiss = jest.fn();
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        onDismiss={onDismiss}
        onRecycleHere={jest.fn()}
        hideDismiss
      />,
    );
    expect(screen.queryByTestId('dismiss-button')).toBeNull();
  });

  it('shows waste type labels when provided', () => {
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        finalWasteTypeLabel="Plásticos PET"
        resolvedBinTypeName="Contenedor de plásticos"
        onDismiss={jest.fn()}
        onRecycleHere={jest.fn()}
      />,
    );
    expect(screen.getByText(/Residuo detectado: Plásticos PET/)).toBeTruthy();
    expect(screen.getByText(/Contenedor correspondiente: Contenedor de plásticos/)).toBeTruthy();
  });

  it('does not render waste type section when not provided', () => {
    render(
      <ContainerSelectedCard
        container={mockContainer}
        userLocation={userLocation}
        onDismiss={jest.fn()}
        onRecycleHere={jest.fn()}
      />,
    );
    expect(screen.queryByText(/Residuo detectado:/)).toBeNull();
    expect(screen.queryByText(/Contenedor correspondiente:/)).toBeNull();
  });
});
