import {
  Priority,
  Project,
  Status,
  Task,
  useUpdateTaskStatusMutation,
} from "@/hooks/useApi";
import { useAuth } from "@/app/authProvider";
import { useGetProjectsQuery, useGetTasksByUserQuery, useGetUsersQuery } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/stores/globalStore";
import React, { Suspense } from "react";
import Header from "@/components/Header";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskModal } from "@/contexts/TaskModalContext";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useUndoableBulkDelete } from "@/hooks/useUndoableBulkDelete";
import BulkActionsToolbar from "@/components/BulkActionsToolbar";
import BulkDeleteConfirmationModal from "@/components/BulkDeleteConfirmationModal";
import ModalNewTask from "@/components/ModalNewTask";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { TodayTimeWidget, WeeklyTimeWidget } from "@/components/TimeTracking";

// Lazy load charts to reduce initial bundle size
const DashboardCharts = React.lazy(() => import("@/components/DashboardCharts"));

// Helper functions for styling
const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
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

const getPriorityVariant = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'secondary';
    case 'medium':
      return 'outline';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { openTaskModal } = useTaskModal();
  
  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const [updateTaskStatusMutation] = useUpdateTaskStatusMutation();
  
  // Undoable bulk delete hook
  const { deleteWithUndo, isPending: isDeletePending, pendingCount } = useUndoableBulkDelete({
    duration: 10000, // 10 seconds to undo
    onDelete: async (ids: number[]) => {
      const result = await apiService.bulkDeleteTasks(ids);
      return { deletedCount: result.deletedCount || ids.length };
    },
    onCancel: () => {
      // Tasks were restored (undo clicked) - just clear selection
      setSelectedTaskIds(new Set());
    },
    itemName: 'task',
    pluralName: 'tasks',
  });
  
  // Improved user ID resolution - use database userId first, then fallback to sub
  let userId: number | null = null;
  if (user?.userId && typeof user.userId === 'number') {
    userId = user.userId;
  } else if (user?.sub) {
    const parsedFromSub = parseInt(user.sub);
    if (!isNaN(parsedFromSub)) {
      userId = parsedFromSub;
    }
  }
  
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useGetTasksByUserQuery(userId, { skip: userId === null || !isAuthenticated });
  const { data: projects, isLoading: isProjectsLoading, isError: projectsError } =
    useGetProjectsQuery();
  const { data: users } = useGetUsersQuery({}, { skip: !isAuthenticated });

  // Bulk selection handlers
  const handleSelectTask = useCallback((taskId: number, selected: boolean) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!tasks) return;
    const visibleTasks = tasks.slice(0, 5); // Only select visible tasks
    if (selectedTaskIds.size === visibleTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(visibleTasks.map(t => t.id)));
    }
  }, [tasks, selectedTaskIds.size]);

  const handleClearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  const handleInlineComplete = useCallback(async (task: Task) => {
    if (statusUpdatingId === task.id) {
      return;
    }

    const isCompleted = task.status === Status.Completed;
    const nextStatus = isCompleted ? Status.ToDo : Status.Completed;

    setStatusUpdatingId(task.id);
    const actionLabel = isCompleted ? "Reopening" : "Marking";
    const completionSuffix = isCompleted ? "" : " complete";
    const loadingToast = toast.loading(`${actionLabel} "${task.title}"${completionSuffix}...`);

    try {
      await updateTaskStatusMutation({ taskId: task.id, status: nextStatus }).unwrap();
      toast.success(isCompleted ? "Task reopened." : "Task marked complete.", { id: loadingToast });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task status", { id: loadingToast });
    } finally {
      setStatusUpdatingId(null);
    }
  }, [statusUpdatingId, updateTaskStatusMutation]);

  const handleKeyboardToggleComplete = useCallback((element: HTMLElement) => {
    const taskId = element.getAttribute('data-task-id');
    if (!taskId) {
      return;
    }

    const task = (tasks || []).find((entry) => entry.id === Number(taskId));
    if (task) {
      handleInlineComplete(task);
    }
  }, [tasks, handleInlineComplete]);

  // Keyboard navigation for task list
  useKeyboardNavigation({
    itemSelector: '[data-task-card]',
    onSelect: (element) => {
      // Remove previous selections
      document.querySelectorAll('[data-task-card]').forEach(el => {
        el.classList.remove('keyboard-selected');
      });
      // Add selection to current element
      element.classList.add('keyboard-selected');
    },
    onOpen: (element) => {
      const taskId = element.getAttribute('data-task-id');
      if (taskId) {
        openTaskModal(parseInt(taskId, 10));
      }
    },
    onToggle: handleKeyboardToggleComplete,
    enabled: true,
  });

  // Global shortcuts for quick actions
  useGlobalShortcuts({
    shortcuts: [
      {
        key: 'c',
        handler: () => {
          setIsModalNewTaskOpen(true);
          toast.info('Press C to create a new task', { duration: 2000 });
        },
        description: 'Create new task',
      },
      {
        key: 'k',
        metaKey: true,
        handler: () => {
          setIsModalNewTaskOpen(true);
        },
        description: 'Create new task (Cmd+K)',
      },
      {
        key: '?',
        handler: () => {
          toast.info(
            'Keyboard Shortcuts:\n' +
            'c - Create new task\n' +
            'Cmd+K - Create new task\n' +
            'j/k or ↓/↑ - Navigate tasks\n' +
            'Space - Mark task complete\n' +
            'Enter - Open task details\n' +
            '? - Show this help',
            { duration: 8000 }
          );
        },
        description: 'Show keyboard shortcuts help',
      },
    ],
    enabled: true,
  });

  // Bulk action handlers
  const handleBulkStatusChange = useCallback(async (status: string) => {
    if (selectedTaskIds.size === 0) return;
    setIsProcessing(true);
    try {
      const result = await apiService.bulkUpdateTaskStatus(Array.from(selectedTaskIds), status);
      toast.success(result.message);
      setSelectedTaskIds(new Set());
      refetchTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tasks");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTaskIds, refetchTasks]);

  const handleBulkAssign = useCallback(async (userId: number | null) => {
    if (selectedTaskIds.size === 0) return;
    setIsProcessing(true);
    try {
      const result = await apiService.bulkAssignTasks(Array.from(selectedTaskIds), userId);
      toast.success(result.message);
      setSelectedTaskIds(new Set());
      refetchTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign tasks");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTaskIds, refetchTasks]);

  const handleBulkDelete = useCallback(() => {
    if (selectedTaskIds.size === 0) return;
    
    // Get selected tasks for the toast message
    const selectedTasks = tasks?.filter(t => selectedTaskIds.has(t.id)) || [];
    const taskNames = selectedTasks.map(t => t.title);
    
    // Close the delete modal
    setIsDeleteModalOpen(false);
    
    // Trigger undoable delete - this shows the toast immediately
    deleteWithUndo(Array.from(selectedTaskIds));
    
    // Clear selection (the actual deletion happens after the timeout or on dismiss)
    setSelectedTaskIds(new Set());
    
    // Refresh tasks after a delay (to allow for undo)
    setTimeout(() => {
      refetchTasks();
    }, 10500); // Slightly after the undo window
    
  }, [selectedTaskIds, tasks, deleteWithUndo, refetchTasks]);

  const handleBulkArchive = useCallback(async () => {
    if (selectedTaskIds.size === 0) return;
    setIsProcessing(true);
    try {
      const result = await apiService.bulkArchiveTasks(Array.from(selectedTaskIds));
      toast.success(result.message);
      setSelectedTaskIds(new Set());
      refetchTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive tasks");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTaskIds, refetchTasks]);

  const handleBulkUnarchive = useCallback(async () => {
    if (selectedTaskIds.size === 0) return;
    setIsProcessing(true);
    try {
      const result = await apiService.bulkUnarchiveTasks(Array.from(selectedTaskIds));
      toast.success(result.message);
      setSelectedTaskIds(new Set());
      refetchTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unarchive tasks");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTaskIds, refetchTasks]);

  const selectedTasks = (tasks || []).filter(t => selectedTaskIds.has(t.id));

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  // Show loading while authenticating or fetching data
  if (authLoading || tasksLoading || isProjectsLoading) {
    return <DashboardSkeleton />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Don't redirect immediately if still loading
    if (authLoading) {
      return <DashboardSkeleton />;
    }
    return (
      <div className="container h-full w-[100%] bg-background p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">Authentication required</p>
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle critical errors - but don't block dashboard if only one data source fails
  if (tasksError && projectsError) {
    return (
      <div className="container h-full w-[100%] bg-background p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Unable to load dashboard data</p>
            <p className="text-muted-foreground mb-4 text-sm">This may be a temporary network issue</p>
            <div className="space-x-2">
              <button
                onClick={() => navigate(0)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/auth/logout')}
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-accent"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorityCount = (tasks || []).reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      if (priority) {
        acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = (projects || []).reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? Status.Completed : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  return (
    <div className="container h-full w-full bg-background">
      <Header name="Project Management Dashboard" />

      {/* Welcome Section */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-card rounded-lg p-3 sm:p-4 shadow border border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
            Welcome back, {user?.preferred_username || user?.username || 'User'}!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's your project overview and recent activity.
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-4 sm:mb-6">
        <SubscriptionStatus />
      </div>

      {/* Quick Stats Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {(tasks || []).length}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-gray-600">
                  {(tasks || []).filter(task => task.status === Status.Completed).length}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-gray-600">
                  {(tasks || []).filter(task => task.status === Status.WorkInProgress).length}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-gray-600">
                  {(projects || []).length}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
        <TodayTimeWidget />
        <WeeklyTimeWidget />
      </div>

      <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  Your Recent Tasks
                </CardTitle>
                {(tasks || []).length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Showing {Math.min((tasks || []).length, 5)} of {(tasks || []).length} tasks
                  </p>
                )}
              </div>
              {(tasks || []).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  {selectedTaskIds.size === Math.min((tasks || []).length, 5) ? (
                    <>
                      <Square className="h-4 w-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Select All
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {(tasks || []).length > 0 ? (
              <>
                {/* Mobile: Card-based layout */}
                <div className="sm:hidden divide-y divide-border">
                  {(tasks || []).slice(0, 5).map((task) => {
                    const isCompleted = task.status === Status.Completed;

                    return (
                      <div
                        key={task.id}
                        data-task-card
                        data-task-id={task.id}
                        className={cn(
                          "w-full p-4 text-left hover:bg-accent/50 transition-colors",
                          selectedTaskIds.has(task.id) ? 'bg-primary/5' : '',
                          isCompleted && "opacity-70",
                        )}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.has(task.id)}
                            onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                            className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded border-gray-300 text-primary focus:ring-primary"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleInlineComplete(task);
                            }}
                            className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded border-gray-300 text-primary focus:ring-primary"
                            aria-label={isCompleted ? "Reopen task" : "Mark task complete"}
                            disabled={statusUpdatingId === task.id}
                          />
                          <button
                            onClick={() => openTaskModal(task.id)}
                            className="flex-1 text-left"
                          >
                            <h4 className={cn(
                              "font-medium text-foreground line-clamp-2",
                              isCompleted && "line-through text-muted-foreground",
                            )}>
                              {task.title}
                            </h4>
                          </button>
                          <Badge variant={getPriorityVariant(task.priority)} className="shrink-0">
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap pl-14">
                          <Badge variant={getStatusVariant(task.status)}>
                            {task.status}
                          </Badge>
                          {task.dueDate && (
                            <span className={cn(
                              "text-xs",
                              new Date(task.dueDate) < new Date() && task.status !== Status.Completed
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            )}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <span className="sr-only">Select</span>
                        </TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(tasks || []).slice(0, 5).map((task) => {
                        const isCompleted = task.status === Status.Completed;

                        return (
                          <TableRow 
                            key={task.id}
                            data-task-card
                            data-task-id={task.id}
                            className={cn(
                              selectedTaskIds.has(task.id) ? 'bg-primary/5' : '',
                              isCompleted && 'opacity-70',
                            )}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedTaskIds.has(task.id)}
                                onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={(event) => {
                                    event.stopPropagation();
                                    handleInlineComplete(task);
                                  }}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  aria-label={isCompleted ? "Reopen task" : "Mark task complete"}
                                  disabled={statusUpdatingId === task.id}
                                />
                                <div>
                                  <button
                                    onClick={() => openTaskModal(task.id)}
                                    className={cn(
                                      "font-medium hover:underline text-left",
                                      isCompleted && "line-through text-muted-foreground",
                                    )}
                                  >
                                    {task.title}
                                  </button>
                                  {task.description && (
                                    <p className={cn(
                                      "text-sm text-muted-foreground mt-1 line-clamp-2",
                                      isCompleted && "line-through",
                                    )}>
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityVariant(task.priority)}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(task.status)}>
                                {task.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {task.dueDate ? (
                                <span className={cn(
                                  "text-sm",
                                  new Date(task.dueDate) < new Date() && task.status !== Status.Completed
                                    ? "text-destructive font-medium"
                                    : "text-muted-foreground"
                                )}>
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">No date</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openTaskModal(task.id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                {/* Empty State - Onboarding Experience */}
                <div className="max-w-md w-full text-center">
                  {/* Welcome Icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                      <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Welcome to TaskLuid, {user?.preferred_username || user?.username || 'there'}! 👋
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You're all set up! Let's create your first task and get organized.
                  </p>

                  {/* Progress Indicator */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Getting Started</span>
                      <span className="text-xs text-muted-foreground">Step 1 of 3</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-2 flex-1 bg-primary rounded-full"></div>
                      <div className="h-2 flex-1 bg-muted rounded-full"></div>
                      <div className="h-2 flex-1 bg-muted rounded-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Create your first task to unlock progress tracking</p>
                  </div>

                  {/* Primary CTA */}
                  <Button
                    size="lg"
                    onClick={() => setIsModalNewTaskOpen(true)}
                    className="w-full mb-4 gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Task
                  </Button>

                  {/* Quick Tips */}
                  <div className="text-left space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Tips</p>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <span className="text-muted-foreground">Tasks help you track work and stay organized</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">2</span>
                      </div>
                      <span className="text-muted-foreground">Assign due dates to keep deadlines in check</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">3</span>
                      </div>
                      <span className="text-muted-foreground">Use priorities to focus on what matters most</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <DashboardCharts
          taskDistribution={taskDistribution}
          projectStatus={projectStatus}
          isDarkMode={isDarkMode}
        />
      </Suspense>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedTasks={selectedTasks}
        onClearSelection={handleClearSelection}
        onStatusChange={handleBulkStatusChange}
        onAssign={handleBulkAssign}
        onDelete={() => setIsDeleteModalOpen(true)}
        onArchive={handleBulkArchive}
        onUnarchive={handleBulkUnarchive}
        users={users || []}
        isProcessing={isProcessing}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        taskCount={selectedTaskIds.size}
        isDeleting={isDeletePending()}
      />

      {/* Create Task Modal */}
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;