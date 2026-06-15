import { formatShortDate } from '../../src/utils/dates'

describe('Utilidades de Fechas: FormatShortDate',() => {

  it('Formatear correctamente una fecha al formato YYYY-MM-DD', () => {
    const fechaPrueba = new Date('2026-05-22T12:00:00Z');
    
    const resultado = formatShortDate(fechaPrueba);
    
    expect(resultado).toBe('2026-05-22');
  });

  it('Mantiene el cero a la izquierda en meses y días de un solo dígito', () => {
    const fechaPrueba = new Date('2026-01-05T12:00:00Z');
    const resultado = formatShortDate(fechaPrueba);
    
    expect(resultado).toBe('2026-01-05');
  });
});

