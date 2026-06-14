import { updateUserAvatar } from '@/src/features/profile/api/users';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      rpc: jest.fn(),
    },
  };
});

import { supabase } from '@/src/services/supabase/client';

const mockedRpc = supabase.rpc as jest.Mock;

describe('updateUserAvatar', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  test('Debería actualizar el avatar del usuario cuando la recompensa está desbloqueada', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const rewardId = '22222222-2222-2222-2222-000000000001';
    const response = {
      data: [{ success: true, message: 'avatar_updated' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateUserAvatar(userId, rewardId);

    expect(mockedRpc).toHaveBeenCalledWith('update_user_avatar', {
      p_user_id: userId,
      p_reward_id: rewardId,
    });
    expect(result).toEqual({
      success: true,
      message: 'avatar_updated',
    });
  });

  test('Debería retornar error si la recompensa no existe', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const rewardId = 'non-existent-reward';
    const response = {
      data: [{ success: false, message: 'reward_not_found' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateUserAvatar(userId, rewardId);

    expect(result).toEqual({
      success: false,
      message: 'reward_not_found',
    });
  });

  test('Debería retornar error si la recompensa no está desbloqueada en el inventario del usuario', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const rewardId = '22222222-2222-2222-2222-000000000001';
    const response = {
      data: [{ success: false, message: 'reward_not_unlocked' }],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    const result = await updateUserAvatar(userId, rewardId);

    expect(result).toEqual({
      success: false,
      message: 'reward_not_unlocked',
    });
  });

  test('Debería lanzar Error cuando hay un error de Supabase', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const rewardId = '22222222-2222-2222-2222-000000000001';
    const response = {
      data: null,
      error: { message: 'Database connection failed' },
    };
    mockedRpc.mockResolvedValue(response);

    await expect(updateUserAvatar(userId, rewardId)).rejects.toThrow(
      'Failed to update avatar: Database connection failed',
    );
  });

  test('Debería lanzar Error cuando la respuesta está vacía', async () => {
    const userId = '11111111-1111-1111-1111-000000000001';
    const rewardId = '22222222-2222-2222-2222-000000000001';
    const response = {
      data: [],
      error: null,
    };
    mockedRpc.mockResolvedValue(response);

    await expect(updateUserAvatar(userId, rewardId)).rejects.toThrow(
      'No response from avatar update',
    );
  });
});
