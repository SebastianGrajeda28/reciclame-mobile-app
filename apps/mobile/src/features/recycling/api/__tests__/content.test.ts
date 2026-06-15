import {
    fetchFunFacts,
    fetchInstructionWithStepsByWasteTypeId,
    fetchRandomFunFact,
    fetchRandomFunFactByWasteTypeId,
} from '@/src/features/recycling/api/content';

import { supabase } from '@/src/services/supabase/client';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

const mockedFrom = supabase.from as jest.Mock;

describe('content api', () => {
  afterEach(() => {
    mockedFrom.mockReset();
    jest.restoreAllMocks();
  });

  test('Debería devolver una instrucción con pasos cuando hay data disponible', async () => {
    const wasteTypeId = 'waste-1';
    const dbRow = {
      id: 'inst-1',
      title: 'Lava el envase',
      body: 'Pasos para limpiar',
      image_url: null,
      waste_type_id: wasteTypeId,
      is_active: true,
      created_at: '2026-05-30T01:00:00Z',
      updated_at: '2026-05-30T02:00:00Z',
      instruction_steps: [
        {
          id: 'step-1',
          instruction_id: 'inst-1',
          text: 'Enjuaga con agua',
          image_url: null,
          is_active: true,
          created_at: '2026-05-30T01:05:00Z',
          updated_at: '2026-05-30T01:06:00Z',
        },
      ],
    };

    const order = jest.fn().mockResolvedValue({ data: [dbRow], error: null });
    const eqSecond = jest.fn(() => ({ order }));
    const eqFirst = jest.fn(() => ({ eq: eqSecond }));
    const select = jest.fn(() => ({ eq: eqFirst }));

    mockedFrom.mockReturnValue({ select });
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await fetchInstructionWithStepsByWasteTypeId(wasteTypeId);

    expect(mockedFrom).toHaveBeenCalledWith('instructions');
    expect(select).toHaveBeenCalledWith(
      'id,title,body,image_url,waste_type_id,is_active,created_at,updated_at,instruction_steps(id,instruction_id,text,image_url,is_active,created_at,updated_at)',
    );
    expect(eqFirst).toHaveBeenCalledWith('is_active', true);
    expect(eqSecond).toHaveBeenCalledWith('waste_type_id', wasteTypeId);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });

    expect(result).not.toBeNull();
    expect(result?.id).toBe('inst-1');
    expect(result?.steps?.length).toBe(1);
    expect(result?.updatedAt).toBe('2026-05-30T02:00:00Z');
    expect(result?.steps?.[0].updatedAt).toBe('2026-05-30T01:06:00Z');
  });

  test('Debería devolver null cuando no hay instrucciones', async () => {
    const order = jest.fn().mockResolvedValue({ data: [], error: null });
    const eqSecond = jest.fn(() => ({ order }));
    const eqFirst = jest.fn(() => ({ eq: eqSecond }));
    const select = jest.fn(() => ({ eq: eqFirst }));

    mockedFrom.mockReturnValue({ select });

    const result = await fetchInstructionWithStepsByWasteTypeId('waste-1');

    expect(result).toBeNull();
  });

  test('Debería lanzar Error cuando la consulta de instrucciones falla', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error SQL' } });
    const eqSecond = jest.fn(() => ({ order }));
    const eqFirst = jest.fn(() => ({ eq: eqSecond }));
    const select = jest.fn(() => ({ eq: eqFirst }));

    mockedFrom.mockReturnValue({ select });

    await expect(fetchInstructionWithStepsByWasteTypeId('waste-1')).rejects.toThrow('Error SQL');
  });

  test('Debería devolver un FunFact aleatorio por wasteTypeId', async () => {
    const wasteTypeId = 'waste-2';
    const dbRows = [
      {
        id: 'ff-1',
        text: 'Dato 1',
        waste_type_id: wasteTypeId,
        is_active: true,
        created_at: '2026-05-30T01:00:00Z',
      },
      {
        id: 'ff-2',
        text: 'Dato 2',
        waste_type_id: wasteTypeId,
        is_active: true,
        created_at: '2026-05-30T01:05:00Z',
      },
    ];

    const order = jest.fn().mockResolvedValue({ data: dbRows, error: null });
    const eqSecond = jest.fn(() => ({ order }));
    const eqFirst = jest.fn(() => ({ eq: eqSecond }));
    const select = jest.fn(() => ({ eq: eqFirst }));

    mockedFrom.mockReturnValue({ select });
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = await fetchRandomFunFactByWasteTypeId(wasteTypeId);

    expect(mockedFrom).toHaveBeenCalledWith('fun_facts');
    expect(select).toHaveBeenCalledWith('id,text,waste_type_id,is_active,created_at');
    expect(eqFirst).toHaveBeenCalledWith('is_active', true);
    expect(eqSecond).toHaveBeenCalledWith('waste_type_id', wasteTypeId);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result?.id).toBe('ff-2');
  });

  test('Debería devolver un FunFact aleatorio global', async () => {
    const dbRows = [
      {
        id: 'ff-10',
        text: 'Dato global',
        waste_type_id: null,
        is_active: true,
        created_at: '2026-05-30T01:00:00Z',
      },
    ];

    const order = jest.fn().mockResolvedValue({ data: dbRows, error: null });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));

    mockedFrom.mockReturnValue({ select });

    const result = await fetchRandomFunFact();

    expect(mockedFrom).toHaveBeenCalledWith('fun_facts');
    expect(select).toHaveBeenCalledWith('id,text,waste_type_id,is_active,created_at');
    expect(eq).toHaveBeenCalledWith('is_active', true);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result?.id).toBe('ff-10');
  });

  test('Debería lanzar Error cuando la consulta de FunFact falla', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error FunFact' } });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));

    mockedFrom.mockReturnValue({ select });

    await expect(fetchRandomFunFact()).rejects.toThrow('Error FunFact');
  });

  test('Debería devolver la lista de datos curiosos activos', async () => {
    const dbRows = [
      { id: 'ff-1', text: 'Dato 1', waste_type_id: null, is_active: true, created_at: '2026-05-30T01:00:00Z' },
      { id: 'ff-2', text: 'Dato 2', waste_type_id: null, is_active: true, created_at: '2026-05-30T01:01:00Z' },
    ];

    const order = jest.fn().mockResolvedValue({ data: dbRows, error: null });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));

    mockedFrom.mockReturnValue({ select });

    const result = await fetchFunFacts();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('ff-1');
    expect(result[1].id).toBe('ff-2');
  });

  test('Debería lanzar Error cuando la consulta de fetchFunFacts falla', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error lista' } });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));

    mockedFrom.mockReturnValue({ select });

    await expect(fetchFunFacts()).rejects.toThrow('Error lista');
  });
});
