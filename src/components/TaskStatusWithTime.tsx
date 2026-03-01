import React from 'react';
import { Task } from '@/services/apiService';
import { useTimeInStatus } from '@/components/TimeInStatus';
import { TimeInStatusTooltip, TaskStatusBadge } from '@/components/TimeInStatus';
import { formatDurationShort } from '@/lib/timeInStatus';

interface TaskStatusWithTimeProps {
  task: Task;
  showTime?: boolean;
}

/**
 * Status badge that displays time in current status
 * Shows a tooltip with full time breakdown on hover
 */
export function TaskStatusWithTime({ task, showTime = true }: TaskStatusWithTimeProps) {
  const {
    breakdown,
    currentStatus,
    timeInCurrentStatusSeconds,
    timeInCurrentStatusFormatted,
    isLoading,
  } = useTimeInStatus(task.id);

  const currentStatusText = currentStatus || task.status || 'Unknown';
  const timeText = showTime && timeInCurrentStatusFormatted 
    ? timeInCurrentStatusFormatted 
    : undefined;

  return (
    <TimeInStatusTooltip
      taskId={task.id}
      currentStatus={currentStatusText}
      currentTimeInStatus={timeInCurrentStatusFormatted}
      breakdown={breakdown}
      statusHistory={undefined} // We use breakdown instead
      isLoading={isLoading}
    >
      <TaskStatusBadge
        status={currentStatusText}
        timeInStatus={timeText}
      />
    </TimeInStatusTooltip>
  );
}

interface TaskStatusCellProps {
  task: Task;
  showTime?: boolean;
  compact?: boolean;
}

/**
 * Table cell component for displaying task status with time
 */
export function TaskStatusCell({ task, showTime = true, compact = false }: TaskStatusCellProps) {
  const {
    breakdown,
    currentStatus,
    timeInCurrentStatusSeconds,
    timeInCurrentStatusFormatted,
    isLoading,
  } = useTimeInStatus(task.id);

  const currentStatusText = currentStatus || task.status || 'Unknown';

  if (compact) {
    return (
      <TimeInStatusTooltip
        taskId={task.id}
        currentStatus={currentStatusText}
        currentTimeInStatus={timeInCurrentStatusFormatted}
        breakdown={breakdown}
        isLoading={isLoading}
      >
        <span className="inline-flex items-center gap-1.5 cursor-help">
          <span className="text-sm">{currentStatusText}</span>
          {showTime && timeInCurrentStatusFormatted && (
            <span className="text-xs text-muted-foreground font-mono">
              {timeInCurrentStatusFormatted}
            </span>
          )}
        </span>
      </TimeInStatusTooltip>
    );
  }

  return (
    <TimeInStatusTooltip
      taskId={task.id}
      currentStatus={currentStatusText}
      currentTimeInStatus={timeInCurrentStatusFormatted}
      breakdown={breakdown}
      isLoading={isLoading}
    >
      <div className="flex flex-col gap-0.5 cursor-help">
        <span className="text-sm font-medium">{currentStatusText}</span>
        {showTime && timeInCurrentStatusFormatted && (
          <span className="text-xs text-muted-foreground font-mono">
            {timeInCurrentStatusFormatted}
          </span>
        )}
      </div>
    </TimeInStatusTooltip>
  );
}
