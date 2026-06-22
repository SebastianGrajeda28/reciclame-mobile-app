import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';

import { containers } from '@/src/features/recycling/services/containers.mock';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import type { StreakResult } from '../api/recyclingLogs';
import {
    advanceStep,
    clearPendingSession,
    flushAndStartNewSession,
    flushSession,
    savePendingSession,
    type FlowStep,
    type LocalRecyclingSession,
} from '../api/recyclingSessions';

type RecycleFlowState = {
  capturedPhotoUri?: string;
  predictedWasteTypeId?: string;
  predictionConfidence?: number;
  finalWasteTypeId?: string;
  selectedContainerId?: string;
  streakResult?: StreakResult;
};

type RecycleFlowContextValue = {
  state: RecycleFlowState;
  setCapturedPhotoUri: (uri?: string) => void;
  setPrediction: (wasteTypeId: string, confidence: number) => void;
  setFinalWasteTypeId: (wasteTypeId: string) => void;
  setSelectedContainerId: (containerId: string) => void;
  clearSelectedContainer: () => void;
  clearFinalWasteType: () => void;
  clearPrediction: () => void;
  resetFlow: (outcome?: 'abandoned' | 'failed') => void;
  startNewFlow: (userId: string | null) => Promise<void>;
  markStep: (step: FlowStep) => void;
  markConfirmed: (recyclingRecordId: string) => Promise<void>;
  setStreakResult: (result: StreakResult) => void;
};

const RecycleFlowContext = createContext<RecycleFlowContextValue | undefined>(undefined);

export function RecycleFlowProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<RecycleFlowState>({});
  const sessionRef = useRef<LocalRecyclingSession | null>(null);

  const updateSession = useCallback(async (patch: Partial<LocalRecyclingSession>) => {
    if (!sessionRef.current) return;
    sessionRef.current = { ...sessionRef.current, ...patch };
    await savePendingSession(sessionRef.current);
  }, []);

  const markStep = useCallback((step: FlowStep) => {
    if (!sessionRef.current) return;
    const next = advanceStep(sessionRef.current.furthestStep, step);
    if (next !== sessionRef.current.furthestStep) {
      updateSession({ furthestStep: next });
    }
  }, [updateSession]);

  const markConfirmed = useCallback(async (recyclingRecordId: string) => {
    await updateSession({ outcome: 'confirmed', recyclingRecordId, furthestStep: 'success' });
  }, [updateSession]);

  const setStreakResult = useCallback((result: StreakResult) => {
    setState((prev) => ({ ...prev, streakResult: result }));
  }, []);

  const startNewFlow = useCallback(async (userId: string | null) => {
    const session = await flushAndStartNewSession(userId);
    sessionRef.current = session;
  }, []);

  const setCapturedPhotoUri = useCallback((uri?: string) => {
    setState((prev) => ({ ...prev, capturedPhotoUri: uri }));
  }, []);

  const setPrediction = useCallback((wasteTypeId: string, confidence: number, autoSelectContainer?: { lat: number; lon: number }) => {
    setState((prev) => ({
      ...prev,
      predictedWasteTypeId: wasteTypeId,
      predictionConfidence: confidence,
      finalWasteTypeId: wasteTypeId,
    }));
    updateSession({
      predictedWasteTypeId: wasteTypeId,
      finalWasteTypeId: wasteTypeId,
      confidenceScore: confidence,
      detectionType: 'auto',
    });

    // Auto-select closest container if location is provided
    if (autoSelectContainer) {
      // This will be handled by the caller to avoid circular dependencies
    }
  }, [updateSession]);

  const setFinalWasteTypeId = useCallback((wasteTypeId: string) => {
    setState((prev) => {
      const hasPrediction = prev.predictedWasteTypeId !== undefined;
      const overridden = hasPrediction && prev.predictedWasteTypeId !== wasteTypeId;
      updateSession({
        finalWasteTypeId: wasteTypeId,
        // 'manual' only when the user picked without any AI prediction.
        // If the AI predicted first, keep 'auto' regardless of whether they changed it.
        detectionType: hasPrediction ? 'auto' : 'manual',
        wasteTypeOverridden: overridden,
      });
      return { ...prev, finalWasteTypeId: wasteTypeId };
    });
  }, [updateSession]);

  const setSelectedContainerId = useCallback((containerId: string) => {
    setState((prev) => ({ ...prev, selectedContainerId: containerId }));
    updateSession({ recyclingPointId: containerId });
  }, [updateSession]);

  const clearSelectedContainer = useCallback(() => {
    setState((prev) => ({ ...prev, selectedContainerId: undefined }));
  }, []);

  const clearFinalWasteType = useCallback(() => {
    setState((prev) => ({ ...prev, finalWasteTypeId: undefined }));
  }, []);

  const clearPrediction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      capturedPhotoUri: undefined,
      predictedWasteTypeId: undefined,
      predictionConfidence: undefined,
      finalWasteTypeId: undefined,
    }));
  }, []);

  const resetFlow = useCallback(async (outcome: 'abandoned' | 'failed' = 'abandoned') => {
    if (sessionRef.current && !sessionRef.current.outcome) {
      sessionRef.current.outcome = outcome;
      await savePendingSession(sessionRef.current);
      const flushed = await flushSession(sessionRef.current);
      if (flushed) {
        await clearPendingSession();
      }
      // if flush failed: AsyncStorage retains it, flushAndStartNewSession retries next flow
    }
    sessionRef.current = null;
    setState({});
  }, []);

  const value = useMemo<RecycleFlowContextValue>(
    () => ({
      state,
      setCapturedPhotoUri,
      setPrediction,
      setFinalWasteTypeId,
      setSelectedContainerId,
      clearSelectedContainer,
      clearFinalWasteType,
      clearPrediction,
      resetFlow,
      startNewFlow,
      markStep,
      markConfirmed,
      setStreakResult,
    }),
    [
      state,
      resetFlow,
      startNewFlow,
      setCapturedPhotoUri,
      setFinalWasteTypeId,
      setPrediction,
      setSelectedContainerId,
      clearSelectedContainer,
      clearFinalWasteType,
      clearPrediction,
      markStep,
      markConfirmed,
      setStreakResult,
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
