import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, Square, Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskTimerProps {
  taskId: number;
  isRunning?: boolean;
  elapsedTime?: number; // in seconds
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  className?: string;
  variant?: "card" | "detail" | "compact";
}

// Format seconds into HH:MM:SS
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Format seconds into readable text (e.g., "2h 30m")
export const formatDurationShort = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const TaskTimer: React.FC<TaskTimerProps> = ({
  taskId,
  isRunning = false,
  elapsedTime = 0,
  onStart,
  onPause,
  onStop,
  className,
  variant = "card",
}) => {
  const [localElapsed, setLocalElapsed] = useState(elapsedTime);
  const [localIsRunning, setLocalIsRunning] = useState(isRunning);

  // Sync with props
  useEffect(() => {
    setLocalElapsed(elapsedTime);
    setLocalIsRunning(isRunning);
  }, [elapsedTime, isRunning]);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (localIsRunning) {
      interval = setInterval(() => {
        setLocalElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [localIsRunning]);

  const handleStart = useCallback(() => {
    setLocalIsRunning(true);
    onStart?.();
  }, [onStart]);

  const handlePause = useCallback(() => {
    setLocalIsRunning(false);
    onPause?.();
  }, [onPause]);

  const handleStop = useCallback(() => {
    setLocalIsRunning(false);
    onStop?.();
  }, [onStop]);

  // Compact variant for card view
  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          localIsRunning ? handlePause() : handleStart();
        }}
        className={cn(
          "h-6 px-2 text-[10px] gap-1 transition-colors",
          localIsRunning && "text-amber-500 hover:text-amber-600",
          className
        )}
      >
        {localIsRunning ? (
          <>
            <Pause className="h-3 w-3" />
            <span className="font-mono">{formatDurationShort(localElapsed)}</span>
          </>
        ) : (
          <>
            <Play className="h-3 w-3" />
            <span>Start</span>
          </>
        )}
      </Button>
    );
  }

  // Card variant - small button with timer
  if (variant === "card") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {localIsRunning ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePause();
              }}
              className="h-6 w-6 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
            >
              <Pause className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-mono text-amber-600 min-w-[50px]">
              {formatDuration(localElapsed)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleStop();
              }}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <Square className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="h-6 px-2 text-[10px] gap-1"
          >
            <Play className="h-3 w-3" />
            <span>Start</span>
          </Button>
        )}
      </div>
    );
  }

  // Detail variant - full timer for modal
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
        <Timer className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-mono font-medium min-w-[70px]">
          {formatDuration(localElapsed)}
        </span>
      </div>
      
      {localIsRunning ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            className="gap-1"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleStop}
            className="gap-1"
          >
            <Square className="h-4 w-4" />
            Stop & Log
          </Button>
        </>
      ) : (
        <Button
          variant="default"
          size="sm"
          onClick={handleStart}
          className="gap-1"
        >
          <Play className="h-4 w-4" />
          Start Timer
        </Button>
      )}
    </div>
  );
};

export default TaskTimer;
