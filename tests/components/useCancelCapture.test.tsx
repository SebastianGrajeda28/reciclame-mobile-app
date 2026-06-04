import { Alert } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useCancelCapture } from '@/src/features/recycling/hooks/useCancelCapture';
import { useRecycleFlow } from '@/src/features/recycling/hooks/useRecycleFlow';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('@/src/features/recycling/hooks/useRecycleFlow', () => ({
  useRecycleFlow: jest.fn(),
}));

const mockResetFlow = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRecycleFlow as jest.Mock).mockReturnValue({ resetFlow: mockResetFlow });
});

describe('useCancelCapture', () => {
  it('Debería abrir el diálogo de confirmación al invocar confirmCancel', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() => useCancelCapture());

    act(() => result.current.confirmCancel());

    expect(alertSpy).toHaveBeenCalledWith('¿Salir?', expect.any(String), expect.any(Array));
  });

  it('Debería llamar resetFlow y navegar al Home al confirmar Salir', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() => useCancelCapture());

    act(() => result.current.confirmCancel());

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string,
      string,
      { text: string; onPress?: () => void }[],
    ];
    const salir = buttons.find((b) => b.text === 'Salir');
    act(() => salir!.onPress!());

    expect(mockResetFlow).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/map');
  });

  it('Debería no descartar nada si el usuario elige Continuar', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { result } = renderHook(() => useCancelCapture());

    act(() => result.current.confirmCancel());

    const [, , buttons] = alertSpy.mock.calls[0] as [
      string,
      string,
      { text: string; onPress?: () => void }[],
    ];
    const continuar = buttons.find((b) => b.text === 'Continuar');

    expect(continuar?.onPress).toBeUndefined();
    expect(mockResetFlow).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
