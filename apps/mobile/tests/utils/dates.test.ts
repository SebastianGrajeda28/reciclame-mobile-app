import { formatRelativeTime, formatShortDate } from '../../src/utils/dates'

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

describe('Utilidades de Fechas: formatRelativeTime', () => {
  const now = new Date('2026-05-22T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve "hace un momento" cuando pasó menos de un minuto', () => {
    expect(formatRelativeTime('2026-05-22T11:59:30Z')).toBe('hace un momento');
  });

  it('devuelve minutos cuando pasó menos de una hora', () => {
    expect(formatRelativeTime('2026-05-22T11:55:00Z')).toBe('hace 5 min');
  });

  it('devuelve horas cuando pasó menos de un día', () => {
    expect(formatRelativeTime('2026-05-22T10:00:00Z')).toBe('hace 2 h');
  });

  it('devuelve día en singular cuando pasó un día', () => {
    expect(formatRelativeTime('2026-05-21T12:00:00Z')).toBe('hace 1 día');
  });

  it('devuelve días en plural cuando pasaron varios días', () => {
    expect(formatRelativeTime('2026-05-12T12:00:00Z')).toBe('hace 10 días');
  });

  it('devuelve fecha corta cuando pasaron treinta días o más', () => {
    expect(formatRelativeTime('2026-04-22T12:00:00Z')).toBe('2026-04-22');
  });
});
