import { Task, useGetActiveTimerQuery, useStartTimerMutation, useStopTimerMutation } from "@/hooks/useApi";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Rocket,
  User,
  Users,
  Tag,
  ChevronRight,
  AlertTriangle,
  Target,
  Activity,
  Clock,
  List as ListIcon,
  CheckCircle2,
  MessageSquareMore
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTaskModal } from "@/contexts/TaskModalContext";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskTimer, formatDurationShort } from "@/components/TimeTracking";

type Props = {
  task: Task;
  isSelected?: boolean;
  onSelect?: (taskId: number, selected: boolean) => void;
  selectionMode?: boolean;
};

const PRIORITY_CONFIGS = {
  "Urgent": {
    variant: "destructive" as const,
    icon: AlertTriangle,
  },
  "High": {
    variant: "default" as const,
    icon: Target,
  },
  "Medium": {
    variant: "secondary" as const,
    icon: Activity,
  },
  "Low": {
    variant: "outline" as const,
    icon: Clock,
  },
  "Backlog": {
    variant: "outline" as const,
    icon: ListIcon,
  },
};

const STATUS_CONFIGS = {
  "Completed": { variant: "default" as const, icon: CheckCircle2 },
  "Work In Progress": { variant: "secondary" as const, icon: Activity },
  "Under Review": { variant: "outline" as const, icon: Clock },
  "To Do": { variant: "outline" as const, icon: ListIcon },
};

const DEFAULT_PRIORITY_CONFIG = { variant: "outline" as const, icon: Activity };
const DEFAULT_STATUS_CONFIG = { variant: "outline" as const, icon: ListIcon };

const getPriorityConfig = (priority: string) => {
  return PRIORITY_CONFIGS[priority as keyof typeof PRIORITY_CONFIGS] || DEFAULT_PRIORITY_CONFIG;
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIGS[status as keyof typeof STATUS_CONFIGS] || DEFAULT_STATUS_CONFIG;
};

const TaskCard = React.memo(({ task, isSelected = false, onSelect, selectionMode = false }: Props) => {
  const { openTaskModal } = useTaskModal();
  const taskTagsSplit = task.tags ? task.tags.split(",") : [];
  const numberOfComments = (task.comments && task.comments.length) || 0;
  
  // Get active timer from backend
  const { data: activeTimerData, refetch: refetchActiveTimer } = useGetActiveTimerQuery();
  const [startTimer] = useStartTimerMutation();
  const [stopTimer] = useStopTimerMutation();
  
  // Local timer state for UI updates
  const [localElapsedTime, setLocalElapsedTime] = useState(0);
  const [activeLogId, setActiveLogId] = useState<number | null>(null);
  
  // Check if this task has the active timer
  const isThisTaskActive = activeTimerData?.hasActiveTimer && activeTimerData.timer?.taskId === task.id;
  const isTimerRunning = !!isThisTaskActive;
  
  // Calculate elapsed time from server + local offset
  useEffect(() => {
    queueMicrotask(() => {
      if (isThisTaskActive && activeTimerData?.timer) {
        setActiveLogId(activeTimerData.timer.id);
        setLocalElapsedTime(activeTimerData.timer.elapsedMinutes * 60);
      } else {
        setActiveLogId(null);
        setLocalElapsedTime(0);
      }
    });
  }, [isThisTaskActive, activeTimerData]);
  
  // Local timer tick when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setLocalElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleClick = (e: React.MouseEvent) => {
    // If clicking the checkbox or timer controls, don't open modal
    if ((e.target as HTMLElement).closest('[data-checkbox]') || 
        (e.target as HTMLElement).closest('[data-timer]')) {
      return;
    }
    openTaskModal(task.id);
  };
  
  const handleTimerStart = useCallback(async () => {
    try {
      const result = await startTimer({ taskId: task.id }).unwrap();
      setActiveLogId(result.timeLog.id);
      refetchActiveTimer();
    } catch (error) {
      // Error already handled by hook with toast
    }
  }, [task.id, startTimer, refetchActiveTimer]);
  
  const handleTimerStop = useCallback(async () => {
    if (!activeLogId) return;
    
    try {
      await stopTimer(activeLogId).unwrap();
      setActiveLogId(null);
      setLocalElapsedTime(0);
      refetchActiveTimer();
    } catch (error) {
      // Error already handled by hook with toast
    }
  }, [activeLogId, stopTimer, refetchActiveTimer]);

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(task.id, checked);
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (task.status === "Completed" || task.status === "Done") return null;
    
    if (isBefore(dueDate, now)) {
      return { type: "overdue", text: "Overdue", variant: "destructive" as const };
    } else if (formatDistanceToNow(dueDate).includes("day") && parseInt(formatDistanceToNow(dueDate)) <= 2) {
      return { type: "due-soon", text: "Due soon", variant: "secondary" as const };
    }
    
    return null;
  };

  const priorityConfig = getPriorityConfig(task.priority || "");
  const statusConfig = getStatusConfig(task.status || "To Do");
  const dueDateStatus = getDueDateStatus();
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;
  
  return (
    <Card
      onClick={handleClick}
      className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Selection checkbox */}
        {selectionMode && (
          <div className="flex items-center gap-2 pb-2 border-b border-border/50" data-checkbox>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <span className="text-xs text-muted-foreground">Select</span>
          </div>
        )}
        {/* Attachment preview */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="relative rounded-md overflow-hidden -mx-1 -mt-1">
            <img
              src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              className="h-28 w-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {task.title}
        </h3>

        {/* Priority, Type and Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.priority && (
            <Badge variant={priorityConfig.variant} className="text-[10px] px-1.5 py-0">
              {task.priority}
            </Badge>
          )}
          {task.taskType && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {task.taskType}
            </Badge>
          )}
          {taskTagsSplit.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {tag.trim()}
            </Badge>
          ))}
          {taskTagsSplit.length > 2 && (
            <span className="text-[10px] text-muted-foreground">+{taskTagsSplit.length - 2}</span>
          )}
        </div>

        {/* Status and due date warning */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={statusConfig.variant} className="text-[10px] px-1.5 py-0">
            <StatusIcon className="h-2.5 w-2.5 mr-1" aria-hidden="true" />
            {task.status || "To Do"}
          </Badge>
          {dueDateStatus && (
            <Badge variant={dueDateStatus.variant} className="text-[10px] px-1.5 py-0">
              <AlertTriangle className="h-2.5 w-2.5 mr-1" aria-hidden="true" />
              {dueDateStatus.text}
            </Badge>
          )}
        </div>

        {/* Footer - Assignee and metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            {task.assignee ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl}`}
                    alt={task.assignee.username}
                  />
                  <AvatarFallback className="text-[10px]">
                    {task.assignee.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {task.assignee.username}
                </span>
              </>
            ) : task.author ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl}`}
                    alt={task.author.username}
                  />
                  <AvatarFallback className="text-[10px]">
                    {task.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {task.author.username}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>

          {/* Right side - timer, dates and comments */}
          <div className="flex items-center gap-2 text-muted-foreground">
            {/* Timer Button */}
            <div data-timer>
              <TaskTimer
                taskId={task.id}
                isRunning={isTimerRunning}
                elapsedTime={localElapsedTime}
                onStart={handleTimerStart}
                onStop={handleTimerStop}
                variant="compact"
              />
            </div>
            
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px]">
                <Clock size={10} aria-hidden="true" />
                <span>{format(new Date(task.dueDate), "P")}</span>
              </div>
            )}
            {numberOfComments > 0 && (
              <div className="flex items-center gap-0.5 text-[10px]">
                <MessageSquareMore size={10} aria-hidden="true" />
                <span>{numberOfComments}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default TaskCard;
