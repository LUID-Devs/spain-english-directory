import React from 'react';
import {
  useGetTaskStatusHistoryQuery,
  useGetTaskStatusTimeBreakdownQuery,
} from '@/hooks/useApi';
import {
  calculateStatusTimeBreakdown,
  calculateCurrentTimeInStatus,
  formatDurationShort,
} from '@/lib/timeInStatus';
import { Task } from '@/services/apiService';

interface WithTimeInStatusProps {
  task: Task;
  children: (props: {
    statusHistory: ReturnType<typeof useGetTaskStatusHistoryQuery>['data'];
    breakdown: ReturnType<typeof calculateStatusTimeBreakdown>;
    currentTimeInStatus: string;
    currentTimeInStatusSeconds: number;
    isLoading: boolean;
  }) => React.ReactNode;
}

/**
 * Higher-order component/hook pattern for fetching and calculating
 * time in status data for a task.
 */
export function WithTimeInStatus({ task, children }: WithTimeInStatusProps) {
  const { data: statusHistory, isLoading: historyLoading } = useGetTaskStatusHistoryQuery(
    task.id,
    { skip: !task.id }
  );
  
  const { data: breakdownData, isLoading: breakdownLoading } = useGetTaskStatusTimeBreakdownQuery(
    task.id,
    { skip: !task.id }
  );

  const isLoading = historyLoading || breakdownLoading;

  const breakdown = React.useMemo(() => {
    if (breakdownData?.breakdown) {
      return breakdownData.breakdown.map(b => ({
        ...b,
        totalDuration: formatDurationShort(b.totalSeconds),
      }));
    }
    if (statusHistory) {
      return calculateStatusTimeBreakdown(statusHistory);
    }
    return [];
  }, [breakdownData, statusHistory]);

  const currentTimeData = React.useMemo(() => {
    if (breakdownData) {
      return {
        seconds: breakdownData.timeInCurrentStatusSeconds,
        formatted: formatDurationShort(breakdownData.timeInCurrentStatusSeconds),
      };
    }
    if (statusHistory) {
      const calc = calculateCurrentTimeInStatus(task, statusHistory);
      if (calc) {
        return {
          seconds: calc.timeInCurrentStatus,
          formatted: calc.timeInCurrentStatusFormatted,
        };
      }
    }
    return { seconds: 0, formatted: 'Unknown' };
  }, [breakdownData, statusHistory, task]);

  return (
    <>
      {children({
        statusHistory,
        breakdown,
        currentTimeInStatus: currentTimeData.formatted,
        currentTimeInStatusSeconds: currentTimeData.seconds,
        isLoading,
      })}
    </>
  );
}

/**
 * Hook for using time in status data
 */
export function useTimeInStatus(taskId: number | undefined) {
  const { data: statusHistory, isLoading: historyLoading, refetch: refetchHistory } = useGetTaskStatusHistoryQuery(
    taskId,
    { skip: !taskId }
  );
  
  const { data: breakdownData, isLoading: breakdownLoading, refetch: refetchBreakdown } = useGetTaskStatusTimeBreakdownQuery(
    taskId,
    { skip: !taskId }
  );

  const isLoading = historyLoading || breakdownLoading;

  const refetch = React.useCallback(() => {
    refetchHistory();
    refetchBreakdown();
  }, [refetchHistory, refetchBreakdown]);

  return {
    statusHistory,
    breakdown: breakdownData?.breakdown,
    currentStatus: breakdownData?.currentStatus,
    currentStatusSince: breakdownData?.currentStatusSince,
    timeInCurrentStatusSeconds: breakdownData?.timeInCurrentStatusSeconds,
    timeInCurrentStatusFormatted: breakdownData?.timeInCurrentStatusSeconds 
      ? formatDurationShort(breakdownData.timeInCurrentStatusSeconds) 
      : undefined,
    totalTrackedSeconds: breakdownData?.totalTrackedSeconds,
    isLoading,
    refetch,
  };
}
