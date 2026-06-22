import {
  formatHistoryTime,
  groupByDateSection,
  horizonStart,
  sectionTitleFor,
} from '@/src/features/recycling/utils/historyGrouping';
import type { RecyclingLogListItem } from '@/src/types/recycling';

// Jueves 18 jun 2026, 12:00 (hora local). Semana ISO inicia el lunes 15 jun.
const NOW = new Date(2026, 5, 18, 12, 0, 0);

function isoLocal(y: number, m: number, d: number, h = 0, min = 0): string {
  return new Date(y, m, d, h, min, 0).toISOString();
}

function mkItem(id: string, date: Date): RecyclingLogListItem {
  return {
    id,
    createdAt: date.toISOString(),
    wasteTypeName: 'Plástico',
    recyclingPointName: 'Punto',
  };
}

describe('horizonStart', () => {
  test('Debería devolver null (sin límite) para el horizonte "all"', () => {
    expect(horizonStart('all', NOW)).toBeNull();
  });

  test('Debería devolver el inicio del día local para "today"', () => {
    expect(horizonStart('today', NOW)).toBe(new Date(2026, 5, 18).getTime());
  });

  test('Debería devolver el primer día del mes para "month"', () => {
    expect(horizonStart('month', NOW)).toBe(new Date(2026, 5, 1).getTime());
  });

  test('Debería devolver el lunes de la semana (no posterior a hoy) para "week"', () => {
    const start = horizonStart('week', NOW);
    expect(start).not.toBeNull();
    expect(new Date(start as number).getDay()).toBe(1); // lunes
    expect(start as number).toBeLessThanOrEqual(new Date(2026, 5, 18).getTime());
    expect(start).toBe(new Date(2026, 5, 15).getTime());
  });
});

describe('sectionTitleFor', () => {
  test('Debería titular "Hoy" un registro de hoy', () => {
    expect(sectionTitleFor(isoLocal(2026, 5, 18, 9), NOW)).toBe('Hoy');
  });

  test('Debería titular "Ayer" un registro del día anterior', () => {
    expect(sectionTitleFor(isoLocal(2026, 5, 17, 23), NOW)).toBe('Ayer');
  });

  test('Debería titular "Esta semana" un registro de la semana en curso (no hoy/ayer)', () => {
    expect(sectionTitleFor(isoLocal(2026, 5, 16, 10), NOW)).toBe('Esta semana');
  });

  test('Debería titular "Este mes" un registro del mes en curso fuera de la semana', () => {
    expect(sectionTitleFor(isoLocal(2026, 5, 5, 10), NOW)).toBe('Este mes');
  });

  test('Debería titular "Mes Año" un registro de meses anteriores', () => {
    expect(sectionTitleFor(isoLocal(2026, 4, 20, 10), NOW)).toBe('Mayo 2026');
  });
});

describe('formatHistoryTime', () => {
  test('Debería mostrar solo la hora HH:MM para un registro de hoy', () => {
    expect(formatHistoryTime(isoLocal(2026, 5, 18, 14, 5), NOW)).toBe('14:05');
  });

  test('Debería mostrar solo la hora para un registro de ayer', () => {
    expect(formatHistoryTime(isoLocal(2026, 5, 17, 9, 0), NOW)).toBe('09:00');
  });

  test('Debería incluir "D mmm · HH:MM" para fechas más antiguas', () => {
    expect(formatHistoryTime(isoLocal(2026, 5, 10, 16, 30), NOW)).toBe('10 jun · 16:30');
  });
});

describe('groupByDateSection', () => {
  test('Debería agrupar registros consecutivos en secciones por fecha', () => {
    const items = [
      mkItem('a', new Date(2026, 5, 18, 10, 0)),
      mkItem('b', new Date(2026, 5, 18, 9, 0)),
      mkItem('c', new Date(2026, 5, 17, 9, 0)),
    ];
    const sections = groupByDateSection(items, NOW);
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe('Hoy');
    expect(sections[0].data).toHaveLength(2);
    expect(sections[1].title).toBe('Ayer');
    expect(sections[1].data).toHaveLength(1);
  });

  test('Debería devolver una lista vacía cuando no hay registros', () => {
    expect(groupByDateSection([], NOW)).toEqual([]);
  });
});
