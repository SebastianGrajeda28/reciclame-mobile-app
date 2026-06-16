import { act, renderHook } from '@testing-library/react-native';

import { useAddFriendByCode } from '@/src/features/friends/hooks/useAddFriendByCode';
import { addFriendByCode } from '@/src/features/friends/api/friends';

jest.mock('@/src/features/friends/api/friends', () => ({
  addFriendByCode: jest.fn(),
  getMyFriendCode: jest.fn(),
  getFriends: jest.fn(),
}));

const mockAddFriendByCode = addFriendByCode as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

describe('useAddFriendByCode', () => {
  it('Debería retornar true y status success cuando el submit es exitoso', async () => {
    // Preparar
    mockAddFriendByCode.mockResolvedValue({
      friendshipId: 'fid-001',
      friendId: 'uid-002',
      created: true,
    });

    // Actuar
    const { result } = renderHook(() => useAddFriendByCode());
    let ok: boolean = false;
    await act(async () => {
      ok = await result.current.submit('12345678');
    });

    // Afirmar
    expect(mockAddFriendByCode).toHaveBeenCalledWith('12345678');
    expect(ok).toBe(true);
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('Debería retornar false y status error con mensaje cuando el submit falla', async () => {
    // Preparar
    mockAddFriendByCode.mockRejectedValue(
      new Error('No encontramos ningún usuario con ese código.'),
    );

    // Actuar
    const { result } = renderHook(() => useAddFriendByCode());
    let ok: boolean = true;
    await act(async () => {
      ok = await result.current.submit('00000000');
    });

    // Afirmar
    expect(ok).toBe(false);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('No encontramos ningún usuario con ese código.');
  });

  it('Debería volver a idle y limpiar el error al llamar reset', async () => {
    // Preparar
    mockAddFriendByCode.mockRejectedValue(
      new Error('No encontramos ningún usuario con ese código.'),
    );

    const { result } = renderHook(() => useAddFriendByCode());
    await act(async () => {
      await result.current.submit('00000000');
    });
    expect(result.current.status).toBe('error');

    // Actuar
    act(() => {
      result.current.reset();
    });

    // Afirmar
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('Debería exponer status idle y sin error antes del primer submit', () => {
    const { result } = renderHook(() => useAddFriendByCode());

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });
});
