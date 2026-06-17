import { formatStreakCountdown } from '../../src/features/profile/utils/streakCountdown';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('formatStreakCountdown (#176)', () => {
  it('marca expirado cuando no queda tiempo', () => {
    expect(formatStreakCountdown(0).expired).toBe(true);
    expect(formatStreakCountdown(-5000).expired).toBe(true);
  });

  it('marca expirado ante valores no finitos', () => {
    expect(formatStreakCountdown(Number.NaN).expired).toBe(true);
  });

  it('formatea días y horas cuando queda más de un día', () => {
    const c = formatStreakCountdown(DAY + 4 * HOUR + 30 * MIN);
    expect(c.expired).toBe(false);
    expect(c.days).toBe(1);
    expect(c.hours).toBe(4);
    expect(c.label).toBe('Te quedan 1d 4h para no perder tu racha');
  });

  it('formatea horas y minutos cuando queda menos de un día', () => {
    const c = formatStreakCountdown(3 * HOUR + 15 * MIN);
    expect(c.days).toBe(0);
    expect(c.hours).toBe(3);
    expect(c.minutes).toBe(15);
    expect(c.label).toBe('Te quedan 3h 15m para no perder tu racha');
  });

  it('formatea solo minutos en la última hora', () => {
    const c = formatStreakCountdown(45 * MIN);
    expect(c.days).toBe(0);
    expect(c.hours).toBe(0);
    expect(c.minutes).toBe(45);
    expect(c.label).toBe('Te quedan 45m para no perder tu racha');
  });
});
