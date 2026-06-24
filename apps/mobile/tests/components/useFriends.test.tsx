import { act, renderHook } from '@testing-library/react-native';

import { useFriends } from '@/src/features/friends/hooks/useFriends';
import type { FriendSummary } from '@/src/types/friend';
import { getFriends } from '@/src/features/friends/api/friends';

jest.mock('@/src/features/friends/api/friends', () => ({
  getFriends: jest.fn(),
}));

const mockGetFriends = getFriends as jest.Mock;

const sampleFriend: FriendSummary = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  name: 'Ana Recicladora',
  currentStreak: 5,
  avatarUrl: 'https://cdn.example.com/avatar-1.png',
  lastActivityAt: '2026-06-01T14:30:00Z',
  featuredMedals: [
    {
      id: 'bbbbbbbb-0000-0000-0000-000000000001',
      slug: 'primer-paso',
      name: 'Reciclador Inicial',
      description: 'Primera segregación',
    },
  ],
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('useFriends', () => {
  it('Debería cargar la lista de amigos cuando se provee un userId', async () => {
    // Preparar
    mockGetFriends.mockResolvedValue([sampleFriend]);

    // Actuar
    const { result } = renderHook(() => useFriends('user-123'));
    await act(async () => {});

    // Afirmar
    expect(mockGetFriends).toHaveBeenCalledWith('user-123');
    expect(result.current.data).toEqual([sampleFriend]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('Debería retornar lista vacía y no consultar cuando userId es null', async () => {
    // Actuar
    const { result } = renderHook(() => useFriends(null));
    await act(async () => {});

    // Afirmar
    expect(mockGetFriends).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('Debería retornar lista vacía cuando el usuario no tiene amigos', async () => {
    // Preparar
    mockGetFriends.mockResolvedValue([]);

    // Actuar
    const { result } = renderHook(() => useFriends('user-sin-amigos'));
    await act(async () => {});

    // Afirmar
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('Debería exponer el mensaje de error cuando el servicio falla', async () => {
    // Preparar
    mockGetFriends.mockRejectedValue(new Error('No se pudo obtener la lista de amigos: Error de red'));

    // Actuar
    const { result } = renderHook(() => useFriends('user-123'));
    await act(async () => {});

    // Afirmar
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('No se pudo obtener la lista de amigos: Error de red');
    expect(result.current.loading).toBe(false);
  });

  it('Debería permitir refetch manual sin reiniciar datos existentes con loading', async () => {
    // Preparar
    mockGetFriends.mockResolvedValue([sampleFriend]);

    const { result } = renderHook(() => useFriends('user-123'));
    await act(async () => {});
    expect(mockGetFriends).toHaveBeenCalledTimes(1);

    // Actuar: refetch
    await act(async () => {
      result.current.refetch();
    });
    await act(async () => {});

    // Afirmar
    expect(mockGetFriends).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual([sampleFriend]);
  });
});
