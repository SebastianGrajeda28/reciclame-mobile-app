import { getUserSettings, updateUserSetting } from '@/src/features/profile/api/userSettings';

jest.mock('@/src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/src/services/supabase/client';

const mockedFrom = supabase.from as jest.Mock;

function buildQueryChain(overrides: Record<string, jest.Mock> = {}) {
  const chain: Record<string, jest.Mock> = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn(),
    upsert: jest.fn(),
    single: jest.fn(),
    ...overrides,
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.upsert.mockReturnValue(chain);
  return chain;
}

const sampleRow = {
  id: 'setting-1',
  user_id: 'user-abc',
  notifications_enabled: true,
  skip_recycling_instructions: false,
  profile_visibility: null,
  language: null,
  updated_at: '2026-06-01T00:00:00Z',
};

describe('getUserSettings', () => {
  beforeEach(() => {
    mockedFrom.mockReset();
  });

  test('Debería retornar null cuando no existe registro de settings', async () => {
    const chain = buildQueryChain();
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockedFrom.mockReturnValue(chain);

    const result = await getUserSettings('user-abc');

    expect(result).toBeNull();
    expect(mockedFrom).toHaveBeenCalledWith('user_settings');
  });

  test('Debería retornar el UserSetting correctamente mapeado desde snake_case', async () => {
    const chain = buildQueryChain();
    chain.maybeSingle.mockResolvedValue({ data: sampleRow, error: null });
    mockedFrom.mockReturnValue(chain);

    const result = await getUserSettings('user-abc');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('setting-1');
    expect(result!.userId).toBe('user-abc');
    expect(result!.notificationsEnabled).toBe(true);
    expect(result!.skipRecyclingInstructions).toBe(false);
    expect(result!.profileVisibility).toBeNull();
    expect(result!.language).toBeNull();
  });

  test('Debería lanzar un error si la consulta falla', async () => {
    const chain = buildQueryChain();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { message: 'Error de red' } });
    mockedFrom.mockReturnValue(chain);

    await expect(getUserSettings('user-abc')).rejects.toThrow('Error de red');
  });
});

describe('updateUserSetting', () => {
  beforeEach(() => {
    mockedFrom.mockReset();
  });

  test('Debería hacer upsert con los campos correctos al actualizar skipRecyclingInstructions', async () => {
    const updatedRow = { ...sampleRow, skip_recycling_instructions: true };
    const chain = buildQueryChain();
    chain.single.mockResolvedValue({ data: updatedRow, error: null });
    mockedFrom.mockReturnValue(chain);

    const result = await updateUserSetting('user-abc', { skipRecyclingInstructions: true });

    expect(result.skipRecyclingInstructions).toBe(true);
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-abc',
        skip_recycling_instructions: true,
      }),
      { onConflict: 'user_id' },
    );
  });

  test('Debería retornar el UserSetting actualizado correctamente mapeado', async () => {
    const updatedRow = { ...sampleRow, notifications_enabled: false };
    const chain = buildQueryChain();
    chain.single.mockResolvedValue({ data: updatedRow, error: null });
    mockedFrom.mockReturnValue(chain);

    const result = await updateUserSetting('user-abc', { notificationsEnabled: false });

    expect(result.userId).toBe('user-abc');
    expect(result.notificationsEnabled).toBe(false);
    expect(result.skipRecyclingInstructions).toBe(false);
  });

  test('Debería lanzar un error si la operación de upsert falla', async () => {
    const chain = buildQueryChain();
    chain.single.mockResolvedValue({ data: null, error: { message: 'Fallo RLS' } });
    mockedFrom.mockReturnValue(chain);

    await expect(
      updateUserSetting('user-abc', { skipRecyclingInstructions: true }),
    ).rejects.toThrow('Fallo RLS');
  });
});
