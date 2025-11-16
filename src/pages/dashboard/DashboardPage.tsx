import {
  Priority,
  Project,
  Task,
} from "@/hooks/useApi";
import { useAuth } from "@/app/authProvider";
import { useGetProjectsQuery, useGetTasksByUserQuery } from "@/hooks/useApi";
import { useGlobalStore } from "@/stores/globalStore";
import React from "react";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckSquare, AlertCircle, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskModal } from "@/contexts/TaskModalContext";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { openTaskModal } = useTaskModal();
  
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
  } = useGetTasksByUserQuery(userId, { skip: userId === null || !isAuthenticated });
  const { data: projects, isLoading: isProjectsLoading, isError: projectsError } =
    useGetProjectsQuery();

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  // Show loading while authenticating or fetching data
  if (authLoading || tasksLoading || isProjectsLoading) {
    return (
      <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
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
        <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
          <Header name="Project Management Dashboard" />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying authentication...</p>
            </div>
          </div>
        </div>
      );
    }

    console.log('[DASHBOARD] User not authenticated, redirecting to login...');
    return (
      <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication required</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
      <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
        <Header name="Project Management Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Unable to load dashboard data</p>
            <p className="text-gray-600 mb-4 text-sm">This may be a temporary network issue</p>
            <div className="space-x-2">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
              <button 
                onClick={() => window.location.href = '/auth/logout'} 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold dark:text-white mb-2">
            Welcome back, {user?.preferred_username || user?.username || 'User'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your project overview and recent activity.
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-6">
        <SubscriptionStatus />
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">
                  {(tasks || []).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {(tasks || []).filter(task => task.status === 'Completed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(tasks || []).filter(task => task.status === 'Work In Progress').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(projects || []).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Your Recent Tasks
            </CardTitle>
            {(tasks || []).length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {Math.min((tasks || []).length, 5)} of {(tasks || []).length} tasks
              </p>
            )}
          </CardHeader>
          <CardContent>
            {(tasks || []).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(tasks || []).slice(0, 5).map((task) => (
                    <TableRow key={task.id}>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Task Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
          {taskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.barGrid}
                />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  contentStyle={{
                    width: "min-content",
                    height: "min-content",
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill={chartColors.bar} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No tasks assigned to you yet</p>
                <p className="text-sm mt-1">Start by creating your first task!</p>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Project Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
          {projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No projects available</p>
                <p className="text-sm mt-1">Create your first project to get started!</p>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
       
      </div>
    </div>
  );
};

export default DashboardPage;