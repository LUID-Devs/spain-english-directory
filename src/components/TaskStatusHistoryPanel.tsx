import React from 'react';
import { Clock, History, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTimeInStatus } from '@/components/TimeInStatus';
import { Task } from '@/services/apiService';
import { formatDuration, formatDurationShort } from '@/lib/timeInStatus';

interface TaskStatusHistoryPanelProps {
  task: Task;
}

export function TaskStatusHistoryPanel({ task }: TaskStatusHistoryPanelProps) {
  const {
    statusHistory,
    breakdown,
    currentStatus,
    currentStatusSince,
    timeInCurrentStatusSeconds,
    timeInCurrentStatusFormatted,
    totalTrackedSeconds,
    isLoading,
  } = useTimeInStatus(task.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Time in Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Time in Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No status history available for this task.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStatusText = currentStatus || task.status || 'Unknown';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Time in Status
        </CardTitle>
        <CardDescription>
          Total tracked: {totalTrackedSeconds ? formatDuration(totalTrackedSeconds) : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Current: {currentStatusText}</span>
          </div>
          <Badge variant="secondary" className="font-mono">
            {timeInCurrentStatusFormatted || 'N/A'}
          </Badge>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Status History</h4>
          <div className="space-y-1.5">
            {breakdown.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.status}</span>
                  <span className="text-xs text-muted-foreground">
                    ({item.entryCount} {item.entryCount === 1 ? 'entry' : 'entries'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    avg {formatDurationShort(item.averageDurationSeconds)}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatDurationShort(item.totalSeconds)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed History Timeline */}
        {statusHistory && statusHistory.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Transitions</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {statusHistory.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-xs">
                      {new Date(entry.enteredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="font-medium">{entry.status}</span>
                    {entry.durationSeconds && (
                      <span className="text-muted-foreground ml-2">
                        for {formatDurationShort(entry.durationSeconds)}
                      </span>
                    )}
                    {entry.enteredBy && (
                      <span className="text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" />
                        {entry.enteredBy.username}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
