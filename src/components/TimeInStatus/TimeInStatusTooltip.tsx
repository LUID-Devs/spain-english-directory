import React from 'react';
import { Clock, History } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskStatusHistory, StatusTimeBreakdown, formatDuration } from '@/lib/timeInStatus';

interface TimeInStatusTooltipProps {
  taskId: number;
  currentStatus?: string;
  statusHistory?: TaskStatusHistory[];
  breakdown?: StatusTimeBreakdown[];
  isLoading?: boolean;
  currentTimeInStatus?: string;
  children: React.ReactNode;
}

export function TimeInStatusTooltip({
  taskId,
  currentStatus,
  statusHistory,
  breakdown,
  isLoading,
  currentTimeInStatus,
  children,
}: TimeInStatusTooltipProps) {
  if (isLoading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent side="top" className="w-72 p-0">
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return <>{children}</>;
  }

  const totalTime = breakdown.reduce((sum, item) => sum + item.totalSeconds, 0);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="w-80 p-0">
          <div className="p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 border-b pb-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time in Status</span>
            </div>

            {/* Current Status */}
            {currentStatus && currentTimeInStatus && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current ({currentStatus}):</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium">{currentTimeInStatus}</span>
                </div>
              </div>
            )}

            {/* Status Breakdown */}
            <div className="space-y-1.5">
              {breakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate max-w-[100px]">
                    {item.status}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.entryCount}x
                    </span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {formatDuration(item.totalSeconds, true)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Total tracked:</span>
              <span className="font-medium">{formatDuration(totalTime)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TaskStatusBadgeProps {
  status: string;
  timeInStatus?: string;
  onClick?: () => void;
}

export function TaskStatusBadge({ status, timeInStatus, onClick }: TaskStatusBadgeProps) {
  const getVariant = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'work in progress':
      case 'in progress':
        return 'secondary';
      case 'under review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge
      variant={getVariant(status)}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        {status}
        {timeInStatus && (
          <span className="opacity-75 font-mono text-xs">· {timeInStatus}</span>
        )}
      </span>
    </Badge>
  );
}
