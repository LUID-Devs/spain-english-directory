
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
    "Completed": { variant: "default" as const, className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-300" },
    "Work In Progress": { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300" },
    "Under Review": { variant: "outline" as const, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-300" },
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
    "Urgent": { bg: "bg-red-50 dark:bg-red-950", border: "border-red-200 dark:border-red-800", text: "text-red-600 dark:text-red-400" },
    "High": { bg: "bg-orange-50 dark:bg-orange-950", border: "border-orange-200 dark:border-orange-800", text: "text-orange-600 dark:text-orange-400" },
    "Medium": { bg: "bg-yellow-50 dark:bg-yellow-950", border: "border-yellow-200 dark:border-yellow-800", text: "text-yellow-600 dark:text-yellow-400" },
    "Low": { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-200 dark:border-blue-800", text: "text-blue-600 dark:text-blue-400" },
    "Backlog": { bg: "bg-gray-50 dark:bg-gray-950", border: "border-gray-200 dark:border-gray-800", text: "text-gray-600 dark:text-gray-400" },
  };
  return colors[priority] || colors["Medium"];
};

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const auth = useAuth();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  const priorityColors = getPriorityColors(priority);
  const PriorityIcon = getPriorityIcon(priority);
  
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
  
  console.log('Priority Page Debug:', {
    priority,
    authUser: auth.user,
    authUserSub: auth.user?.sub,
    authUserUserId: auth.user?.userId,
    currentUser,
    resolvedUserId: userId,
    userLoading,
    isAuthenticated: auth.isAuthenticated
  });
  
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

  console.log('Tasks Debug:', {
    tasks: tasks?.length || 0,
    filteredTasks: filteredTasks?.length || 0,
    isLoading,
    isTasksError,
    tasksError
  });

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
      <div className="container mx-auto p-6 space-y-6">
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <PriorityIcon className={cn("h-8 w-8", priorityColors.text)} />
              <div>
                <CardTitle className={cn("text-3xl", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription>
                  Loading your {priority.toLowerCase()} priority tasks...
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user || userId === null) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <PriorityIcon className={cn("h-8 w-8", priorityColors.text)} />
              <div>
                <CardTitle className={cn("text-3xl", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription>
                  Authentication required to view tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32 text-center space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Authentication Required
                </h3>
                <p className="text-muted-foreground mb-4">
                  Please log in to view your {priority.toLowerCase()} priority tasks
                </p>
                <Button onClick={() => window.location.href = '/auth/login'}>
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
      <div className="container mx-auto p-6 space-y-6">
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <PriorityIcon className={cn("h-8 w-8", priorityColors.text)} />
              <div>
                <CardTitle className={cn("text-3xl", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription>
                  Error loading tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    Failed to load {priority.toLowerCase()} priority tasks
                  </div>
                  <div className="text-sm">
                    {tasksError?.message || 'Unknown error occurred'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="mt-2"
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
      <div className="container mx-auto p-6 space-y-6">
        <ModalNewTask
          isOpen={isModalNewTaskOpen}
          onClose={() => setIsModalNewTaskOpen(false)}
          defaultPriority={priority}
        />
        
        <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PriorityIcon className={cn("h-8 w-8", priorityColors.text)} />
                <div>
                  <CardTitle className={cn("text-3xl", priorityColors.text)}>
                    {priority} Priority Tasks
                  </CardTitle>
                  <CardDescription>
                    {!tasks || tasks.length === 0 
                      ? "Get started by creating your first task" 
                      : `Manage your ${priority.toLowerCase()} priority items`
                    }
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setIsModalNewTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
    <div className="container mx-auto p-6 space-y-6">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        defaultPriority={priority}
      />
      
      {/* Header */}
      <Card className={cn("border-2", priorityColors.border, priorityColors.bg)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PriorityIcon className={cn("h-8 w-8", priorityColors.text)} />
              <div>
                <CardTitle className={cn("text-3xl", priorityColors.text)}>
                  {priority} Priority Tasks
                </CardTitle>
                <CardDescription>
                  Manage your {priority.toLowerCase()} priority items effectively
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsModalNewTaskOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create {priority} Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Priority Tasks */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={cn("p-3 rounded-full", priorityColors.bg)}>
                <PriorityIcon className={cn("h-6 w-6", priorityColors.text)} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {priority} Priority Tasks
                </p>
                <p className={cn("text-3xl font-bold", priorityColors.text)}>
                  {filteredTasks?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {filteredTasks?.filter(task => task.status === 'Completed').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Progress
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
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
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Table View
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>
                Showing {filteredTasks?.length || 0} {priority.toLowerCase()} priority tasks
                {tasks && tasks.length > 0 && (
                  <span className="ml-2">
                    ({filteredTasks?.length || 0} of {tasks.length} total)
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {view === "list" ? (
        <div className="space-y-4">
          {filteredTasks?.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tasks Table</CardTitle>
            <CardDescription>
              Detailed view of your {priority.toLowerCase()} priority tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks?.map((task: Task) => {
                  const statusBadge = getStatusBadge(task.status);
                  const priorityBadge = getPriorityBadge(task.priority);
                  const PriorityTaskIcon = priorityBadge.icon;
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className={statusBadge.className}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityBadge.variant} className="text-xs">
                          <PriorityTaskIcon className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.tags ? (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {task.tags}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No tags</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className={cn(
                              "text-sm",
                              new Date(task.dueDate) < new Date() 
                                ? "text-red-600 dark:text-red-400 font-semibold" 
                                : "text-foreground"
                            )}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-semibold">
                            {(task.author?.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-foreground">
                            {task.author?.username || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.assignee?.username ? (
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full flex items-center justify-center text-xs font-semibold">
                              {task.assignee.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-foreground">
                              {task.assignee.username}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReusablePriorityPage;
