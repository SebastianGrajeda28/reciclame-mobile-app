import { remoteRecyclingPoints } from '@/src/features/recycling/services/recycling-points/providers/remote-recycling-points';
import { supabase } from '@/src/services/supabase/client';

jest.mock('@/src/services/supabase/client', () => ({
  supabase: { from: jest.fn() },
}));

const mockedFrom = supabase.from as jest.Mock;

const POINT_ROW = {
  id: '22222222-2222-2222-2222-000000000001',
  name: 'Contenedor Biblioteca Central',
  latitude: '-12.069200',
  longitude: '-77.079400',
  recycling_point_bins: [
    { bin_type_id: '33333333-3333-3333-3333-000000000001', is_active: true },
    { bin_type_id: '33333333-3333-3333-3333-000000000004', is_active: true },
    { bin_type_id: '33333333-3333-3333-3333-000000000006', is_active: false },
  ],
};

function buildPointsChain(response: { data: unknown; error: unknown }) {
  const eq = jest.fn().mockResolvedValue(response);
  const select = jest.fn(() => ({ eq }));
  return { select, eq };
}

describe('remoteRecyclingPoints.getAll', () => {
  beforeEach(() => mockedFrom.mockReset());

  test('Debería mapear los puntos remotos a RecyclingContainer con availableBinTypeIds', async () => {
    const pointsChain = buildPointsChain({ data: [POINT_ROW], error: null });

    mockedFrom.mockReturnValueOnce({ select: pointsChain.select });

    const result = await remoteRecyclingPoints.getAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '22222222-2222-2222-2222-000000000001',
      name: 'Contenedor Biblioteca Central',
      latitude: -12.0692,
      longitude: -77.0794,
    });
    expect(result[0].availableBinTypeIds).toEqual([
      '33333333-3333-3333-3333-000000000001',
      '33333333-3333-3333-3333-000000000004',
    ]);
    expect(result[0].acceptedWasteTypeIds).toEqual([]);
  });

  test('Debería lanzar Error cuando la consulta de puntos falla', async () => {
    const pointsChain = buildPointsChain({ data: null, error: { message: 'connection refused' } });

    mockedFrom.mockReturnValueOnce({ select: pointsChain.select });

    await expect(remoteRecyclingPoints.getAll()).rejects.toThrow('connection refused');
  });
});
