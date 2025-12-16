import React, { useMemo, useState } from "react";
import {
  Priority,
  Task,
  Status,
} from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useGetTasksByUserQuery, useGetProjectsQuery } from "@/hooks/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, CheckSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTaskModal } from "@/contexts/TaskModalContext";

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

const TasksPage = () => {
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.userId ?? null;
  const { openTaskModal } = useTaskModal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null });

  const { data: projects } = useGetProjectsQuery();

  // Get unique statuses from user's tasks (combines default + any custom statuses)
  const availableStatuses = useMemo(() => {
    const defaultStatuses = Object.values(Status);
    if (!tasks || tasks.length === 0) return defaultStatuses;

    const taskStatuses = tasks.map(t => t.status).filter(Boolean) as string[];
    const allStatuses = [...new Set([...defaultStatuses, ...taskStatuses])];
    return allStatuses;
  }, [tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    let filtered = tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort by priority then status
    const priorityOrder = { 'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Backlog': 5 };
    const statusOrder = { 'TODO': 1, 'Work In Progress': 2, 'Under Review': 3, 'Completed': 4 };
    
    return filtered.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 5;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 5;
      return aStatus - bStatus;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  if (tasksLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">Manage and track your assigned tasks</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tasksError || !tasks) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">Manage and track your assigned tasks</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <p className="text-foreground font-medium mb-2">Error loading tasks</p>
                <p className="text-muted-foreground text-sm mb-4">We're having trouble loading your tasks</p>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredAndSortedTasks.length})</CardTitle>
          <CardDescription>
            Your tasks organized by priority and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task) => (
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
                      <span className="text-muted-foreground">
                        {projects?.find(p => p.id === task.projectId)?.name || 'No project'}
                      </span>
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
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "No tasks match your filters" 
                  : "No tasks assigned"}
              </p>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Tasks assigned to you will appear here"}
              </p>
              {!(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
                <Button asChild>
                  <Link to="/dashboard/projects">
                    Browse Projects
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;