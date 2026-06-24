import { act, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useStudentLocation } from '@/src/hooks/useStudentLocation';

const PUCP = { latitude: -12.0695, longitude: -77.0793 };

type PositionCallback = (pos: { coords: { latitude: number; longitude: number } }) => void;

let capturedCallback: PositionCallback | null = null;
const mockRemove = jest.fn();

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  capturedCallback = null;
  (Location.watchPositionAsync as jest.Mock).mockImplementation((_opts, cb) => {
    capturedCallback = cb;
    return Promise.resolve({ remove: mockRemove });
  });
});

describe('useStudentLocation', () => {
  it('returns PUCP default initially', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    const { result } = renderHook(() => useStudentLocation());
    expect(result.current).toEqual(PUCP);
    await act(async () => {});
  });

  it('returns PUCP default when permission denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useStudentLocation());
    await act(async () => {});
    expect(result.current).toEqual(PUCP);
    expect(Location.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('requests foreground permission on mount', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    renderHook(() => useStudentLocation());
    await act(async () => {});
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('starts watchPositionAsync with Balanced accuracy and 10m interval when granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    renderHook(() => useStudentLocation());
    await act(async () => {});
    expect(Location.watchPositionAsync).toHaveBeenCalledWith(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
      expect.any(Function),
    );
  });

  it('updates location when watch callback fires', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    const { result } = renderHook(() => useStudentLocation());
    await act(async () => {});
    await act(async () => {
      capturedCallback?.({ coords: { latitude: -12.1, longitude: -77.05 } });
    });
    expect(result.current).toEqual({ latitude: -12.1, longitude: -77.05 });
  });

  it('removes subscription on unmount', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    const { unmount } = renderHook(() => useStudentLocation());
    await act(async () => {});
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
});
