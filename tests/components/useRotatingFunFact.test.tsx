import { act, renderHook } from '@testing-library/react-native';

import { useRotatingFunFact } from '@/src/features/recycling/hooks/useFunFact';
import { fetchFunFacts } from '@/src/services/api/content';

jest.mock('@/src/services/api/content', () => ({
  fetchFunFacts: jest.fn(),
}));

const mockFetchFunFacts = fetchFunFacts as jest.Mock;

const sampleFacts = [
  { id: '1', text: 'Dato curioso 1', isActive: true, createdAt: new Date() },
  { id: '2', text: 'Dato curioso 2', isActive: true, createdAt: new Date() },
  { id: '3', text: 'Dato curioso 3', isActive: true, createdAt: new Date() },
];

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('useRotatingFunFact', () => {
  it('Debería devolver null mientras los datos están cargando', () => {
    mockFetchFunFacts.mockResolvedValue(sampleFacts);

    const { result } = renderHook(() => useRotatingFunFact());

    expect(result.current.loading).toBe(true);
    expect(result.current.fact).toBeNull();
  });

  it('Debería mostrar el primer dato curioso tras cargar', async () => {
    mockFetchFunFacts.mockResolvedValue(sampleFacts);

    const { result } = renderHook(() => useRotatingFunFact());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.fact?.text).toBe('Dato curioso 1');
  });

  it('Debería rotar al siguiente dato curioso tras el intervalo', async () => {
    jest.useFakeTimers();
    mockFetchFunFacts.mockResolvedValue(sampleFacts);

    const { result } = renderHook(() => useRotatingFunFact());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.fact?.text).toBe('Dato curioso 2');
  });

  it('Debería asignar error si la consulta falla', async () => {
    mockFetchFunFacts.mockRejectedValue(new Error('Error de red'));

    const { result } = renderHook(() => useRotatingFunFact());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error?.message).toBe('Error de red');
    expect(result.current.fact).toBeNull();
  });
});
