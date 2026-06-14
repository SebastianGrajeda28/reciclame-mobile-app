import { act, renderHook } from '@testing-library/react-native';

import { useInstructionByWasteTypeId } from '@/src/features/recycling/hooks/useInstruction';
import type { Instruction } from '@/src/types/instruction';

import { fetchInstructionWithStepsByWasteTypeId } from '@/src/features/recycling/api/content';

jest.mock('@/src/features/recycling/api/content', () => ({
  fetchInstructionWithStepsByWasteTypeId: jest.fn(),
}));

const mockFetchInstructionWithStepsByWasteTypeId =
  fetchInstructionWithStepsByWasteTypeId as jest.Mock;

const sampleInstruction: Instruction = {
  id: 'inst-1',
  title: 'Lava el envase',
  body: 'Pasos para limpiar',
  imageUrl: null,
  wasteTypeId: 'waste-1',
  isActive: true,
  createdAt: '2026-05-30T01:00:00Z',
  updatedAt: '2026-05-30T02:00:00Z',
  steps: [
    {
      id: 'step-1',
      instructionId: 'inst-1',
      text: 'Enjuaga con agua',
      imageUrl: null,
      isActive: true,
      createdAt: '2026-05-30T01:05:00Z',
      updatedAt: '2026-05-30T01:06:00Z',
    },
  ],
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('useInstructionByWasteTypeId', () => {
  it('Debería cargar una instrucción con pasos cuando hay wasteTypeId', async () => {
    mockFetchInstructionWithStepsByWasteTypeId.mockResolvedValue(sampleInstruction);

    const { result } = renderHook(() => useInstructionByWasteTypeId('waste-1'));
    await act(async () => {});

    expect(mockFetchInstructionWithStepsByWasteTypeId).toHaveBeenCalledWith('waste-1');
    expect(result.current.instruction).toEqual(sampleInstruction);
    expect(result.current.error).toBeNull();
  });

  it('Debería dejar null si no hay wasteTypeId', async () => {
    const { result } = renderHook(() => useInstructionByWasteTypeId(undefined));
    await act(async () => {});

    expect(mockFetchInstructionWithStepsByWasteTypeId).not.toHaveBeenCalled();
    expect(result.current.instruction).toBeNull();
  });

  it('Debería exponer error cuando falla la consulta', async () => {
    mockFetchInstructionWithStepsByWasteTypeId.mockRejectedValue(new Error('Error Instruction'));

    const { result } = renderHook(() => useInstructionByWasteTypeId('waste-1'));
    await act(async () => {});

    expect(result.current.instruction).toBeNull();
    expect(result.current.error?.message).toBe('Error Instruction');
  });
});
