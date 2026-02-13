import React from "react";
import { Clock, User, Calendar, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TimeLog {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  duration: number; // in seconds
  description?: string;
  startedAt: string;
  endedAt: string;
  createdAt: string;
}

interface TimeLogListProps {
  timeLogs: TimeLog[];
  onDelete?: (logId: number) => void;
  onEdit?: (log: TimeLog) => void;
  className?: string;
  maxItems?: number;
  showTaskTitle?: boolean;
}

// Format seconds into HH:MM:SS
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Format seconds into readable text
const formatDurationReadable = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
};

const TimeLogItem: React.FC<{
  log: TimeLog;
  onDelete?: (logId: number) => void;
  onEdit?: (log: TimeLog) => void;
  showTaskTitle?: boolean;
}> = ({ log, onDelete, onEdit, showTaskTitle }) => {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0 group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        {log.userAvatar ? (
          <img
            src={log.userAvatar}
            alt={log.userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium truncate">{log.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {/* Actions */}
          {(onDelete || onEdit) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Actions for time log by ${log.userName}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(log)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(log.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description */}
        {log.description && (
          <p className="text-sm text-foreground mt-1">{log.description}</p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-mono font-medium text-foreground">
              {formatDurationReadable(log.duration)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(log.startedAt), "MMM d, h:mm a")}</span>
            <span>→</span>
            <span>{format(new Date(log.endedAt), "h:mm a")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TimeLogList: React.FC<TimeLogListProps> = ({
  timeLogs,
  onDelete,
  onEdit,
  className,
  maxItems,
  showTaskTitle = false,
}) => {
  const sortedLogs = [...timeLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayLogs = maxItems ? sortedLogs.slice(0, maxItems) : sortedLogs;
  const hasMore = maxItems && sortedLogs.length > maxItems;

  if (timeLogs.length === 0) {
    return (
      <div className={cn("text-center py-6", className)}>
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No time logged yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start the timer to track your work
        </p>
      </div>
    );
  }

  // Calculate total time
  const totalSeconds = timeLogs.reduce((sum, log) => sum + log.duration, 0);

  return (
    <div className={cn("space-y-1", className)}>
      {/* Total time summary */}
      <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg mb-3">
        <span className="text-sm font-medium">Total Time</span>
        <span className="text-sm font-mono font-semibold">
          {formatDuration(totalSeconds)}
        </span>
      </div>

      {/* Time log entries */}
      <div className="divide-y divide-border">
        {displayLogs.map((log) => (
          <TimeLogItem
            key={log.id}
            log={log}
            onDelete={onDelete}
            onEdit={onEdit}
            showTaskTitle={showTaskTitle}
          />
        ))}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="text-center py-2">
          <Button variant="ghost" size="sm" className="text-xs">
            View {sortedLogs.length - maxItems!} more entries
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeLogList;
