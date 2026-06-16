import {
  groupByDateSection,
  horizonStart,
  sectionTitleFor,
} from '../../src/features/recycling/utils/historyGrouping';
import type { RecyclingLogListItem } from '../../src/types/recycling';

const NOW = new Date(2026, 5, 15, 12, 0, 0); // 15 jun 2026, hora local

function rec(id: string, date: Date): RecyclingLogListItem {
  return {
    id,
    createdAt: date.toISOString(),
    wasteTypeName: 'Vidrio',
    recyclingPointName: 'Punto A',
  };
}

describe('horizonStart (RF-041)', () => {
  it('"all" no tiene límite', () => {
    expect(horizonStart('all', NOW)).toBeNull();
  });

  it('"today" es el inicio del día local', () => {
    expect(horizonStart('today', NOW)).toBe(new Date(2026, 5, 15).getTime());
  });

  it('"month" es el día 1 del mes', () => {
    expect(horizonStart('month', NOW)).toBe(new Date(2026, 5, 1).getTime());
  });

  it('"week" cae siempre en lunes y no es futuro', () => {
    const start = horizonStart('week', NOW) as number;
    expect(new Date(start).getDay()).toBe(1);
    expect(start).toBeLessThanOrEqual(new Date(2026, 5, 15).getTime());
  });
});

describe('sectionTitleFor', () => {
  it('marca hoy y ayer', () => {
    expect(sectionTitleFor(new Date(2026, 5, 15, 9).toISOString(), NOW)).toBe('Hoy');
    expect(sectionTitleFor(new Date(2026, 5, 14, 9).toISOString(), NOW)).toBe('Ayer');
  });

  it('un mes anterior usa "Mes AÑO" determinista', () => {
    expect(sectionTitleFor(new Date(2026, 0, 10).toISOString(), NOW)).toBe('Enero 2026');
  });
});

describe('groupByDateSection (RF-039)', () => {
  it('agrupa consecutivos por fecha respetando el orden', () => {
    const items = [
      rec('a', new Date(2026, 5, 15, 10)),
      rec('b', new Date(2026, 5, 15, 8)),
      rec('c', new Date(2026, 5, 14, 8)),
      rec('d', new Date(2026, 0, 10)),
    ];
    const sections = groupByDateSection(items, NOW);
    expect(sections.map((s) => s.title)).toEqual(['Hoy', 'Ayer', 'Enero 2026']);
    expect(sections[0].data).toHaveLength(2);
    expect(sections[1].data).toHaveLength(1);
    expect(sections[2].data).toHaveLength(1);
  });

  it('lista vacía no produce secciones', () => {
    expect(groupByDateSection([], NOW)).toEqual([]);
  });
});
