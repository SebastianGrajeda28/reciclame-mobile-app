import { addFriendByCode, getFriends, getMyFriendCode } from '@/src/features/friends/api/friends';

jest.mock('@/src/services/supabase/client', () => {
  return {
    supabase: {
      rpc: jest.fn(),
    },
  };
});

import { supabase } from '@/src/services/supabase/client';

const mockedRpc = supabase.rpc as jest.Mock;

const sampleAvatarConfig = {
  race: 'human',
  skin: 'brown',
  bg: 'light_blue',
  ears: 'normal',
  nose: 'rounded',
  mouth: 'smile',
  eyeColor: 'brown',
  eyeStyle: 'round',
  brows: 'black_normal',
  hair: 'brown_short',
  hat: null,
  clothes: 'blue_doublet',
  beard: null,
  moustache: null,
};

const sampleRow = {
  friend_id: 'aaaaaaaa-0000-0000-0000-000000000001',
  name: 'Ana Recicladora',
  current_streak: 5,
  avatar_base_style: 'https://cdn.example.com/avatar-1.png',
  avatar_config: sampleAvatarConfig,
  last_activity_at: '2026-06-01T14:30:00Z',
  featured_medals: [
    {
      id: 'bbbbbbbb-0000-0000-0000-000000000001',
      name: 'Reciclador Inicial',
      description: 'Primera segregación',
      image_url: 'https://cdn.example.com/medal-1.png',
    },
  ],
};

describe('getFriends', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  test('Debería mapear correctamente las filas de la RPC a FriendSummary (snake_case → camelCase)', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: [sampleRow], error: null });

    // Actuar
    const result = await getFriends('user-123');

    // Afirmar
    expect(mockedRpc).toHaveBeenCalledWith('get_friends_with_profile', {
      p_user_id: 'user-123',
    });
    expect(result).toHaveLength(1);
    const friend = result[0];
    expect(friend.id).toBe(sampleRow.friend_id);
    expect(friend.name).toBe('Ana Recicladora');
    expect(friend.currentStreak).toBe(5);
    expect(friend.avatarUrl).toBe('https://cdn.example.com/avatar-1.png');
    expect(friend.lastActivityAt).toBe('2026-06-01T14:30:00Z');
    expect(friend.avatarConfig).toEqual(sampleAvatarConfig);
    expect(friend.featuredMedals).toHaveLength(1);
    expect(friend.featuredMedals[0].name).toBe('Reciclador Inicial');
    expect(friend.featuredMedals[0].imageUrl).toBe('https://cdn.example.com/medal-1.png');
  });

  test('Debería retornar lista vacía cuando el usuario no tiene amigos', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: [], error: null });

    // Actuar
    const result = await getFriends('user-sin-amigos');

    // Afirmar
    expect(result).toEqual([]);
  });

  test('Debería retornar lista vacía cuando la RPC devuelve null en data', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: null });

    // Actuar
    const result = await getFriends('user-123');

    // Afirmar
    expect(result).toEqual([]);
  });

  test('Debería manejar amigos sin medallas destacadas (array vacío)', async () => {
    // Preparar
    const rowSinMedallas = { ...sampleRow, featured_medals: null };
    mockedRpc.mockResolvedValue({ data: [rowSinMedallas], error: null });

    // Actuar
    const result = await getFriends('user-123');

    // Afirmar
    expect(result[0].featuredMedals).toEqual([]);
  });

  test('Debería manejar amigos sin avatar (avatarUrl null)', async () => {
    // Preparar
    const rowSinAvatar = { ...sampleRow, avatar_base_style: null };
    mockedRpc.mockResolvedValue({ data: [rowSinAvatar], error: null });

    // Actuar
    const result = await getFriends('user-123');

    // Afirmar
    expect(result[0].avatarUrl).toBeNull();
  });

  test('Debería manejar amigos sin actividad reciente (lastActivityAt null)', async () => {
    // Preparar
    const rowSinActividad = { ...sampleRow, last_activity_at: null };
    mockedRpc.mockResolvedValue({ data: [rowSinActividad], error: null });

    // Actuar
    const result = await getFriends('user-123');

    // Afirmar
    expect(result[0].lastActivityAt).toBeNull();
  });

  test('Debería manejar amigos sin avatar_config (avatarConfig null)', async () => {
    // Preparar
    const rowSinConfig = { ...sampleRow, avatar_config: null };
    mockedRpc.mockResolvedValue({ data: [rowSinConfig], error: null });

    // Actuar
    const result = await getFriends('user-123');

    // Afirmar
    expect(result[0].avatarConfig).toBeNull();
  });

  test('Debería lanzar Error cuando la RPC devuelve un error de Supabase', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'Error de red' } });

    // Actuar y Afirmar
    await expect(getFriends('user-123')).rejects.toThrow(
      'No se pudo obtener la lista de amigos: Error de red',
    );
  });
});

describe('getMyFriendCode', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  test('Debería llamar a rpc get_my_friend_code y devolver el código como string', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: '04827193', error: null });

    // Actuar
    const result = await getMyFriendCode();

    // Afirmar
    expect(mockedRpc).toHaveBeenCalledWith('get_my_friend_code');
    expect(result).toBe('04827193');
  });

  test('Debería lanzar Error cuando la RPC devuelve un error de Supabase', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'Error de red' } });

    // Actuar y Afirmar
    await expect(getMyFriendCode()).rejects.toThrow(
      'No se pudo obtener tu código de amigo: Error de red',
    );
  });

  test('Debería lanzar Error cuando la RPC devuelve data null sin error', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: null });

    // Actuar y Afirmar
    await expect(getMyFriendCode()).rejects.toThrow('No se pudo obtener tu código de amigo.');
  });
});

describe('addFriendByCode', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  test('Debería mapear el jsonb devuelto por la RPC a AddFriendResult en camelCase (created: true)', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({
      data: { friendship_id: 'fid-001', friend_id: 'uid-002', created: true },
      error: null,
    });

    // Actuar
    const result = await addFriendByCode('12345678');

    // Afirmar
    expect(mockedRpc).toHaveBeenCalledWith('add_friend_by_code', { p_code: '12345678' });
    expect(result.friendshipId).toBe('fid-001');
    expect(result.friendId).toBe('uid-002');
    expect(result.created).toBe(true);
  });

  test('Debería devolver created: false cuando la amistad ya existía (idempotente)', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({
      data: { friendship_id: 'fid-001', friend_id: 'uid-002', created: false },
      error: null,
    });

    // Actuar
    const result = await addFriendByCode('12345678');

    // Afirmar
    expect(result.created).toBe(false);
  });

  test('Debería mapear token conocido a mensaje en español (friend code not found)', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'friend code not found' } });

    // Actuar y Afirmar
    await expect(addFriendByCode('00000000')).rejects.toThrow(
      'No encontramos ningún usuario con ese código.',
    );
  });

  test('Debería usar mensaje genérico cuando el token de error no está mapeado', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: { message: 'connection timeout' } });

    // Actuar y Afirmar
    await expect(addFriendByCode('12345678')).rejects.toThrow(
      'No se pudo agregar al amigo: connection timeout',
    );
  });

  test('Debería lanzar Error cuando la RPC devuelve data null sin error', async () => {
    // Preparar
    mockedRpc.mockResolvedValue({ data: null, error: null });

    // Actuar y Afirmar
    await expect(addFriendByCode('12345678')).rejects.toThrow('No se pudo agregar al amigo.');
  });
});
