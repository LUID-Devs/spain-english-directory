import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { useAgentTasks, useUpdateTaskAssignmentStatus, type TaskAssignment } from "@/hooks/useMissionControl";
import { toast } from "sonner";

// Lazy load TaskDetailModal to reduce bundle size
const TaskDetailModal = React.lazy(() => import("@/components/TaskDetailModal"));

// Column definitions with WIP limits
interface ColumnConfig {
  id: string;
  title: string;
  color: string;
  wipLimit: number | null; // null = no limit
}

const columns: ColumnConfig[] = [
  { id: "inbox", title: "Inbox", color: "bg-gray-500", wipLimit: null },
  { id: "assigned", title: "Assigned", color: "bg-blue-500", wipLimit: 10 },
  { id: "in_progress", title: "In Progress", color: "bg-yellow-500", wipLimit: 3 }, // Strict limit to prevent multitasking
  { id: "review", title: "Review", color: "bg-purple-500", wipLimit: 5 },
  { id: "completed", title: "Done", color: "bg-green-500", wipLimit: null },
];

// Workflow enforcement: defines valid transitions between agent assignment statuses
// A task can only move to the next status in the chain (or back)
const WORKFLOW_CHAIN = ["inbox", "assigned", "in_progress", "review", "completed"];

// Check if a status transition is valid according to workflow
const isValidWorkflowTransition = (fromStatus: string, toStatus: string): boolean => {
  const fromIndex = WORKFLOW_CHAIN.indexOf(fromStatus);
  const toIndex = WORKFLOW_CHAIN.indexOf(toStatus);
  
  if (fromIndex === -1 || toIndex === -1) {
    // Unknown statuses - allow any transition for flexibility
    return true;
  }
  
  // Allow: same status, moving forward by one step, or moving backward any amount
  return toIndex <= fromIndex + 1;
};

// Get WIP limit for a column
const getWipLimit = (columnId: string): number | null => {
  const column = columns.find(c => c.id === columnId);
  return column?.wipLimit ?? null;
};

// Check if moving to a column would exceed WIP limit
const wouldExceedWipLimit = (
  targetColumnId: string, 
  tasksInColumn: TaskAssignment[], 
  movingTaskId?: number
): { exceeded: boolean; limit: number | null; current: number } => {
  const limit = getWipLimit(targetColumnId);
  const current = tasksInColumn.length;
  
  if (limit === null) {
    return { exceeded: false, limit: null, current };
  }
  
  // If we're moving a task already in this column, don't count it as +1
  const isTaskAlreadyInColumn = movingTaskId && tasksInColumn.some(t => t.task?.id === movingTaskId);
  const effectiveCount = isTaskAlreadyInColumn ? current : current + 1;
  
  return { exceeded: effectiveCount > limit, limit, current };
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-gray-300 text-black",
};

const characterEmojis: Record<string, string> = {
  "mr-krabs": "🦀",
  "spongebob": "🧽",
  "squidward": "🦑",
  "sandy": "🐿️",
  "karen": "🖥️",
  "patrick": "⭐",
  "plankton": "🦠",
  "gary": "🐌",
  "mrs-puff": "🐡",
  "mermaid-man": "🦸",
};

export const TaskBoard: React.FC = () => {
  const { data: assignments, isLoading, refetch } = useAgentTasks();
  const updateAssignmentStatus = useUpdateTaskAssignmentStatus();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);

  // Listen for task updates and refresh the board
  useEffect(() => {
    const handleTaskUpdated = () => {
      refetch();
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    return () => window.removeEventListener('taskUpdated', handleTaskUpdated);
  }, [refetch]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.id] = (assignments || []).filter(
        (a: TaskAssignment) => a.status === col.id
      );
      return acc;
    }, {} as Record<string, TaskAssignment[]>);
  }, [assignments]);

  // Handle moving a task to a different column
  const handleMoveTask = useCallback(async (
    taskId: number, 
    fromStatus: string, 
    toStatus: string
  ) => {
    // Workflow enforcement: Check if transition is valid
    if (!isValidWorkflowTransition(fromStatus, toStatus)) {
      const fromTitle = columns.find(c => c.id === fromStatus)?.title || fromStatus;
      const toTitle = columns.find(c => c.id === toStatus)?.title || toStatus;
      
      toast.error(
        `Workflow violation: Cannot move task directly from "${fromTitle}" to "${toTitle}". ` +
        `Tasks must flow through the proper sequence: Inbox → Assigned → In Progress → Review → Done`,
        { duration: 5000 }
      );
      return;
    }

    // WIP Limit check
    const targetTasks = tasksByStatus[toStatus] || [];
    const wipCheck = wouldExceedWipLimit(toStatus, targetTasks, taskId);
    
    if (wipCheck.exceeded && wipCheck.limit !== null) {
      const toTitle = columns.find(c => c.id === toStatus)?.title || toStatus;
      toast.error(
        `WIP Limit reached: "${toTitle}" is limited to ${wipCheck.limit} tasks. ` +
        `Please complete or move existing tasks before adding more.`,
        { duration: 4000 }
      );
      return;
    }

    try {
      // Find the assignment to update
      const assignment = (assignments || []).find((a: TaskAssignment) => a.task?.id === taskId);
      if (!assignment) {
        toast.error("Task assignment not found");
        return;
      }

      await updateAssignmentStatus.mutateAsync({
        assignmentId: assignment.id,
        status: toStatus,
      });

      // Show success message
      if (toStatus === "completed") {
        toast.success("Task completed! 🎉", { duration: 2000 });
      } else {
        const toTitle = columns.find(c => c.id === toStatus)?.title || toStatus;
        toast.success(`Task moved to ${toTitle}`, { duration: 2000 });
      }
      
      refetch();
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to move task. Please try again.");
    }
  }, [assignments, tasksByStatus, updateAssignmentStatus, refetch]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, taskId: number, currentStatus: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("currentStatus", currentStatus);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"), 10);
    const currentStatus = e.dataTransfer.getData("currentStatus");
    
    setDraggingTaskId(null);
    
    if (taskId && currentStatus && currentStatus !== targetStatus) {
      handleMoveTask(taskId, currentStatus, targetStatus);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scroll-smooth">
      {columns.map((column) => {
        const columnTasks = tasksByStatus[column.id] || [];
        const taskCount = columnTasks.length;
        const wipLimit = column.wipLimit;
        const isWipExceeded = wipLimit !== null && taskCount > wipLimit;
        const isWipWarning = wipLimit !== null && taskCount >= wipLimit * 0.8 && taskCount <= wipLimit;
        const wipStatus = wouldExceedWipLimit(column.id, columnTasks);

        return (
          <div 
            key={column.id} 
            className="min-w-[200px] sm:min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`
              flex items-center gap-2 mb-3 px-0.5 py-2 rounded-md
              ${isWipExceeded ? 'bg-destructive/10' : isWipWarning ? 'bg-amber-500/10' : ''}
            `}>
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${column.color}`} />
              <h3 className="font-medium text-sm truncate">{column.title}</h3>
              <Badge 
                variant={isWipExceeded ? "destructive" : isWipWarning ? "default" : "secondary"} 
                className={`
                  ml-auto text-xs flex-shrink-0
                  ${isWipWarning && !isWipExceeded ? 'bg-amber-500 text-white' : ''}
                `}
              >
                {taskCount}{wipLimit !== null && `/${wipLimit}`}
              </Badge>
              {isWipExceeded && (
                <span title="WIP limit exceeded!">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                </span>
              )}
              {isWipWarning && !isWipExceeded && (
                <span title="Approaching WIP limit">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                </span>
              )}
            </div>

            <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[500px]">
              <div className="space-y-2 pr-2">
                {columnTasks.map((assignment) => (
                  <Card
                    key={assignment.id}
                    draggable
                    onDragStart={(e) => assignment.task?.id && handleDragStart(e, assignment.task.id, column.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      cursor-grab hover:shadow-md transition-shadow
                      ${draggingTaskId === assignment.task?.id ? 'opacity-50 rotate-2' : ''}
                      active:cursor-grabbing
                    `}
                    onClick={() => {
                      if (assignment.task?.id) {
                        setSelectedTaskId(assignment.task.id);
                        setSelectedProjectId(assignment.task.project?.id);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      {/* Task Title */}
                      <p className="font-medium text-sm mb-2 line-clamp-2">
                        {assignment.task?.title || "Untitled Task"}
                      </p>

                      {/* Project */}
                      {assignment.task?.project && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {assignment.task.project.name}
                        </p>
                      )}

                      {/* Priority & Assignee */}
                      <div className="flex items-center justify-between">
                        {assignment.task?.priority && (
                          <Badge
                            className={`text-xs ${priorityColors[assignment.task.priority.toLowerCase()] || priorityColors.medium}`}
                          >
                            {assignment.task.priority}
                          </Badge>
                        )}

                        {assignment.agent && (
                          <span
                            className="text-lg"
                            title={assignment.agent.displayName}
                          >
                            {characterEmojis[assignment.agent.name] || "🤖"}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div 
                    className="text-center text-muted-foreground text-xs sm:text-sm py-6 sm:py-8 border-2 border-dashed rounded-lg px-2"
                  >
                    No tasks
                    {wipLimit !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Limit: {wipLimit} tasks
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}

      {/* Task Detail Modal */}
      <Suspense fallback={null}>
        <TaskDetailModal
          isOpen={selectedTaskId !== null}
          onClose={() => {
            setSelectedTaskId(null);
            setSelectedProjectId(undefined);
            // Refresh data when modal closes to reflect any changes
            refetch();
          }}
          taskId={selectedTaskId || 0}
          projectId={selectedProjectId}
        />
      </Suspense>
    </div>
  );
};

export default TaskBoard;
