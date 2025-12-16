import React, { useEffect } from "react";
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectStatusesQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
  TaskStatus as TaskStatusType
} from "@/hooks/useApi";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/hooks/useApi";
import {
  EllipsisVertical,
  MessageSquareMore,
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
  CheckCircle2,
  Plus,
  Pencil
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BoardProps = {
  id: string;
  tasks?: TaskType[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

// Default statuses (fallback if API fails)
const DEFAULT_STATUSES = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({
  id,
  tasks: propTasks,
  tasksLoading,
  tasksError,
  refetchTasks
}: BoardProps) => {
  // Fetch statuses from API
  const { data: statusesData, isLoading: statusesLoading, refetch: refetchStatuses } = useGetProjectStatusesQuery(
    Number(id)
  );

  // Get status names from API data or use defaults
  const statusNames = React.useMemo(() => {
    if (statusesData && statusesData.length > 0) {
      return statusesData.map((s: TaskStatusType) => s.name);
    }
    return DEFAULT_STATUSES;
  }, [statusesData]);

  // Fallback to fetching data if not provided via props (for backward compatibility)
  const { data: fetchedTasks, isLoading: fetchedLoading, error: fetchedError, refetch: fetchedRefetch } = useGetTasksQuery(
    { projectId: Number(id) },
    { skip: !!propTasks }
  );

  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = (tasksLoading !== undefined ? tasksLoading : fetchedLoading) || statusesLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;
  const refetch = refetchTasks || fetchedRefetch;

  const [updateTask] = useUpdateTaskMutation();
  const [selectedTask, setSelectedTask] = React.useState<{ taskId: number; editMode: boolean } | null>(null);

  // Status management state
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState<TaskStatusType | null>(null);
  const [statusModalMode, setStatusModalMode] = React.useState<'add' | 'edit'>('add');
  const [isDeleteStatusModalOpen, setIsDeleteStatusModalOpen] = React.useState(false);
  const [statusToDelete, setStatusToDelete] = React.useState<TaskStatusType | null>(null);

  const moveTask = async (taskId: number, toStatus: string) => {
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

  // Status management handlers
  const handleAddStatus = () => {
    setStatusModalMode('add');
    setEditingStatus(null);
    setIsStatusModalOpen(true);
  };

  const handleEditStatus = (statusName: string) => {
    // Find the status object from API data
    const statusObj = statusesData?.find((s: TaskStatusType) => s.name === statusName);
    setStatusModalMode('edit');
    setEditingStatus(statusObj || null);
    setIsStatusModalOpen(true);
  };

  const handleDeleteStatus = (statusName: string) => {
    // Find the status object from API data
    const statusObj = statusesData?.find((s: TaskStatusType) => s.name === statusName);
    setStatusToDelete(statusObj || null);
    setIsDeleteStatusModalOpen(true);
  };

  // Callback to refresh statuses after CRUD operations
  const handleStatusChange = () => {
    refetchStatuses();
    refetch(); // Also refetch tasks in case status names changed
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-4">
          {DEFAULT_STATUSES.map((status) => (
            <Card key={status} className="w-80 flex-shrink-0">
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
    <div className="container mx-auto p-6 overflow-x-auto">
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-6 min-w-max pb-4">
          {statusNames.map((status: string) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              onTaskSelect={setSelectedTask}
              onAddStatus={handleAddStatus}
              onEditStatus={handleEditStatus}
              onDeleteStatus={handleDeleteStatus}
            />
          ))}
        </div>
      </DndProvider>
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          taskId={selectedTask.taskId}
          projectId={Number(id)}
          editMode={selectedTask.editMode}
        />
      )}

      {/* Status Management Modal */}
      <StatusManagementModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setEditingStatus(null);
        }}
        mode={statusModalMode}
        editingStatus={editingStatus}
        projectId={id}
        onSuccess={handleStatusChange}
      />

      {/* Delete Status Confirmation Modal */}
      <DeleteStatusModal
        isOpen={isDeleteStatusModalOpen}
        onClose={() => {
          setIsDeleteStatusModalOpen(false);
          setStatusToDelete(null);
        }}
        status={statusToDelete}
        projectId={id}
        onSuccess={handleStatusChange}
      />
    </div>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  onTaskSelect: (task: { taskId: number; editMode: boolean }) => void;
  onEditStatus: (status: string) => void;
  onDeleteStatus: (status: string) => void;
  onAddStatus: () => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  onTaskSelect,
  onEditStatus,
  onDeleteStatus,
  onAddStatus,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver()
    }),
  }));

  const tasksCount = tasks.filter((task) => (task.status || "To Do") === status).length;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: "outline" | "secondary" | "default"; icon: any; className: string }> = {
      "To Do": {
        variant: "outline",
        icon: ListIcon,
        className: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
      },
      "Work In Progress": {
        variant: "secondary",
        icon: Activity,
        className: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      },
      "Under Review": {
        variant: "outline",
        icon: Eye,
        className: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
      },
      "Completed": {
        variant: "default",
        icon: CheckCircle2,
        className: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      },
    };
    // Return default config for custom statuses
    return configs[status] || {
      variant: "outline" as const,
      icon: Target,
      className: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
    };
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <Card
      ref={(instance) => {
        drop(instance);
      }}
      className={cn(
        "w-80 flex-shrink-0 transition-all duration-300 ease-out",
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAddStatus()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditStatus(status)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteStatus(status)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          "cursor-pointer transition-all duration-300 hover:shadow-md group",
          isDragging && "opacity-60 scale-95 rotate-2"
        )}
        onClick={handleCardClick}
      >
      <CardContent className="p-4 space-y-3">
        {/* Image attachment */}
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
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight flex-1">
            {task.title}
          </h4>

          {/* Action menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={handleMenuClick}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <EllipsisVertical size={14} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-6 z-30 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 w-32">
                <button
                  onClick={(e) => handleMenuAction('view', e)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={(e) => handleMenuAction('edit', e)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
                <div className="border-t border-gray-100 dark:border-gray-600 my-1" />
                <button
                  onClick={(e) => handleMenuAction('delete', e)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

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
            <span className="text-[10px] text-gray-400">+{taskTagsSplit.length - 2}</span>
          )}
        </div>

        {/* Due date warning if applicable */}
        {dueDateStatus && (
          <Badge variant={dueDateStatus.variant} className="text-[10px] px-1.5 py-0">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
            {dueDateStatus.text}
          </Badge>
        )}

        {/* Footer - Assignee and metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            {task.assignee ? (
              <>
                <img
                  src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                  alt={task.assignee.username}
                  className="h-5 w-5 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {task.assignee.username}
                </span>
              </>
            ) : task.author ? (
              <>
                <img
                  src={`https://luid-pm-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl!}`}
                  alt={task.author.username}
                  className="h-5 w-5 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {task.author.username}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Unassigned</span>
            )}
          </div>

          {/* Right side - dates and comments */}
          <div className="flex items-center gap-2 text-gray-400">
            {formattedDueDate && (
              <div className="flex items-center gap-1 text-[10px]">
                <Clock size={10} />
                <span>{formattedDueDate}</span>
              </div>
            )}
            {numberOfComments > 0 && (
              <div className="flex items-center gap-0.5 text-[10px]">
                <MessageSquareMore size={10} />
                <span>{numberOfComments}</span>
              </div>
            )}
          </div>
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

// Status Management Modal Component
type StatusManagementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  editingStatus: TaskStatusType | null;
  projectId: string;
  onSuccess: () => void;
};

const StatusManagementModal = ({
  isOpen,
  onClose,
  mode,
  editingStatus,
  projectId,
  onSuccess,
}: StatusManagementModalProps) => {
  const [statusName, setStatusName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [createStatus] = useCreateStatusMutation();
  const [updateStatus] = useUpdateStatusMutation();

  React.useEffect(() => {
    if (editingStatus) {
      setStatusName(editingStatus.name);
    } else {
      setStatusName('');
    }
  }, [editingStatus, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) return;

    setIsLoading(true);
    try {
      if (mode === 'add') {
        await createStatus({
          projectId: Number(projectId),
          name: statusName.trim(),
        }).unwrap();
      } else if (editingStatus) {
        await updateStatus({
          projectId: Number(projectId),
          statusId: editingStatus.id,
          name: statusName.trim(),
        }).unwrap();
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Status' : 'Edit Status'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a new status column for your board.'
              : 'Update the status name.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="statusName">Status Name</Label>
              <Input
                id="statusName"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                placeholder="e.g., In Review, Testing, Blocked"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!statusName.trim() || isLoading}>
              {isLoading ? 'Saving...' : mode === 'add' ? 'Add Status' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Delete Status Confirmation Modal
type DeleteStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatusType | null;
  projectId: string;
  onSuccess: () => void;
};

const DeleteStatusModal = ({
  isOpen,
  onClose,
  status,
  projectId,
  onSuccess,
}: DeleteStatusModalProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteStatus] = useDeleteStatusMutation();

  const handleDelete = async () => {
    if (!status) return;

    setIsLoading(true);
    try {
      await deleteStatus({
        projectId: Number(projectId),
        statusId: status.id,
        moveTasksTo: 'To Do',
      }).unwrap();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to delete status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Status</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the "{status?.name}" status?
            {status?.isDefault && (
              <span className="block mt-2 text-destructive font-medium">
                Warning: This is a default status and cannot be deleted.
              </span>
            )}
            {!status?.isDefault && (
              <span className="block mt-2">
                All tasks with this status will be moved to "To Do".
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || status?.isDefault}
          >
            {isLoading ? 'Deleting...' : 'Delete Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoardView;