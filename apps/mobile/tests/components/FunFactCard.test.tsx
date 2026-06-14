import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { FunFactCard } from '../../src/features/recycling/components/FunFactCard';

describe('FunFactCard', () => {
  it('Debería renderizar el texto del dato curioso', () => {
    // Preparar
    const text = 'El vidrio es 100% reciclable.';

    // Actuar
    render(<FunFactCard text={text} />);

    // Afirmar
    expect(screen.getByText(text)).toBeTruthy();
  });

  it('Debería mostrar el encabezado "¿Sabías que...?"', () => {
    // Preparar / Actuar
    render(<FunFactCard text="Cualquier dato curioso" />);

    // Afirmar
    expect(screen.getByText('¿Sabías que...?')).toBeTruthy();
  });
});
