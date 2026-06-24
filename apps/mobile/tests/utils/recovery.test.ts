import { formatRecoveryWindow, isRecoveryUrgent } from '../../src/features/profile/utils/recovery';

const H = 60 * 60 * 1000;
const M = 60 * 1000;

describe('formatRecoveryWindow (#259)', () => {
  test('Debería marcar expirada cuando no queda tiempo', () => {
    const w = formatRecoveryWindow(0);
    expect(w.expired).toBe(true);
    expect(w.label).toBe('La ventana de recuperación expiró');
  });

  test('Debería marcar expirada con tiempo negativo', () => {
    expect(formatRecoveryWindow(-1000).expired).toBe(true);
  });

  test('Debería formatear días y horas', () => {
    const w = formatRecoveryWindow(26 * H + 30 * M);
    expect(w.expired).toBe(false);
    expect(w.days).toBe(1);
    expect(w.hours).toBe(2);
    expect(w.label).toBe('Te quedan 1d 2h para recuperar');
  });

  test('Debería formatear horas y minutos cuando falta menos de un día', () => {
    const w = formatRecoveryWindow(4 * H + 12 * M);
    expect(w.days).toBe(0);
    expect(w.hours).toBe(4);
    expect(w.minutes).toBe(12);
    expect(w.label).toBe('Te quedan 4h 12m para recuperar');
  });
});

describe('isRecoveryUrgent (#259)', () => {
  test('Debería ser urgente con menos de 6h restantes', () => {
    expect(isRecoveryUrgent(formatRecoveryWindow(4 * H))).toBe(true);
  });

  test('No debería ser urgente cuando quedan días', () => {
    expect(isRecoveryUrgent(formatRecoveryWindow(26 * H))).toBe(false);
  });

  test('No debería ser urgente si la ventana expiró o no existe', () => {
    expect(isRecoveryUrgent(formatRecoveryWindow(0))).toBe(false);
    expect(isRecoveryUrgent(null)).toBe(false);
  });
});
