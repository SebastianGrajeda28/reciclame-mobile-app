import { act, renderHook } from '@testing-library/react-native';

import { useMyFriendCode } from '@/src/features/friends/hooks/useMyFriendCode';
import { getMyFriendCode } from '@/src/features/friends/api/friends';

jest.mock('@/src/features/friends/api/friends', () => ({
  getMyFriendCode: jest.fn(),
  getFriends: jest.fn(),
}));

const mockGetMyFriendCode = getMyFriendCode as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

describe('useMyFriendCode', () => {
  it('Debería cargar el código de amigo cuando se provee un userId', async () => {
    // Preparar
    mockGetMyFriendCode.mockResolvedValue('04827193');

    // Actuar
    const { result } = renderHook(() => useMyFriendCode('user-123'));
    await act(async () => {});

    // Afirmar
    expect(mockGetMyFriendCode).toHaveBeenCalledTimes(1);
    expect(result.current.code).toBe('04827193');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('Debería no consultar y dejar loading en false cuando userId es null', async () => {
    // Actuar
    const { result } = renderHook(() => useMyFriendCode(null));
    await act(async () => {});

    // Afirmar
    expect(mockGetMyFriendCode).not.toHaveBeenCalled();
    expect(result.current.code).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('Debería exponer el mensaje de error cuando el servicio falla', async () => {
    // Preparar
    mockGetMyFriendCode.mockRejectedValue(
      new Error('No se pudo obtener tu código de amigo: Error de red'),
    );

    // Actuar
    const { result } = renderHook(() => useMyFriendCode('user-123'));
    await act(async () => {});

    // Afirmar
    expect(result.current.code).toBeNull();
    expect(result.current.error).toBe('No se pudo obtener tu código de amigo: Error de red');
    expect(result.current.loading).toBe(false);
  });

  it('Debería permitir refetch manual que re-consulta el código', async () => {
    // Preparar
    mockGetMyFriendCode.mockResolvedValue('04827193');

    const { result } = renderHook(() => useMyFriendCode('user-123'));
    await act(async () => {});
    expect(mockGetMyFriendCode).toHaveBeenCalledTimes(1);

    // Actuar: refetch
    await act(async () => {
      result.current.refetch();
    });
    await act(async () => {});

    // Afirmar
    expect(mockGetMyFriendCode).toHaveBeenCalledTimes(2);
    expect(result.current.code).toBe('04827193');
  });
});
