import { updateFeaturedMedals } from '@/src/features/profile/api/achievements';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      rpc: jest.fn(),
    },
  };
});

import { supabase } from '@/src/services/supabase/client';

const mockedRpc = supabase.rpc as jest.Mock;

describe('updateFeaturedMedals', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  test('Debería actualizar los medallones destacados cuando la lista contiene 5 medallas', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = [
      '22222222-2222-2222-2222-000000000001',
      '22222222-2222-2222-2222-000000000002',
      '22222222-2222-2222-2222-000000000003',
      '22222222-2222-2222-2222-000000000004',
      '22222222-2222-2222-2222-000000000005',
    ];
    const response = {
      data: [{ success: true, message: 'featured_medals_updated' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateFeaturedMedals(userId, medalIds);

    expect(mockedRpc).toHaveBeenCalledWith('update_featured_medals', {
      p_user_id: userId,
      p_achievement_ids: medalIds,
    });
    expect(result).toEqual({
      success: true,
      message: 'featured_medals_updated',
    });
  });

  test('Debería actualizar los medallones destacados cuando la lista contiene menos de 5 medallas', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = [
      '22222222-2222-2222-2222-000000000001',
      '22222222-2222-2222-2222-000000000002',
    ];
    const response = {
      data: [{ success: true, message: 'featured_medals_updated' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateFeaturedMedals(userId, medalIds);

    expect(result).toEqual({
      success: true,
      message: 'featured_medals_updated',
    });
  });

  test('Debería rechazar array vacío y actualizar a lista vacía', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds: string[] = [];
    const response = {
      data: [{ success: true, message: 'featured_medals_updated' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateFeaturedMedals(userId, medalIds);

    expect(result).toEqual({
      success: true,
      message: 'featured_medals_updated',
    });
  });

  test('Debería RECHAZAR ESTRICTAMENTE array con más de 5 medallas (6 medallas)', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = [
      '22222222-2222-2222-2222-000000000001',
      '22222222-2222-2222-2222-000000000002',
      '22222222-2222-2222-2222-000000000003',
      '22222222-2222-2222-2222-000000000004',
      '22222222-2222-2222-2222-000000000005',
      '22222222-2222-2222-2222-000000000006', // Sexta medalla - ¡DEBE RECHAZARSE!
    ];

    await expect(updateFeaturedMedals(userId, medalIds)).rejects.toThrow(
      'Featured medals cannot exceed 5. Received 6.',
    );

    // El RPC no debería haber sido llamado - la validación ocurre en el cliente
    expect(mockedRpc).not.toHaveBeenCalled();
  });

  test('Debería RECHAZAR ESTRICTAMENTE array con más de 5 medallas (10 medallas)', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = Array.from({ length: 10 }, (_, i) =>
      `22222222-2222-2222-2222-${String(i).padStart(12, '0')}`
    );

    await expect(updateFeaturedMedals(userId, medalIds)).rejects.toThrow(
      'Featured medals cannot exceed 5. Received 10.',
    );

    expect(mockedRpc).not.toHaveBeenCalled();
  });

  test('Debería retornar error si medalla no está desbloqueada', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = [
      '22222222-2222-2222-2222-000000000001',
      '99999999-9999-9999-9999-999999999999', // Medalla no desbloqueada
    ];
    const response = {
      data: [{ success: false, message: 'invalid_or_unlocked_achievements' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateFeaturedMedals(userId, medalIds);

    expect(result).toEqual({
      success: false,
      message: 'invalid_or_unlocked_achievements',
    });
  });

  test('Debería lanzar Error cuando hay un error de Supabase', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = ['22222222-2222-2222-2222-000000000001'];
    const response = {
      data: null,
      error: { message: 'Database connection failed' },
    };
    mockedRpc.mockResolvedValue(response);

    await expect(updateFeaturedMedals(userId, medalIds)).rejects.toThrow(
      'Failed to update featured medals: Database connection failed',
    );
  });

  test('Debería lanzar Error cuando la respuesta está vacía', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const medalIds = ['22222222-2222-2222-2222-000000000001'];
    const response = {
      data: [],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    await expect(updateFeaturedMedals(userId, medalIds)).rejects.toThrow(
      'No response from featured medals update',
    );
  });
});
