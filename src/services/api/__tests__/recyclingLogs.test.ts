import { createRecyclingLog, getRecyclingLogs } from '@/src/services/api/recyclingLogs';
import { supabase } from '@/src/services/supabase/client';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

const mockedFrom = supabase.from as jest.Mock;

function buildQueryChain(response: { data: unknown; error: unknown }) {
  const single = jest.fn().mockResolvedValue(response);
  const select = jest.fn(() => ({ single }));
  const insert = jest.fn(() => ({ select }));
  return { insert, select, single };
}

function buildListQueryChain(response: { data: unknown; error: unknown }) {
  const order = jest.fn().mockResolvedValue(response);
  const eq = jest.fn(() => ({ order }));
  const select = jest.fn(() => ({ eq }));
  return { select, eq, order };
}

describe('createRecyclingLog', () => {
  beforeEach(() => {
    mockedFrom.mockReset();
  });

  test('Debería insertar en recycling_records y devolver el registro creado cuando la respuesta es exitosa', async () => {
    const dbRow = {
      id: 'rec-1',
      user_id: 'user-1',
      waste_type_id: '11111111-1111-1111-1111-000000000002',
      bin_type_id: '33333333-3333-3333-3333-000000000001',
      recycling_point_id: '22222222-2222-2222-2222-000000000001',
      detection_type: 'auto',
      confidence_score: 0.87,
      created_at: '2026-05-28T01:00:00Z',
    };
    const chain = buildQueryChain({ data: dbRow, error: null });
    mockedFrom.mockReturnValue({ insert: chain.insert });

    const result = await createRecyclingLog({
      userId: 'user-1',
      wasteTypeId: '11111111-1111-1111-1111-000000000002',
      binTypeId: '33333333-3333-3333-3333-000000000001',
      recyclingPointId: '22222222-2222-2222-2222-000000000001',
      detectionType: 'auto',
      confidenceScore: 0.87,
    });

    expect(mockedFrom).toHaveBeenCalledWith('recycling_records');
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      waste_type_id: '11111111-1111-1111-1111-000000000002',
      bin_type_id: '33333333-3333-3333-3333-000000000001',
      recycling_point_id: '22222222-2222-2222-2222-000000000001',
      detection_type: 'auto',
      confidence_score: 0.87,
      status: 'confirmed',
    });
    expect(result).toEqual({
      id: 'rec-1',
      userId: 'user-1',
      wasteTypeId: '11111111-1111-1111-1111-000000000002',
      binTypeId: '33333333-3333-3333-3333-000000000001',
      recyclingPointId: '22222222-2222-2222-2222-000000000001',
      detectionType: 'auto',
      confidenceScore: 0.87,
      createdAt: '2026-05-28T01:00:00Z',
    });
  });

  test('Debería lanzar Error con el mensaje de Supabase cuando la inserción falla', async () => {
    const chain = buildQueryChain({
      data: null,
      error: { message: 'foreign key violation on waste_type_id' },
    });
    mockedFrom.mockReturnValue({ insert: chain.insert });

    await expect(
      createRecyclingLog({
        userId: 'user-1',
        wasteTypeId: 'no-existe',
        binTypeId: '33333333-3333-3333-3333-000000000001',
        recyclingPointId: '22222222-2222-2222-2222-000000000001',
      }),
    ).rejects.toThrow('foreign key violation on waste_type_id');
  });

  test('Debería enviar null en detection_type y confidence_score cuando no se proveen', async () => {
    const chain = buildQueryChain({
      data: {
        id: 'rec-2',
        user_id: 'user-1',
        waste_type_id: '11111111-1111-1111-1111-000000000004',
        bin_type_id: '33333333-3333-3333-3333-000000000003',
        recycling_point_id: '22222222-2222-2222-2222-000000000002',
        detection_type: null,
        confidence_score: null,
        created_at: '2026-05-28T01:05:00Z',
      },
      error: null,
    });
    mockedFrom.mockReturnValue({ insert: chain.insert });

    await createRecyclingLog({
      userId: 'user-1',
      wasteTypeId: '11111111-1111-1111-1111-000000000004',
      binTypeId: '33333333-3333-3333-3333-000000000003',
      recyclingPointId: '22222222-2222-2222-2222-000000000002',
    });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        detection_type: null,
        confidence_score: null,
      }),
    );
  });
});

describe('getRecyclingLogs', () => {
  beforeEach(() => {
    mockedFrom.mockReset();
  });

  test('Debería devolver los registros del usuario ordenados por fecha descendente', async () => {
    const dbRows = [
      {
        id: 'rec-1',
        created_at: '2026-05-28T01:00:00Z',
        detection_type: 'auto',
        confidence_score: 0.87,
        status: 'confirmed',
        waste_types: { name: 'Plástico (PET)' },
        recycling_points: { name: 'Contenedor Biblioteca Central' },
      },
    ];
    const chain = buildListQueryChain({ data: dbRows, error: null });
    mockedFrom.mockReturnValue({ select: chain.select });

    const result = await getRecyclingLogs('user-1');

    expect(mockedFrom).toHaveBeenCalledWith('recycling_records');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'rec-1',
      wasteTypeName: 'Plástico (PET)',
      recyclingPointName: 'Contenedor Biblioteca Central',
      detectionType: 'auto',
    });
  });

  test('Debería lanzar Error cuando la consulta falla', async () => {
    const chain = buildListQueryChain({
      data: null,
      error: { message: 'permission denied' },
    });
    mockedFrom.mockReturnValue({ select: chain.select });

    await expect(getRecyclingLogs('user-1')).rejects.toThrow('permission denied');
  });
});
