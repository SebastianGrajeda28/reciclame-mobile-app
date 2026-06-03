import { remoteRecyclingPoints } from '@/src/features/recycling/services/recycling-points/providers/remote-recycling-points';

jest.mock('@/src/services/supabase/client', () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from '@/src/services/supabase/client';

const mockedFrom = supabase.from as jest.Mock;

const POINT_ROW = {
  id: '22222222-2222-2222-2222-000000000001',
  name: 'Contenedor Biblioteca Central',
  latitude: '-12.069200',
  longitude: '-77.079400',
  recycling_point_bins: [
    { bin_type_id: '33333333-3333-3333-3333-000000000001' },
    { bin_type_id: '33333333-3333-3333-3333-000000000002' },
  ],
};

const WASTE_TYPE_ROWS = [
  { id: '11111111-1111-1111-1111-000000000001', recommended_bin_type_id: '33333333-3333-3333-3333-000000000001' },
  { id: '11111111-1111-1111-1111-000000000002', recommended_bin_type_id: '33333333-3333-3333-3333-000000000002' },
  { id: '11111111-1111-1111-1111-000000000004', recommended_bin_type_id: '33333333-3333-3333-3333-000000000004' },
];

function buildPointsChain(response: { data: unknown; error: unknown }) {
  const eq = jest.fn().mockResolvedValue(response);
  const select = jest.fn(() => ({ eq }));
  return { select, eq };
}

function buildWasteTypesChain(response: { data: unknown; error: unknown }) {
  const eq = jest.fn().mockResolvedValue(response);
  const select = jest.fn(() => ({ eq }));
  return { select, eq };
}

describe('remoteRecyclingPoints.getAll', () => {
  beforeEach(() => mockedFrom.mockReset());

  test('Debería mapear los puntos remotos a RecyclingContainer con acceptedWasteTypeIds resueltos', async () => {
    const pointsChain = buildPointsChain({ data: [POINT_ROW], error: null });
    const wasteChain = buildWasteTypesChain({ data: WASTE_TYPE_ROWS, error: null });

    mockedFrom
      .mockReturnValueOnce({ select: pointsChain.select })
      .mockReturnValueOnce({ select: wasteChain.select });

    const result = await remoteRecyclingPoints.getAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '22222222-2222-2222-2222-000000000001',
      name: 'Contenedor Biblioteca Central',
      latitude: -12.0692,
      longitude: -77.0794,
    });
    expect(result[0].acceptedWasteTypeIds).toContain('11111111-1111-1111-1111-000000000001');
    expect(result[0].acceptedWasteTypeIds).toContain('11111111-1111-1111-1111-000000000002');
    expect(result[0].acceptedWasteTypeIds).not.toContain('11111111-1111-1111-1111-000000000004');
  });

  test('Debería lanzar Error cuando la consulta de puntos falla', async () => {
    const pointsChain = buildPointsChain({ data: null, error: { message: 'connection refused' } });
    const wasteChain = buildWasteTypesChain({ data: WASTE_TYPE_ROWS, error: null });

    mockedFrom
      .mockReturnValueOnce({ select: pointsChain.select })
      .mockReturnValueOnce({ select: wasteChain.select });

    await expect(remoteRecyclingPoints.getAll()).rejects.toThrow('connection refused');
  });

  test('Debería lanzar Error cuando la consulta de tipos de residuo falla', async () => {
    const pointsChain = buildPointsChain({ data: [POINT_ROW], error: null });
    const wasteChain = buildWasteTypesChain({ data: null, error: { message: 'permission denied' } });

    mockedFrom
      .mockReturnValueOnce({ select: pointsChain.select })
      .mockReturnValueOnce({ select: wasteChain.select });

    await expect(remoteRecyclingPoints.getAll()).rejects.toThrow('permission denied');
  });
});
