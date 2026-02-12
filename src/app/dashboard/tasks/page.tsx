import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  Priority,
  Task,
  Status,
} from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { useGetTasksByUserQuery, useGetProjectsQuery, useGetUsersQuery, useGetAgentsQuery } from "@/hooks/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, CheckSquare, AlertCircle, Trash2, Tag, Calendar, FolderKanban, UserCheck, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTaskModal } from "@/contexts/TaskModalContext";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";

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
  const lastSelectedRef = useRef<number | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Bulk selection state
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null });

  const { data: projects } = useGetProjectsQuery();
  const { data: users } = useGetUsersQuery();
  const { data: agents } = useGetAgentsQuery();

  // Get unique statuses from user's tasks (combines default + any custom statuses)
  const availableStatuses = useMemo(() => {
    const defaultStatuses = Object.values(Status);
    if (!tasks || tasks.length === 0) return defaultStatuses;

    const taskStatuses = tasks.map(t => t.status).filter(Boolean) as string[];
    const allStatuses = [...new Set([...defaultStatuses, ...taskStatuses])];
    return allStatuses;
  }, [tasks]);

  // Combine advanced filters with search term
  const displayTasks = useMemo(() => {
    // Start with advanced filter results, or all tasks if no filters
    const baseTasks = filteredTasks.length > 0 || activeFilterCount > 0 
      ? filteredTasks 
      : (tasks || []);
    
    if (!searchTerm) return baseTasks;
    
    // Apply search term on top of filters
    return baseTasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [tasks, filteredTasks, activeFilterCount, searchTerm]);

  // Sort tasks by priority then status
  const sortedTasks = useMemo(() => {
    const priorityOrder = { 'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Backlog': 5 };
    const statusOrder = { 'TODO': 1, 'Work In Progress': 2, 'Under Review': 3, 'Completed': 4 };
    
    return [...displayTasks].sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 5;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 5;
      return aStatus - bStatus;
    });
  }, [displayTasks]);

  // Bulk selection handlers (defined after sortedTasks)
  const toggleTaskSelection = useCallback((taskId: number, event?: React.MouseEvent) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      
      // Handle shift+click for range selection
      if (event?.shiftKey && lastSelectedRef.current !== null && tasks) {
        const taskIds = sortedTasks.map(t => t.id);
        const lastIndex = taskIds.indexOf(lastSelectedRef.current);
        const currentIndex = taskIds.indexOf(taskId);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          for (let i = start; i <= end; i++) {
            newSet.add(taskIds[i]);
          }
        }
      } else {
        // Normal toggle
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
      }
      
      lastSelectedRef.current = taskId;
      return newSet;
    });
  }, [sortedTasks, tasks]);

  const toggleAllSelection = useCallback(() => {
    setSelectedTasks(prev => {
      if (prev.size === sortedTasks.length) {
        // Deselect all
        return new Set();
      } else {
        // Select all
        return new Set(sortedTasks.map(t => t.id));
      }
    });
  }, [sortedTasks]);

  const clearSelection = useCallback(() => {
    setSelectedTasks(new Set());
    lastSelectedRef.current = null;
  }, []);

  // Bulk action handlers
  const handleBulkStatusChange = async (status: string) => {
    if (selectedTasks.size === 0) return;
    
    setIsBulkProcessing(true);
    try {
      const result = await apiService.bulkUpdateTaskStatus(Array.from(selectedTasks), status);
      toast.success(`Updated ${result.updatedCount} tasks to "${status}"`);
      clearSelection();
      refetchTasks();
    } catch (error) {
      toast.error("Failed to update task status");
      console.error(error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkAssign = async (agentId: number) => {
    if (selectedTasks.size === 0) return;
    
    setIsBulkProcessing(true);
    try {
      const result = await apiService.bulkAssignAgents(Array.from(selectedTasks), [agentId]);
      toast.success(`Assigned ${result.updatedCount} tasks to agent`);
      clearSelection();
      refetchTasks();
    } catch (error) {
      toast.error("Failed to assign tasks");
      console.error(error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    
    setIsBulkProcessing(true);
    try {
      const result = await apiService.bulkDeleteTasks(Array.from(selectedTasks));
      toast.success(`Deleted ${result.deletedCount} tasks`);
      clearSelection();
      refetchTasks();
    } catch (error) {
      toast.error("Failed to delete tasks");
      console.error(error);
    } finally {
      setIsBulkProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleBulkMoveToProject = async (projectId: number) => {
    if (selectedTasks.size === 0) return;
    
    setIsBulkProcessing(true);
    try {
      const result = await apiService.bulkMoveToProject(Array.from(selectedTasks), projectId);
      toast.success(`Moved ${result.updatedCount} tasks to project`);
      clearSelection();
      refetchTasks();
    } catch (error) {
      toast.error("Failed to move tasks");
      console.error(error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handle filtered tasks from AdvancedFilters
  const handleFilterChange = (newFilteredTasks: Task[]) => {
    setFilteredTasks(newFilteredTasks);
  };

  // Handle active filter count change
  const handleActiveFiltersChange = (count: number) => {
    setActiveFilterCount(count);
  };

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

  const hasActiveFilters = searchTerm || activeFilterCount > 0;
  const showingCount = sortedTasks.length;
  const totalCount = tasks.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            {hasActiveFilters 
              ? `Showing ${showingCount} of ${totalCount} tasks`
              : `${totalCount} task${totalCount !== 1 ? 's' : ''} assigned to you`
            }
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Use advanced filters to find exactly what you need, or save custom views for later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            tasks={tasks}
            projects={projects || []}
            users={users || []}
            availableStatuses={availableStatuses}
            onFilterChange={handleFilterChange}
            onActiveFiltersChange={handleActiveFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedTasks.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-popover border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{selectedTasks.size} selected</span>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          {/* Status Change Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" disabled={isBulkProcessing} className="h-8">
                <CheckSquare className="h-4 w-4 mr-1" />
                Status
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableStatuses.map(status => (
                <DropdownMenuItem key={status} onClick={() => handleBulkStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" disabled={isBulkProcessing} className="h-8">
                <UserCheck className="h-4 w-4 mr-1" />
                Assign
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Assign to Agent</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {agents?.map(agent => (
                <DropdownMenuItem key={agent.id} onClick={() => handleBulkAssign(agent.id)}>
                  {agent.displayName || agent.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Move to Project Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" disabled={isBulkProcessing} className="h-8">
                <FolderKanban className="h-4 w-4 mr-1" />
                Move
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Move to Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects?.map(project => (
                <DropdownMenuItem key={project.id} onClick={() => handleBulkMoveToProject(Number(project.id))}>
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border" />

          {/* Delete Button */}
          <Button 
            variant="destructive" 
            size="sm" 
            disabled={isBulkProcessing}
            onClick={() => setShowDeleteConfirm(true)}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedTasks.size} tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected tasks
              and all associated comments, attachments, and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tasks Table / Cards */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Tasks ({sortedTasks.length})</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your tasks organized by priority and status
              </CardDescription>
            </div>
            {sortedTasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllSelection}
                className="gap-2"
              >
                {selectedTasks.size === sortedTasks.length ? (
                  <>
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Deselect All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Select All</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {sortedTasks.length > 0 ? (
            <>
              {/* Mobile: Card-based layout */}
              <div className="sm:hidden divide-y divide-border">
                {sortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${selectedTasks.has(task.id) ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <Checkbox 
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => {}}
                        onClick={(e) => toggleTaskSelection(task.id, e as unknown as React.MouseEvent)}
                        className="mt-1"
                        aria-label={`Select task ${task.title}`}
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
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 pl-7">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap pl-7 mt-2">
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
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.projectId && (
                        <span className="text-xs text-muted-foreground">
                          {projects?.find(p => p.id === task.projectId)?.name || 'No project'}
                        </span>
                      )}
                    </div>
                    {task.tags && (
                      <div className="flex flex-wrap gap-1 mt-2 pl-7">
                        {task.tags.split(",").map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox 
                          checked={selectedTasks.size > 0 && selectedTasks.size === sortedTasks.length}
                          onCheckedChange={toggleAllSelection}
                          aria-label="Select all tasks"
                        />
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTasks.map((task) => (
                      <TableRow 
                        key={task.id}
                        className={selectedTasks.has(task.id) ? "bg-muted/50" : ""}
                      >
                        <TableCell className="w-10">
                          <Checkbox 
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={() => {}}
                            onClick={(e) => toggleTaskSelection(task.id, e as unknown as React.MouseEvent)}
                            aria-label={`Select task ${task.title}`}
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
                            {task.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.split(",").map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </div>
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
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">
                {hasActiveFilters
                  ? "No tasks match your filters" 
                  : "No tasks assigned"}
              </p>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Tasks assigned to you will appear here"}
              </p>
              {!hasActiveFilters && (
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
