import { getProfileSummary } from '@/src/features/profile/api/summary';
import { supabase } from '@/src/services/supabase/client';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      rpc: jest.fn(),
    },
  };
});

const mockedRpc = supabase.rpc as jest.Mock;

describe('getProfileSummary', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  test('Debería retornar el resumen de perfil correctamente si la respuesta es exitosa', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const mockRow = {
      total_weight_kg: 15.2,
      total_items: 124,
      member_since: '2024-01-15T00:00:00Z',
      achievements_count: 8,
    };

    mockedRpc.mockResolvedValue({
      data: [mockRow],
      error: null,
    });

    const result = await getProfileSummary(userId);

    expect(mockedRpc).toHaveBeenCalledWith('get_profile_summary', {
      p_user_id: userId,
    });

    expect(result).toEqual({
      totalWeightKg: 15.2,
      totalItems: 124,
      memberSince: '2024-01-15T00:00:00Z',
      achievementsCount: 8,
    });
  });

  test('Debería retornar null si la respuesta no tiene datos', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    mockedRpc.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await getProfileSummary(userId);

    expect(result).toBeNull();
  });

  test('Debería lanzar Error si la llamada RPC de Supabase falla', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    mockedRpc.mockResolvedValue({
      data: null,
      error: { message: 'Database query failed' },
    });

    await expect(getProfileSummary(userId)).rejects.toThrow(
      'Failed to fetch profile summary: Database query failed'
    );
  });
});
