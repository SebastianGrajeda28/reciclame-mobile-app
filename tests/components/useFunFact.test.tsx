import { act, renderHook } from '@testing-library/react-native';

import { useFunFactByWasteTypeId, useRandomFunFact } from '@/src/features/recycling/hooks/useFunFact';
import type { FunFact } from '@/src/types/funFact';

import { fetchRandomFunFact, fetchRandomFunFactByWasteTypeId } from '@/src/services/api/content';

jest.mock('@/src/services/api/content', () => ({
  fetchRandomFunFact: jest.fn(),
  fetchRandomFunFactByWasteTypeId: jest.fn(),
}));

const mockFetchRandomFunFact = fetchRandomFunFact as jest.Mock;
const mockFetchRandomFunFactByWasteTypeId = fetchRandomFunFactByWasteTypeId as jest.Mock;

const sampleFunFact: FunFact = {
  id: 'ff-1',
  text: 'Dato curioso',
  wasteTypeId: 'waste-1',
  isActive: true,
  createdAt: new Date('2026-05-30T01:00:00Z'),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('useFunFactByWasteTypeId', () => {
  it('Debería cargar un fun fact cuando hay wasteTypeId', async () => {
    mockFetchRandomFunFactByWasteTypeId.mockResolvedValue(sampleFunFact);

    const { result } = renderHook(() => useFunFactByWasteTypeId('waste-1'));
    await act(async () => {});

    expect(mockFetchRandomFunFactByWasteTypeId).toHaveBeenCalledWith('waste-1');
    expect(result.current.funFact).toEqual(sampleFunFact);
    expect(result.current.error).toBeNull();
  });

  it('Debería dejar null si no hay wasteTypeId', async () => {
    const { result } = renderHook(() => useFunFactByWasteTypeId(undefined));
    await act(async () => {});

    expect(mockFetchRandomFunFactByWasteTypeId).not.toHaveBeenCalled();
    expect(result.current.funFact).toBeNull();
  });

  it('Debería exponer error cuando falla la consulta', async () => {
    mockFetchRandomFunFactByWasteTypeId.mockRejectedValue(new Error('Error FunFact'));

    const { result } = renderHook(() => useFunFactByWasteTypeId('waste-1'));
    await act(async () => {});

    expect(result.current.funFact).toBeNull();
    expect(result.current.error?.message).toBe('Error FunFact');
  });
});

describe('useRandomFunFact', () => {
  it('Debería cargar un fun fact aleatorio', async () => {
    mockFetchRandomFunFact.mockResolvedValue({
      ...sampleFunFact,
      id: 'ff-2',
      wasteTypeId: undefined,
    });

    const { result } = renderHook(() => useRandomFunFact());
    await act(async () => {});

    expect(mockFetchRandomFunFact).toHaveBeenCalledTimes(1);
    expect(result.current.funFact?.id).toBe('ff-2');
    expect(result.current.error).toBeNull();
  });

  it('Debería exponer error cuando falla la consulta aleatoria', async () => {
    mockFetchRandomFunFact.mockRejectedValue(new Error('Error Random'));

    const { result } = renderHook(() => useRandomFunFact());
    await act(async () => {});

    expect(result.current.funFact).toBeNull();
    expect(result.current.error?.message).toBe('Error Random');
  });
});
