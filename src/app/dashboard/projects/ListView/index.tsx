import { Task, useGetTasksQuery } from "@/hooks/useApi";
import React, { useState, useMemo } from "react";
import TaskCard from "@/components/TaskCard";
import { Grid3X3, List, Search, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  tasks?: Task[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

type ViewMode = "grid" | "list";
type SortOption = "priority" | "dueDate" | "title" | "status";
type FilterOption = "all" | "To Do" | "Work In Progress" | "Under Review" | "Completed";

const ListView = ({
  id,
  tasks: propTasks,
  tasksLoading,
  tasksError,
  refetchTasks
}: Props) => {
  // Fallback to fetching data if not provided via props
  const { data: fetchedTasks, isLoading: fetchedLoading, error: fetchedError } = useGetTasksQuery(
    { projectId: Number(id) }, 
    { skip: !!propTasks }
  );
  
  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = tasksLoading !== undefined ? tasksLoading : fetchedLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3, "Backlog": 4 };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks || [];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(task => (task.status || "To Do") === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5;
          return aPriority - bPriority;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return (a.status || "To Do").localeCompare(b.status || "To Do");
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterBy, sortBy]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive">An error occurred while fetching tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Task List</CardTitle>
                <CardDescription>
                  {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="Work In Progress">In Progress</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid/List */}
      {filteredAndSortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || filterBy !== "all" ? "No matching tasks" : "No tasks yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || filterBy !== "all" 
                ? "Try adjusting your search or filters to find more tasks."
                : "Get started by creating your first task for this project."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" 
            : "space-y-4"
        )}>
          {filteredAndSortedTasks.map((task: Task) => (
            <div key={task.id} className={viewMode === "list" ? "max-w-none" : ""}>
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListView;
