import React, { useState, useCallback } from "react";
import { Clock, History, Target, PlayCircle } from "lucide-react";
import { TaskTimer, formatDurationShort } from "./TaskTimer";
import { TimeEstimateInput, formatEstimate } from "./TimeEstimateInput";
import { TimeLogList, TimeLog } from "./TimeLogList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TimeTrackingSectionProps {
  taskId: number;
  timeEstimate?: number; // in minutes
  timeLogs?: TimeLog[];
  isTimerRunning?: boolean;
  currentElapsedTime?: number; // in seconds
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  onStopTimer?: (description: string) => void;
  onUpdateEstimate?: (minutes: number) => void;
  onDeleteTimeLog?: (logId: number) => void;
  onEditTimeLog?: (log: TimeLog) => void;
  className?: string;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  taskId,
  timeEstimate,
  timeLogs = [],
  isTimerRunning = false,
  currentElapsedTime = 0,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
  onUpdateEstimate,
  onDeleteTimeLog,
  onEditTimeLog,
  className,
}) => {
  const [logDescription, setLogDescription] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);

  // Calculate total logged time
  const totalLoggedSeconds = timeLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalLoggedMinutes = Math.floor(totalLoggedSeconds / 60);

  // Calculate progress against estimate
  const estimateProgress = timeEstimate && timeEstimate > 0
    ? Math.min((totalLoggedMinutes / timeEstimate) * 100, 100)
    : 0;

  const handleStop = useCallback(() => {
    setShowLogForm(true);
  }, []);

  const handleSaveLog = useCallback(() => {
    onStopTimer?.(logDescription);
    setLogDescription("");
    setShowLogForm(false);
  }, [logDescription, onStopTimer]);

  const handleCancelLog = useCallback(() => {
    setLogDescription("");
    setShowLogForm(false);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Time Tracking</h3>
      </div>

      {/* Timer Controls */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <TaskTimer
          taskId={taskId}
          isRunning={isTimerRunning}
          elapsedTime={currentElapsedTime}
          onStart={onStartTimer}
          onPause={onPauseTimer}
          onStop={handleStop}
          variant="detail"
        />

        {/* Log Description Form (shown after stopping) */}
        {showLogForm && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            <Label htmlFor="log-description" className="text-xs">
              What did you work on?
            </Label>
            <Input
              id="log-description"
              value={logDescription}
              onChange={(e) => setLogDescription(e.target.value)}
              placeholder="e.g., Fixed bug in authentication flow..."
              className="text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelLog}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveLog}>
                Save Time Log
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Time Estimate */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time Estimate</span>
          </div>
          <TimeEstimateInput
            value={timeEstimate}
            onSave={onUpdateEstimate}
            readOnly={!onUpdateEstimate}
          />
        </div>
        
        {/* Progress bar */}
        {timeEstimate && timeEstimate > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDurationShort(totalLoggedSeconds)} logged</span>
              <span>{formatEstimate(timeEstimate)} estimated</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  estimateProgress >= 100
                    ? "bg-destructive"
                    : estimateProgress >= 80
                    ? "bg-amber-500"
                    : "bg-green-500"
                )}
                style={{ width: `${estimateProgress}%` }}
              />
            </div>
            {estimateProgress >= 100 && (
              <p className="text-xs text-destructive">
                Time estimate exceeded by {formatDurationShort(totalLoggedSeconds - timeEstimate * 60)}
              </p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Time Logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time History</span>
            <span className="text-xs text-muted-foreground">
              ({timeLogs.length} entries)
            </span>
          </div>
        </div>
        <TimeLogList
          timeLogs={timeLogs}
          onDelete={onDeleteTimeLog}
          onEdit={onEditTimeLog}
          maxItems={5}
        />
      </div>
    </div>
  );
};

export default TimeTrackingSection;
