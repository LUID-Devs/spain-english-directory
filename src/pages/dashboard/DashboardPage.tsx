import {
  Priority,
  Project,
  Task,
} from "@/hooks/useApi";
import { useAuth } from "@/app/authProvider";
import { useGetProjectsQuery, useGetTasksByUserQuery, useGetUsersQuery } from "@/hooks/useApi";
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
import BulkActionsToolbar from "@/components/BulkActionsToolbar";
import BulkDeleteConfirmationModal from "@/components/BulkDeleteConfirmationModal";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { useState, useCallback } from "react";

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { openTaskModal } = useTaskModal();
  
  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Keyboard navigation for task list
  const { selectedIndex } = useKeyboardNavigation({
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
    enabled: true,
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

  const handleBulkDelete = useCallback(async () => {
    if (selectedTaskIds.size === 0) return;
    setIsProcessing(true);
    try {
      const result = await apiService.bulkDeleteTasks(Array.from(selectedTaskIds));
      toast.success(result.message);
      setSelectedTaskIds(new Set());
      setIsDeleteModalOpen(false);
      refetchTasks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tasks");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTaskIds, refetchTasks]);

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
    return (
      <div className="container h-full w-[100%] bg-background p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? "Authenticating..." : "Loading dashboard data..."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('[DASHBOARD] Auth check failed:', { isAuthenticated, user, authLoading });

    // Don't redirect immediately if still loading
    if (authLoading) {
      return (
        <div className="container h-full w-[100%] bg-background p-8">
          <Header name="Project Management Dashboard" />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying authentication...</p>
            </div>
          </div>
        </div>
      );
    }

    console.log('[DASHBOARD] User not authenticated, redirecting to login...');
    return (
      <div className="container h-full w-[100%] bg-background p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">Authentication required</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
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
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/auth/logout'}
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
      const status = project.endDate ? "Completed" : "Active";
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
                  {(tasks || []).filter(task => task.status === 'Completed').length}
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
                  {(tasks || []).filter(task => task.status === 'Work In Progress').length}
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
                  {(tasks || []).slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      data-task-card
                      data-task-id={task.id}
                      className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${selectedTaskIds.has(task.id) ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.has(task.id)}
                          onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={() => openTaskModal(task.id)}
                          className="flex-1 text-left"
                        >
                          <h4 className="font-medium text-foreground line-clamp-2">
                            {task.title}
                          </h4>
                        </button>
                        <Badge variant={getPriorityVariant(task.priority)} className="shrink-0">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pl-7">
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
                        {task.dueDate && (
                          <span className={cn(
                            "text-xs",
                            new Date(task.dueDate) < new Date() && task.status !== 'Completed'
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          )}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
                      {(tasks || []).slice(0, 5).map((task, index) => (
                        <TableRow 
                          key={task.id}
                          data-task-card
                          data-task-id={task.id}
                          className={selectedTaskIds.has(task.id) ? 'bg-primary/5' : ''}
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
                            <div>
                              <button
                                onClick={() => openTaskModal(task.id)}
                                className="font-medium hover:underline text-left"
                              >
                                {task.title}
                              </button>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
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
                                new Date(task.dueDate) < new Date() && task.status !== 'Completed'
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <CheckSquare className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium mb-2">No tasks assigned</p>
                    <p className="text-sm text-muted-foreground">Tasks assigned to you will appear here. Get started by joining a project!</p>
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
        isDeleting={isProcessing}
      />
    </div>
  );
};

export default DashboardPage;