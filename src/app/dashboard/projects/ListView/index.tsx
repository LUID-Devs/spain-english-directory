import { Task, useGetTasksQuery, useGetProjectStatusesQuery, Status, useReorderTasksMutation } from "@/hooks/useApi";
import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import TaskCard from "@/components/TaskCard";
import { Grid3X3, List, Search, FileText, AlertTriangle, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDrag, useDrop } from "react-dnd";
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';

type Props = {
  id: string;
  tasks?: Task[];
  tasksLoading?: boolean;
  tasksError?: boolean;
  refetchTasks?: () => void;
};

type ViewMode = "grid" | "list";
type SortOption = "priority" | "dueDate" | "title" | "status" | "manual";

// Drag item type
const ITEM_TYPE = "task";

// Draggable Task Item Component
interface DraggableTaskItemProps {
  task: Task;
  index: number;
  viewMode: ViewMode;
  isManualSort: boolean;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onDrop: (taskId: number, newOrder: number) => void;
}

const DraggableTaskItem = React.memo(({
  task,
  index,
  viewMode,
  isManualSort,
  moveTask,
  onDrop
}: DraggableTaskItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task.id, index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isManualSort,
  }), [task.id, index, isManualSort]);

  const [, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    hover: (item: { id: number; index: number }, monitor: DropTargetMonitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop: (item: { id: number; index: number }) => {
      onDrop(item.id, item.index);
    },
  }), [index, moveTask, onDrop]);

  return (
    <div
      ref={(node) => {
        if (isManualSort) {
          preview(drop(node));
        }
      }}
      className={cn(
        "relative group",
        viewMode === "list" ? "max-w-none" : "",
        isDragging && "opacity-50"
      )}
    >
      {isManualSort && (
        <div
          ref={(node) => drag(node)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <TaskCard task={task} />
    </div>
  );
});

const DEFAULT_ITEMS_PER_PAGE = 20;

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

  // Fetch dynamic statuses for the project
  const { data: statusesData } = useGetProjectStatusesQuery(Number(id));

  // Get available statuses from API or fall back to defaults
  const availableStatuses = useMemo(() => {
    if (statusesData && statusesData.length > 0) {
      return statusesData.map((s) => s.name);
    }
    return Object.values(Status);
  }, [statusesData]);

  // Use prop data if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks;
  const isLoading = tasksLoading !== undefined ? tasksLoading : fetchedLoading;
  const error = tasksError !== undefined ? tasksError : fetchedError;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempTasks, setTempTasks] = useState<Task[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const [reorderTasks] = useReorderTasksMutation();

  const isManualSort = sortBy === "manual";

  const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3, "Backlog": 4 };

  // Handle task reordering during drag
  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!tasks) return;
    
    const currentTasks = tempTasks || tasks;
    const draggedTask = currentTasks[dragIndex];
    
    const newTasks = [...currentTasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, draggedTask);
    
    setTempTasks(newTasks);
  }, [tasks, tempTasks]);

  // Handle drop - save to backend
  const handleDrop = useCallback(async (taskId: number, newIndex: number) => {
    if (!tasks || !tempTasks) return;
    
    // Calculate new orders for all affected tasks
    const taskOrders = tempTasks.map((task, idx) => ({
      taskId: task.id,
      order: idx,
    }));

    try {
      await (reorderTasks as any)({ taskOrders }).unwrap();
      setTempTasks(null); // Clear temp state after successful save
      toast.success("Task order saved");
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      toast.error("Failed to save task order");
      setTempTasks(null); // Reset on error
    }
  }, [tasks, tempTasks, reorderTasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tempTasks || tasks || [];

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

    // Apply sorting (skip if manual sort - use tempTasks order)
    if (!isManualSort) {
      filtered = [...filtered].sort((a, b) => {
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
    } else {
      // Manual sort - sort by order field, fallback to id for stable sorting
      filtered = [...filtered].sort((a, b) => {
        const orderA = a.order ?? a.id;
        const orderB = b.order ?? b.id;
        return orderA - orderB;
      });
    }

    return filtered;
  }, [tasks, tempTasks, searchQuery, filterBy, sortBy, isManualSort]);

  // Pagination logic
  const totalTasks = filteredAndSortedTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalTasks);
  const paginatedTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filters, search, sort, or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBy, sortBy, itemsPerPage]);

  // Clear temp tasks when sort changes
  React.useEffect(() => {
    setTempTasks(null);
  }, [sortBy]);

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
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <div>
              <CardTitle className="text-xl sm:text-2xl">Task List</CardTitle>
              <CardDescription>
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} found
                {totalPages > 1 && ` • Showing ${startIndex + 1}-${endIndex} of ${totalTasks}`}
                {isManualSort && " (drag to reorder)"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter */}
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter" />
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className={cn("w-full sm:w-[140px]", isManualSort && "border-primary")}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="manual">Manual Order 🖐️</SelectItem>
                </SelectContent>
              </Select>

              {/* Items Per Page */}
              <Select 
                value={String(itemsPerPage)} 
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className="w-[110px] hidden sm:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 ml-auto">
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
            : "space-y-4",
          isManualSort && "pl-8" // Add padding for drag handles
        )}>
          {paginatedTasks.map((task: Task, index: number) => (
            <DraggableTaskItem
              key={task.id}
              task={task}
              index={startIndex + index}
              viewMode={viewMode}
              isManualSort={isManualSort}
              moveTask={moveTask}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListView;
