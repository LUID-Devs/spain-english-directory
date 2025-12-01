import React, { useEffect } from "react";
import { useGetTasksQuery, useUpdateTaskMutation, useDeleteTaskMutation } from "@/hooks/useApi";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/hooks/useApi";
import { 
  EllipsisVertical, 
  MessageSquareMore, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Target,
  Activity,
  List as ListIcon,
  CheckCircle2
} from "lucide-react";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import TaskDetailModal from "@/components/TaskDetailModal";
import DeleteTaskModal from "@/components/DeleteTaskModal";
import type { DropTargetMonitor, DragSourceMonitor } from 'react-dnd';

// Literal type for status values
type TaskStatus = "To Do" | "Work In Progress" | "Under Review" | "Completed";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  tasks?: TaskType[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

const taskStatus: TaskStatus[] = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ 
  id, 
  setIsModalNewTaskOpen, 
  tasks: propTasks, 
  tasksLoading, 
  tasksError, 
  refetchTasks 
}: BoardProps) => {
  // Fallback to fetching data if not provided via props (for backward compatibility)
  const { data: fetchedTasks, isLoading: fetchedLoading, error: fetchedError, refetch: fetchedRefetch } = useGetTasksQuery(
    { projectId: Number(id) }, 
    { skip: !!propTasks }
  );
  
  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = tasksLoading !== undefined ? tasksLoading : fetchedLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;
  const refetch = refetchTasks || fetchedRefetch;

  const [updateTask] = useUpdateTaskMutation();
  const [selectedTask, setSelectedTask] = React.useState<{ taskId: number; editMode: boolean } | null>(null);

  const moveTask = async (taskId: number, toStatus: TaskStatus) => {
    try {
      // Use PUT /tasks/{id} with status update - optimistic update handles UI
      await updateTask({ taskId, task: { status: toStatus } }).unwrap();
      // No refetch needed - optimistic update handles this
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Listen for task updates from other components (like TaskDetailModal)
  useEffect(() => {
    const handleTaskUpdated = () => {
      refetch();
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <Card key={status}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{status}</CardTitle>
                  <Badge variant="secondary">0</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">An error occurred while fetching tasks</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              onTaskSelect={setSelectedTask}
            />
          ))}
        </div>
      </DndProvider>
      
      {/* Modal rendered at page level */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          taskId={selectedTask.taskId}
          editMode={selectedTask.editMode}
        />
      )}
    </div>
  );
};

type TaskColumnProps = {
  status: TaskStatus;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: TaskStatus) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  onTaskSelect: (task: { taskId: number; editMode: boolean }) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  onTaskSelect,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver()
    }),
  }));

  const tasksCount = tasks.filter((task) => (task.status || "To Do") === status).length;

  const getStatusConfig = (status: TaskStatus) => {
    const configs = {
      "To Do": {
        variant: "outline" as const,
        icon: ListIcon,
        className: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
      },
      "Work In Progress": {
        variant: "secondary" as const,
        icon: Activity,
        className: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      },
      "Under Review": {
        variant: "outline" as const,
        icon: Eye,
        className: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
      },
      "Completed": {
        variant: "default" as const,
        icon: CheckCircle2,
        className: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      },
    };
    return configs[status];
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <Card
      ref={(instance) => {
        drop(instance);
      }}
      className={cn(
        "transition-all duration-300 ease-out",
        config.className,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{status}</CardTitle>
            <Badge variant={config.variant} className="text-xs">
              {tasksCount}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 min-h-[200px]">
        {tasks
          .filter((task) => (task.status || "To Do") === status)
          .map((task) => (
            <Task key={task.id} task={task} onTaskSelect={onTaskSelect} />
          ))}
        
        {tasksCount === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <StatusIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              No {status.toLowerCase()} tasks
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag tasks here or create new ones
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type TaskProps = {
  task: TaskType;
  onTaskSelect: (task: { taskId: number; editMode: boolean }) => void;
};

const Task = ({ task, onTaskSelect }: TaskProps) => {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging()
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if dragging or if clicking on menu button
    if (!isDragging) {
      onTaskSelect({ taskId: task.id, editMode: false });
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    
    switch(action) {
      case 'view':
        onTaskSelect({ taskId: task.id, editMode: false });
        break;
      case 'edit':
        onTaskSelect({ taskId: task.id, editMode: true });
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task.id).unwrap();
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      // You could add a toast notification here
      alert(error?.data?.message || 'Failed to delete task. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const getPriorityConfig = (priority: TaskType["priority"]) => {
    const configs = {
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
    return configs[priority as keyof typeof configs] || { variant: "outline" as const, icon: Activity };
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (task.status === "Completed") return null;
    
    if (isBefore(dueDate, now)) {
      return { type: "overdue", text: "Overdue", variant: "destructive" as const };
    } else if (formatDistanceToNow(dueDate).includes("day") && parseInt(formatDistanceToNow(dueDate)) <= 2) {
      return { type: "due-soon", text: "Due soon", variant: "secondary" as const };
    }
    
    return null;
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;
  const dueDateStatus = getDueDateStatus();

  return (
    <>
      <Card
        ref={(instance) => {
          drag(instance);
        }}
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-md",
          isDragging && "opacity-60 scale-95 rotate-2"
        )}
        onClick={handleCardClick}
      >
      <CardContent className="p-4 space-y-3">
        {/* Image attachment */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="relative rounded-md overflow-hidden">
            <img
              src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
              alt={task.attachments[0].fileName}
              className="h-32 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
          {/* Header with menu */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Priority and tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {task.priority && (
                  <Badge variant={priorityConfig.variant} className="text-xs">
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                )}
                {taskTagsSplit.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Title and points */}
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                  {task.title}
                </h4>
                
              </div>
            </div>
            
            {/* Action menu */}
            <div className="relative ml-2">
              <button 
                onClick={handleMenuClick}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <EllipsisVertical size={14} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-8 z-30 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg py-1 w-36 backdrop-blur-sm">
                  <button
                    onClick={(e) => handleMenuAction('view', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('edit', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-600 my-1" />
                  <button
                    onClick={(e) => handleMenuAction('delete', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Dates */}
          {(formattedStartDate || formattedDueDate) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {formattedStartDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Start: {formattedStartDate}</span>
                </div>
              )}
              {formattedDueDate && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Due: {formattedDueDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
            {/* Avatars */}
            <div className="flex items-center space-x-2">
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <img
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                    alt={task.assignee.username}
                    className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {task.assignee.username}
                  </span>
                </div>
              )}
              {task.author && !task.assignee && (
                <div className="flex items-center space-x-1">
                  <img
                    src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl!}`}
                    alt={task.author.username}
                    className="h-6 w-6 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                    {task.author.username}
                  </span>
                </div>
              )}
            </div>

            {/* Comments */}
            {numberOfComments > 0 && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MessageSquareMore size={14} />
                <span className="text-xs">{numberOfComments}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={task.title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BoardView;