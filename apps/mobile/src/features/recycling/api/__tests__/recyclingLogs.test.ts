import { createRecyclingLog, getRecyclingLogs, getRecyclingLogsFiltered } from '@/src/features/recycling/api/recyclingLogs';
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

function buildWeightLookupChain(estimatedWeightG: number | null) {
  const single = jest.fn().mockResolvedValue({ data: estimatedWeightG !== null ? { estimated_weight_g: estimatedWeightG } : null, error: null });
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq }));
  return { select, eq, single };
}

function buildListQueryChain(response: { data: unknown; error: unknown }) {
  const query: {
    eq: jest.Mock;
    lte: jest.Mock;
    order: jest.Mock;
  } = {
    eq: jest.fn(() => query),
    lte: jest.fn(() => query),
    order: jest.fn().mockResolvedValue(response),
  };
  const select = jest.fn(() => query);
  return { select, eq: query.eq, lte: query.lte, order: query.order };
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
      estimated_weight: 15,
      created_at: '2026-05-28T01:00:00Z',
    };
    const weightChain = buildWeightLookupChain(15);
    const insertChain = buildQueryChain({ data: dbRow, error: null });
    mockedFrom
      .mockReturnValueOnce({ select: weightChain.select })
      .mockReturnValueOnce({ insert: insertChain.insert });

    const result = await createRecyclingLog({
      userId: 'user-1',
      wasteTypeId: '11111111-1111-1111-1111-000000000002',
      binTypeId: '33333333-3333-3333-3333-000000000001',
      recyclingPointId: '22222222-2222-2222-2222-000000000001',
      detectionType: 'auto',
      confidenceScore: 0.87,
    });

    expect(mockedFrom).toHaveBeenCalledWith('waste_types');
    expect(mockedFrom).toHaveBeenCalledWith('recycling_records');
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        waste_type_id: '11111111-1111-1111-1111-000000000002',
        bin_type_id: '33333333-3333-3333-3333-000000000001',
        recycling_point_id: '22222222-2222-2222-2222-000000000001',
        detection_type: 'auto',
        confidence_score: 0.87,
        estimated_weight: 15,
        status: 'confirmed',
      }),
    );
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
    const weightChain = buildWeightLookupChain(null);
    const insertChain = buildQueryChain({
      data: null,
      error: { message: 'foreign key violation on waste_type_id' },
    });
    mockedFrom
      .mockReturnValueOnce({ select: weightChain.select })
      .mockReturnValueOnce({ insert: insertChain.insert });

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
    const weightChain = buildWeightLookupChain(null);
    const insertChain = buildQueryChain({
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
    mockedFrom
      .mockReturnValueOnce({ select: weightChain.select })
      .mockReturnValueOnce({ insert: insertChain.insert });

    await createRecyclingLog({
      userId: 'user-1',
      wasteTypeId: '11111111-1111-1111-1111-000000000004',
      binTypeId: '33333333-3333-3333-3333-000000000003',
      recyclingPointId: '22222222-2222-2222-2222-000000000002',
    });

    expect(insertChain.insert).toHaveBeenCalledWith(
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
});

describe('getRecyclingLogsFiltered', () => {
  beforeEach(() => {
    mockedFrom.mockReset();
  });

  test('Debería devolver todos los registros cuando ambos filtros son null', async () => {
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

    const result = await getRecyclingLogsFiltered('user-1', null, null);

    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.lte).not.toHaveBeenCalled();
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(1);
  });

  test('Debería filtrar solo por fecha cuando se envía una fecha y el tipo de residuo es null', async () => {
    const chain = buildListQueryChain({
      data: [
        {
          id: 'rec-2',
          created_at: '2026-05-28T10:00:00Z',
          detection_type: 'manual',
          confidence_score: 0.55,
          status: 'confirmed',
          waste_types: { name: 'Vidrio' },
          recycling_points: { name: 'Punto A' },
        },
      ],
      error: null,
    });
    mockedFrom.mockReturnValue({ select: chain.select });

    const result = await getRecyclingLogsFiltered('user-1', '2026-05-28', null);

    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(chain.lte).toHaveBeenCalledWith('created_at', '2026-05-28T23:59:59.999Z');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(1);
  });

  test('Debería filtrar solo por tipo de residuo cuando se envía wasteTypeId y la fecha es null', async () => {
    const chain = buildListQueryChain({
      data: [
        {
          id: 'rec-3',
          created_at: '2026-05-28T11:00:00Z',
          detection_type: 'auto',
          confidence_score: 0.91,
          status: 'confirmed',
          waste_types: { name: 'Plástico (PET)' },
          recycling_points: { name: 'Punto B' },
        },
      ],
      error: null,
    });
    mockedFrom.mockReturnValue({ select: chain.select });

    const result = await getRecyclingLogsFiltered('user-1', null, 'waste-2');

    expect(chain.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-1');
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'waste_type_id', 'waste-2');
    expect(chain.lte).not.toHaveBeenCalled();
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(1);
  });

  test('Debería aplicar fecha y tipo de residuo al mismo tiempo cuando ambos filtros tienen valor', async () => {
    const chain = buildListQueryChain({
      data: [
        {
          id: 'rec-4',
          created_at: '2026-05-27T09:00:00Z',
          detection_type: 'manual',
          confidence_score: 0.75,
          status: 'confirmed',
          waste_types: { name: 'Papel y cartón' },
          recycling_points: { name: 'Punto C' },
        },
      ],
      error: null,
    });
    mockedFrom.mockReturnValue({ select: chain.select });

    const result = await getRecyclingLogsFiltered('user-1', '2026-05-28', 'waste-3');

    expect(chain.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-1');
    expect(chain.lte).toHaveBeenCalledWith('created_at', '2026-05-28T23:59:59.999Z');
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'waste_type_id', 'waste-3');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toHaveLength(1);
  });
});
