import { useState, useCallback } from 'react';
import { apiService, Cycle, OverlappingCycle } from '@/services/apiService';

interface UseCycleCreateOptions {
  teamId: number;
  onSuccess?: (cycle: Cycle) => void;
  onError?: (error: Error) => void;
}

interface CreateCycleData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  cooldownEnabled?: boolean;
}

interface CycleOverlapState {
  isOpen: boolean;
  overlappingCycles: OverlappingCycle[];
  pendingData: CreateCycleData | null;
}

export const useCycleCreate = (options: UseCycleCreateOptions) => {
  const { teamId, onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [overlapState, setOverlapState] = useState<CycleOverlapState>({
    isOpen: false,
    overlappingCycles: [],
    pendingData: null,
  });

  const closeOverlapModal = useCallback(() => {
    setOverlapState((prev) => ({
      ...prev,
      isOpen: false,
      pendingData: null,
    }));
  }, []);

  const createCycle = useCallback(
    async (data: CreateCycleData, skipOverlapCheck = false) => {
      setIsLoading(true);
      try {
        const result = await apiService.createCycle(teamId, data, skipOverlapCheck);
        closeOverlapModal();
        onSuccess?.(result.cycle);
        return result.cycle;
      } catch (error: any) {
        // Check if it's an overlap error (409 status)
        if (error.message?.includes('409') || error.status === 409) {
          // Try to parse the overlapping cycles from the error
          let overlappingCycles: OverlappingCycle[] = [];
          try {
            const errorData = JSON.parse(error.message?.split(' - ')[1] || '{}');
            overlappingCycles = errorData.overlappingCycles || [];
          } catch {
            // If parsing fails, we'll still show the modal with empty list
          }

          setOverlapState({
            isOpen: true,
            overlappingCycles,
            pendingData: data,
          });
          return null;
        }

        onError?.(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, onSuccess, onError, closeOverlapModal]
  );

  const createAnyway = useCallback(() => {
    if (overlapState.pendingData) {
      return createCycle(overlapState.pendingData, true);
    }
  }, [overlapState.pendingData, createCycle]);

  const adjustDates = useCallback(() => {
    closeOverlapModal();
    // Return to the form - the pending data is still available
    // The component can use this to keep the form open with the data
    return overlapState.pendingData;
  }, [closeOverlapModal, overlapState.pendingData]);

  return {
    createCycle,
    createAnyway,
    adjustDates,
    closeOverlapModal,
    isLoading,
    overlapState,
  };
};

export default useCycleCreate;
