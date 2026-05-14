import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';

type RecycleFlowState = {
  capturedPhotoUri?: string;
  predictedWasteTypeId?: string;
  predictionConfidence?: number;
  finalWasteTypeId?: string;
  selectedContainerId?: string;
};

type RecycleFlowContextValue = {
  state: RecycleFlowState;
  setCapturedPhotoUri: (uri?: string) => void;
  setPrediction: (wasteTypeId: string, confidence: number) => void;
  setFinalWasteTypeId: (wasteTypeId: string) => void;
  setSelectedContainerId: (containerId: string) => void;
  resetFlow: () => void;
};

const RecycleFlowContext = createContext<RecycleFlowContextValue | undefined>(undefined);

export function RecycleFlowProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<RecycleFlowState>({});

  const setCapturedPhotoUri = useCallback((uri?: string) => {
    setState((prev) => ({ ...prev, capturedPhotoUri: uri }));
  }, []);

  const setPrediction = useCallback((wasteTypeId: string, confidence: number) => {
    setState((prev) => ({
      ...prev,
      predictedWasteTypeId: wasteTypeId,
      predictionConfidence: confidence,
      finalWasteTypeId: wasteTypeId,
    }));
  }, []);

  const setFinalWasteTypeId = useCallback((wasteTypeId: string) => {
    setState((prev) => ({
      ...prev,
      finalWasteTypeId: wasteTypeId,
    }));
  }, []);

  const setSelectedContainerId = useCallback((containerId: string) => {
    setState((prev) => ({
      ...prev,
      selectedContainerId: containerId,
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setState({});
  }, []);

  const value = useMemo<RecycleFlowContextValue>(
    () => ({
      state,
      setCapturedPhotoUri,
      setPrediction,
      setFinalWasteTypeId,
      setSelectedContainerId,
      resetFlow,
    }),
    [
      state,
      resetFlow,
      setCapturedPhotoUri,
      setFinalWasteTypeId,
      setPrediction,
      setSelectedContainerId,
    ],
  );

  return <RecycleFlowContext.Provider value={value}>{children}</RecycleFlowContext.Provider>;
}

export function useRecycleFlow() {
  const context = useContext(RecycleFlowContext);
  if (!context) {
    throw new Error('useRecycleFlow must be used within RecycleFlowProvider');
  }
  return context;
}

export function useResolvedRecycleSelection() {
  const { state } = useRecycleFlow();
  const predictedWasteType = wasteTypes.find((item) => item.id === state.predictedWasteTypeId);
  const finalWasteType = wasteTypes.find((item) => item.id === state.finalWasteTypeId);
  const selectedContainer = containers.find((item) => item.id === state.selectedContainerId);
  return { predictedWasteType, finalWasteType, selectedContainer };
}
