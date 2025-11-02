
import {
  Priority,
  Project,
  Task,
} from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useGetProjectsQuery, useGetTasksByUserQuery } from "@/hooks/useApi";
import { useGlobalStore } from "@/stores/globalStore";
import React, { useMemo } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Clock, CheckCircle, Calendar, Target, TrendingUp, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Task status styling helper
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

// Priority styling helper
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
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.userId ?? null;
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null });
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);

  // Filter and sort tasks for better organization
  const priorityOrder = { 'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Backlog': 5 };
  const statusOrder = { 'TODO': 1, 'Work In Progress': 2, 'Under Review': 3, 'Completed': 4 };
  
  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      // Sort by priority first, then by status
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 5;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 5;
      return aStatus - bStatus;
    });
  }, [tasks]);

  const urgentTasks = sortedTasks.filter(task => task.priority === 'Urgent');
  const highPriorityTasks = sortedTasks.filter(task => task.priority === 'High');
  const inProgressTasks = sortedTasks.filter(task => task.status === 'Work In Progress');
  const overdueTasks = useMemo(() => {
    const today = new Date();
    return sortedTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== 'Completed';
    });
  }, [sortedTasks]);

  if (tasksLoading || isProjectsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Header name="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tasksError || !tasks || !projects) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Header name="Dashboard" />
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <p className="text-foreground font-medium mb-2">Error loading dashboard data</p>
                <p className="text-muted-foreground text-sm mb-4">We're having trouble connecting to your data</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.username || 'User'}! Here's what needs your attention.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/tasks/new">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentTasks.length}</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks.length}</div>
            <p className="text-xs text-muted-foreground">Important tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Tasks
            </CardTitle>
            <CardDescription>
              Tasks that need your immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(urgentTasks.length > 0 || highPriorityTasks.length > 0) ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...urgentTasks, ...highPriorityTasks].slice(0, 10).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Link 
                            to={`/dashboard/tasks/${task.id}`} 
                            className="font-medium hover:underline"
                          >
                            {task.title}
                          </Link>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(urgentTasks.length + highPriorityTasks.length) > 10 && (
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link to="/dashboard/priority/urgent">
                        View All Priority Tasks
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No urgent tasks right now</p>
                <p className="text-sm text-muted-foreground">Great job staying on top of things!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Task Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie dataKey="count" data={taskDistribution} fill="#82ca9d" label>
                  {taskDistribution.map((entry, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            All your tasks organized by priority and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTasks.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTasks.slice(0, 15).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Link 
                          to={`/dashboard/tasks/${task.id}`} 
                          className="font-medium hover:underline"
                        >
                          {task.title}
                        </Link>
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
                        <span className="text-muted-foreground">
                          {projects?.find(p => p.id === task.projectId)?.name || 'No project'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedTasks.length > 15 && (
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/tasks">
                      View All Tasks ({sortedTasks.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No tasks assigned</p>
              <p className="text-muted-foreground mb-4">Tasks assigned to you will appear here</p>
              <Button asChild>
                <Link to="/dashboard/projects">
                  Browse Projects
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;