import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ProcessingLoadingView } from '../../src/features/recycling/components/ProcessingLoadingView';

jest.mock('@/src/ui', () => {
  const { theme } = jest.requireActual('@/src/ui/theme');
  const { Text: RNText } = require('react-native');
  return { AppText: RNText, theme };
});

describe('ProcessingLoadingView', () => {
  it('Debería mostrar el indicador de análisis durante la carga', () => {
    render(<ProcessingLoadingView />);
    expect(screen.getByText('Analizando con IA...')).toBeTruthy();
  });

  it('Debería mostrar una etiqueta personalizada cuando se provee', () => {
    render(<ProcessingLoadingView label="Procesando imagen..." />);
    expect(screen.getByText('Procesando imagen...')).toBeTruthy();
  });

  it('Debería renderizar el contenido del slot cuando se provee', () => {
    render(<ProcessingLoadingView slot={<Text>Dato curioso</Text>} />);
    expect(screen.getByText('Dato curioso')).toBeTruthy();
  });
});
