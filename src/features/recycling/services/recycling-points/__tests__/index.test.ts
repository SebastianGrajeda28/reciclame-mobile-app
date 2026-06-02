import { getRecyclingPoints } from '@/src/features/recycling/services/recycling-points';

jest.mock('@/src/features/recycling/services/config', () => ({
  RECYCLE_USE_MOCKS: true,
  RECYCLE_CONFIDENCE_THRESHOLD: 0.8,
}));

describe('getRecyclingPoints', () => {
  test('Debería devolver los puntos del mock cuando RECYCLE_USE_MOCKS es true', async () => {
    const points = await getRecyclingPoints();
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toHaveProperty('id');
    expect(points[0]).toHaveProperty('name');
    expect(points[0]).toHaveProperty('latitude');
    expect(points[0]).toHaveProperty('longitude');
    expect(points[0]).toHaveProperty('acceptedWasteTypeIds');
  });

  test('Debería incluir los tres puntos del campus definidos en el mock', async () => {
    const points = await getRecyclingPoints();
    const names = points.map((p) => p.name);
    expect(names).toContain('Contenedor Biblioteca Central');
    expect(names).toContain('Contenedor Estudios Generales');
    expect(names).toContain('Punto Verde Complejo MacGregor');
  });
});
