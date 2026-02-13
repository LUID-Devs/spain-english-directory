
import { useGlobalStore } from "@/stores/globalStore";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import PriorityEmptyState from "@/components/PriorityEmptyState";
import { Priority, Task } from "@/hooks/useApi";
import { useGetTasksByUserQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/authProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target, 
  Activity, 
  Plus, 
  List, 
  Grid3X3,
  RefreshCw,
  Lock,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  User,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  priority: Priority;
};

const getStatusBadge = (status: string) => {
  const variants = {
    "Completed": { variant: "default" as const, className: "bg-gray-300 text-gray-800 hover:bg-gray-300 border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500" },
    "Work In Progress": { variant: "secondary" as const, className: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700" },
    "Under Review": { variant: "outline" as const, className: "bg-gray-200 text-gray-800 hover:bg-gray-200 border-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600" },
  };
  return variants[status as keyof typeof variants] || { variant: "outline" as const, className: "" };
};

const getPriorityBadge = (priority: Priority) => {
  const variants = {
    "Urgent": { variant: "destructive" as const, icon: AlertTriangle },
    "High": { variant: "default" as const, icon: Target },
    "Medium": { variant: "secondary" as const, icon: Activity },
    "Low": { variant: "outline" as const, icon: Clock },
    "Backlog": { variant: "outline" as const, icon: List },
  };
  return variants[priority] || { variant: "outline" as const, icon: Activity };
};

const getPriorityIcon = (priority: Priority) => {
  const icons = {
    "Urgent": AlertTriangle,
    "High": Target,
    "Medium": Activity,
    "Low": Clock,
    "Backlog": List,
  };
  return icons[priority] || Activity;
};

const getPriorityColors = (priority: Priority) => {
  const colors = {
    "Urgent": { bg: "bg-gray-900 dark:bg-gray-900", border: "border-gray-800 dark:border-gray-800", text: "text-gray-100 dark:text-gray-100" },
    "High": { bg: "bg-gray-700 dark:bg-gray-700", border: "border-gray-600 dark:border-gray-600", text: "text-gray-100 dark:text-gray-100" },
    "Medium": { bg: "bg-gray-500 dark:bg-gray-500", border: "border-gray-400 dark:border-gray-400", text: "text-white dark:text-white" },
    "Low": { bg: "bg-gray-300 dark:bg-gray-300", border: "border-gray-200 dark:border-gray-200", text: "text-gray-800 dark:text-gray-800" },
    "Backlog": { bg: "bg-gray-100 dark:bg-gray-100", border: "border-gray-100 dark:border-gray-100", text: "text-gray-600 dark:text-gray-600" },
  };
  return colors[priority] || colors["Medium"];
};

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const auth = useAuth();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  const priorityColors = getPriorityColors(priority);
  
  // Select the icon component based on priority (lowercase to avoid React treating it as a component)
  const priorityIcon = getPriorityIcon(priority);
  
  // Improved user ID resolution with better debugging
  let userId: number | null = null;
  
  // Try to get userId from auth.user.userId first (database ID), then sub, then currentUser
  if (auth.user?.userId && typeof auth.user.userId === 'number') {
    userId = auth.user.userId;
  } else if (auth.user?.sub) {
    const parsedFromSub = parseInt(auth.user.sub);
    if (!isNaN(parsedFromSub)) {
      userId = parsedFromSub;
    }
  } else if (currentUser?.userId) {
    userId = currentUser.userId;
  }
  
  // Priority page debug logging removed for production
  
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetTasksByUserQuery(userId, { skip: userId === null || !auth.isAuthenticated });

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  // Tasks debug logging removed for production

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  // Listen for task updates and refetch tasks
  useEffect(() => {
    const handleTaskUpdated = () => {
      refetchTasks();
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
    };
  }, [refetchTasks]);

  if (userLoading || isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              {React.createElement(priorityIcon, { className: cn("h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0", priorityColors.text) })}
              <div className="min-w-0">
                <CardTitle className={cn("text-xl sm:text-2xl md:text-3xl truncate", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Loading your {priority.toLowerCase()} priority tasks...
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex items-center justify-center h-24 sm:h-32">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground text-sm sm:text-base">Loading tasks...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user || userId === null) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              {React.createElement(priorityIcon, { className: cn("h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0", priorityColors.text) })}
              <div className="min-w-0">
                <CardTitle className={cn("text-xl sm:text-2xl md:text-3xl truncate", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Authentication required to view tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex flex-col items-center justify-center h-auto py-6 sm:h-32 text-center space-y-3 sm:space-y-4">
              <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  Authentication Required
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-4 px-4">
                  Please log in to view your {priority.toLowerCase()} priority tasks
                </p>
                <Button onClick={() => window.location.href = '/auth/login'} className="w-full sm:w-auto">
                  Go to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTasksError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              {React.createElement(priorityIcon, { className: cn("h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0", priorityColors.text) })}
              <div className="min-w-0">
                <CardTitle className={cn("text-xl sm:text-2xl md:text-3xl truncate", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Error loading tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium text-sm sm:text-base">
                    Failed to load {priority.toLowerCase()} priority tasks
                  </div>
                  <div className="text-xs sm:text-sm">
                    {tasksError?.message || 'Unknown error occurred'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-2 w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tasks || tasks.length === 0 || filteredTasks?.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ModalNewTask
          isOpen={isModalNewTaskOpen}
          onClose={() => setIsModalNewTaskOpen(false)}
          defaultPriority={priority}
        />

        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {React.createElement(priorityIcon, { className: cn("h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0", priorityColors.text) })}
                <div className="min-w-0">
                  <CardTitle className={cn("text-xl sm:text-2xl md:text-3xl truncate", priorityColors.text)}>
                    {priority} Priority Tasks
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {!tasks || tasks.length === 0
                      ? "Get started by creating your first task"
                      : `Manage your ${priority.toLowerCase()} priority items`
                    }
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsModalNewTaskOpen(true)}
                className="w-full sm:w-auto flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <PriorityEmptyState
              priority={priority}
              onCreateTask={() => setIsModalNewTaskOpen(true)}
              totalTasks={tasks?.length || 0}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        defaultPriority={priority}
      />

      {/* Header */}
      <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {React.createElement(priorityIcon, { className: cn("h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0", priorityColors.text) })}
              <div className="min-w-0">
                <CardTitle className={cn("text-xl sm:text-2xl md:text-3xl truncate", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage your {priority.toLowerCase()} priority items effectively
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsModalNewTaskOpen(true)}
              className="w-full sm:w-auto flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:hidden">Create Task</span>
              <span className="hidden sm:inline">Create {priority} Task</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Total Priority Tasks */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={cn("p-2 sm:p-3 rounded-full flex-shrink-0", priorityColors.bg)}>
                {React.createElement(priorityIcon, { className: cn("h-5 w-5 sm:h-6 sm:w-6", priorityColors.text) })}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {priority} Tasks
                </p>
                <p className={cn("text-2xl sm:text-3xl font-bold", priorityColors.text)}>
                  {filteredTasks?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900/20 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {filteredTasks?.filter(task => task.status === 'Completed').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Progress
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredTasks?.length > 0
                    ? Math.round((filteredTasks.filter(task => task.status === 'Completed').length / filteredTasks.length) * 100)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
                className="flex-1 sm:flex-none"
              >
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">List View</span>
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
                className="flex-1 sm:flex-none"
              >
                <Grid3X3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Table View</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">
                  {filteredTasks?.length || 0} tasks
                </span>
                <span className="hidden sm:inline">
                  Showing {filteredTasks?.length || 0} {priority.toLowerCase()} priority tasks
                  {tasks && tasks.length > 0 && (
                    <span className="ml-1">
                      ({filteredTasks?.length || 0} of {tasks.length} total)
                    </span>
                  )}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {view === "list" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTasks?.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Tasks Table</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Detailed view of your {priority.toLowerCase()} priority tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Title</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[100px]">Priority</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Tags</TableHead>
                    <TableHead className="min-w-[100px]">Due Date</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[120px]">Author</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[120px]">Assignee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks?.map((task: Task) => {
                    const statusBadge = getStatusBadge(task.status);
                    const priorityBadge = getPriorityBadge(task.priority);
                    const PriorityTaskIcon = priorityBadge.icon;

                    return (
                      <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="p-3 sm:p-4">
                          <div className="font-medium text-foreground text-sm line-clamp-1">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {task.description}
                            </div>
                          )}
                          {/* Mobile: Show status badge below title */}
                          <div className="sm:hidden mt-2 flex flex-wrap gap-1">
                            <Badge variant={priorityBadge.variant} className="text-[10px] px-1.5 py-0">
                              <PriorityTaskIcon className="h-2.5 w-2.5 mr-0.5" />
                              {task.priority}
                            </Badge>
                            {task.assignee?.username && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {task.assignee.username}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <Badge variant={statusBadge.variant} className={cn("text-[10px] sm:text-xs", statusBadge.className)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell p-3 sm:p-4">
                          <Badge variant={priorityBadge.variant} className="text-xs">
                            <PriorityTaskIcon className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell p-3 sm:p-4">
                          {task.tags ? (
                            <Badge variant="outline" className="text-xs max-w-[100px] truncate">
                              <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{task.tags}</span>
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">No tags</span>
                          )}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className={cn(
                                "text-xs sm:text-sm whitespace-nowrap",
                                new Date(task.dueDate) < new Date()
                                  ? "text-red-600 dark:text-red-400 font-semibold"
                                  : "text-foreground"
                              )}>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {(task.author?.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-foreground truncate max-w-[80px]">
                              {task.author?.username || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell p-3 sm:p-4">
                          {task.assignee?.username ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                {task.assignee.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-foreground truncate max-w-[80px]">
                                {task.assignee.username}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReusablePriorityPage;
