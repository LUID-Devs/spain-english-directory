import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
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
import { 
  Search, 
  CheckSquare, 
  AlertCircle, 
  Trash2, 
  FolderKanban, 
  UserCheck, 
  X, 
  ChevronDown,
  Share2,
  ArrowUp,
  ArrowDown,
  Check,
  Filter,
  Download,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { useTaskModal } from "@/contexts/TaskModalContext";
import AdvancedFilters, { AdvancedFiltersV2 } from "@/components/AdvancedFilters";
import { SmartFilterBar } from "@/components/smartFilter";
import { ViewSubscriptionButton } from "@/components/ViewSubscriptionButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartFilterCriteria, applySmartFilter } from "@/lib/smartFilter";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { useUndoableBulkDelete } from "@/hooks/useUndoableBulkDelete";

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

// Sort options
const sortOptions = [
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'title', label: 'Title' },
  { value: 'createdAt', label: 'Created' },
];

const TasksPage = () => {
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.userId ?? null;
  const { openTaskModal } = useTaskModal();
  const lastSelectedRef = useRef<number | null>(null);
  
  // URL Search Params for sharing views
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL or defaults
  const initialSearch = searchParams.get('search') || '';
  const initialSortBy = searchParams.get('sortBy') || 'priority';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  
  // Local state synced with URL
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  
  // Filter state (local, will sync count to URL)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Smart filter state
  const [smartFilterQuery, setSmartFilterQuery] = useState(searchParams.get('smart') || '');
  const smartFilterQueryRef = useRef(smartFilterQuery);
  const [smartFilterCriteria, setSmartFilterCriteria] = useState<SmartFilterCriteria | null>(null);
  const [smartFilterCount, setSmartFilterCount] = useState(0);

  // Advanced filter mode toggle
  const [filterMode, setFilterMode] = useState<'simple' | 'advanced'>(
    (searchParams.get('filterMode') as 'simple' | 'advanced') || 'simple'
  );

  // Saved view state for subscription
  const [currentViewId, setCurrentViewId] = useState<number | null>(null);

  // Track if we need to update URL (debounce search)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    smartFilterQueryRef.current = smartFilterQuery;
  }, [smartFilterQuery]);
  
  // Bulk selection state
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null });

  // Undoable bulk delete hook
  const { deleteWithUndo: deleteTasksWithUndo, isPending: checkDeletePending } = useUndoableBulkDelete({
    onDelete: async (taskIds) => {
      const result = await apiService.bulkDeleteTasks(taskIds);
      clearSelection();
      refetchTasks();
      return { deletedCount: result.deletedCount };
    },
    duration: 5000, // 5 seconds to undo
    itemName: 'task',
    pluralName: 'tasks',
  });

  const { data: projects } = useGetProjectsQuery();
  const { data: users } = useGetUsersQuery();
  const { data: agents } = useGetAgentsQuery();

  // Get unique statuses from user's tasks
  const availableStatuses = useMemo(() => {
    const defaultStatuses = Object.values(Status);
    if (!tasks || tasks.length === 0) return defaultStatuses;

    const taskStatuses = tasks.map(t => t.status).filter(Boolean) as string[];
    const allStatuses = [...new Set([...defaultStatuses, ...taskStatuses])];
    return allStatuses;
  }, [tasks]);

  // Update URL when search/sort changes
  const updateURLParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'priority' && value !== 'asc') {
        // Don't store defaults
        newParams.set(key, value);
      } else if (newParams.has(key)) {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Handle search with URL sync
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Debounce URL update
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      updateURLParams({ search: value });
    }, 300);
  }, [updateURLParams]);

  // Handle sort with URL sync
  const handleSortChange = useCallback((newSortBy: string) => {
    let newOrder: 'asc' | 'desc';
    
    if (sortBy === newSortBy) {
      // Toggle order if same field
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for new field
      newOrder = 'asc';
    }
    
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    updateURLParams({ sortBy: newSortBy, sortOrder: newOrder });
  }, [sortBy, sortOrder, updateURLParams]);

  // Filter and sort tasks
  const displayTasks = useMemo(() => {
    // Start with filtered tasks from AdvancedFilters, or all tasks
    let baseTasks = activeFilterCount > 0 ? filteredTasks : (tasks || []);
    
    // Apply smart filter if active
    if (smartFilterCriteria && smartFilterCount > 0) {
      baseTasks = applySmartFilter(baseTasks, smartFilterCriteria, userId || undefined, users || []);
    }
    
    // Apply search term
    if (!searchTerm) return baseTasks;
    
    return baseTasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [tasks, filteredTasks, activeFilterCount, searchTerm, smartFilterCriteria, smartFilterCount, userId, users]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = { 'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Backlog': 5 };
    const statusOrder: Record<string, number> = { 'To Do': 1, 'Work In Progress': 2, 'Under Review': 3, 'Completed': 4 };
    
    return [...displayTasks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
          break;
        case 'status':
          comparison = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
          break;
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        }
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt': {
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = aCreated - bCreated;
          break;
        }
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [displayTasks, sortBy, sortOrder]);

  // Bulk selection handlers
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

  const handleTaskRowClick = useCallback((taskId: number, event: React.MouseEvent) => {
    if (event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-ignore-row-click]')) {
      return;
    }

    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      toggleTaskSelection(taskId, event);
      return;
    }

    openTaskModal(taskId);
  }, [openTaskModal, toggleTaskSelection]);

  const toggleAllSelection = useCallback(() => {
    setSelectedTasks(prev => {
      if (prev.size === sortedTasks.length) {
        return new Set();
      } else {
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
      const result = await apiService.bulkAssignTasks(Array.from(selectedTasks), agentId);
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
    
    // Close the confirmation dialog immediately
    setShowDeleteConfirm(false);
    
    // Use undoable delete - shows toast with undo button
    // Actual deletion happens after 5 seconds or when undo expires
    deleteTasksWithUndo(Array.from(selectedTasks));
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

  // Share view handler
  const handleShareView = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
    toast.success("View URL copied to clipboard!");
  }, []);

  // Export helper functions
  const convertTasksToCSV = (tasksToExport: Task[]): string => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Tags', 'Start Date', 'Due Date', 'Author', 'Assignee', 'Project', 'Created At', 'Updated At'];
    
    const rows = tasksToExport.map(task => {
      const author = users?.find(u => u.userId === task.authorUserId)?.username || '';
      const assignee = users?.find(u => u.userId === task.assignedUserId)?.username || '';
      const project = projects?.find(p => p.id === task.projectId)?.name || '';
      
      return [
        task.id,
        `"${task.title?.replace(/"/g, '""') || ''}"`,
        `"${(task.description || '').replace(/"/g, '""').replace(/<[^>]*>/g, '')}"`,
        task.status,
        task.priority,
        task.tags || '',
        task.startDate ? new Date(task.startDate).toLocaleDateString() : '',
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
        author,
        assignee,
        project,
        task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''
      ];
    });
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = useCallback(() => {
    const tasksToExport = selectedTasks.size > 0 
      ? sortedTasks.filter(t => selectedTasks.has(t.id))
      : sortedTasks;
    
    if (tasksToExport.length === 0) {
      toast.error("No tasks to export");
      return;
    }
    
    const csv = convertTasksToCSV(tasksToExport);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `tasks-${timestamp}.csv`, 'text/csv;charset=utf-8;');
    toast.success(`Exported ${tasksToExport.length} tasks to CSV`);
  }, [sortedTasks, selectedTasks]);

  const handleExportJSON = useCallback(() => {
    const tasksToExport = selectedTasks.size > 0 
      ? sortedTasks.filter(t => selectedTasks.has(t.id))
      : sortedTasks;
    
    if (tasksToExport.length === 0) {
      toast.error("No tasks to export");
      return;
    }
    
    const json = JSON.stringify(tasksToExport, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(json, `tasks-${timestamp}.json`, 'application/json');
    toast.success(`Exported ${tasksToExport.length} tasks to JSON`);
  }, [sortedTasks, selectedTasks]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setSortBy('priority');
    setSortOrder('asc');
    smartFilterQueryRef.current = '';
    setSmartFilterQuery('');
    setSmartFilterCriteria(null);
    setSmartFilterCount(0);
    setSearchParams(new URLSearchParams(), { replace: true });
    toast.info("All filters cleared");
  }, [setSearchParams]);

  // Handle filter changes from AdvancedFilters (now with server-side pagination)
  const handleFilterChange = useCallback((newFilteredTasks: Task[], pagination?: { totalCount: number; totalPages: number; hasNextPage: boolean }) => {
    setFilteredTasks(newFilteredTasks);
    // Optionally store pagination info if needed
    if (pagination) {
      console.log('Filter pagination:', pagination);
    }
  }, []);

  const handleActiveFiltersChange = useCallback((count: number) => {
    setActiveFilterCount(count);
    // Store filter count in URL for sharing awareness
    const newParams = new URLSearchParams(searchParams);
    if (count > 0) {
      newParams.set('filters', count.toString());
    } else {
      newParams.delete('filters');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSmartFilterQueryChange = useCallback((value: string) => {
    smartFilterQueryRef.current = value;
    setSmartFilterQuery(value);
  }, []);

  // Handle smart filter changes
  const handleSmartFilterApply = useCallback((criteria: SmartFilterCriteria, count: number, query: string) => {
    setSmartFilterCriteria(criteria);
    setSmartFilterCount(count);
    const newParams = new URLSearchParams(searchParams);
    if (count > 0) {
      const normalizedQuery = query.trim();
      if (normalizedQuery) {
        newParams.set('smart', normalizedQuery);
      } else {
        newParams.delete('smart');
      }
      newParams.set('smartFilters', count.toString());
    } else {
      newParams.delete('smart');
      newParams.delete('smartFilters');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSmartFilterClear = useCallback(() => {
    smartFilterQueryRef.current = '';
    setSmartFilterQuery('');
    setSmartFilterCriteria(null);
    setSmartFilterCount(0);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('smart');
    newParams.delete('smartFilters');
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const hasActiveFilters = searchTerm !== '' || activeFilterCount > 0 || smartFilterCount > 0;
  const showingCount = sortedTasks.length;
  const totalCount = (tasks || []).length;

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            {hasActiveFilters 
              ? `Showing ${showingCount} of ${totalCount} tasks`
              : `${totalCount} task${totalCount !== 1 ? 's' : ''} assigned to you`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
          
          {/* Share View Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareView}
              className="gap-2"
            >
              {showShareToast ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share View
                </>
              )}
            </Button>
          )}
          
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
                {selectedTasks.size > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {selectedTasks.size}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                Export Tasks
                {selectedTasks.size > 0 && ` (${selectedTasks.size} selected)`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
                <FileJson className="h-4 w-4 text-blue-600" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Filters are now persisted in the URL — share your view with teammates!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => handleSearchChange('')}
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Smart Filter Bar */}
          <SmartFilterBar
            value={smartFilterQuery}
            onChange={handleSmartFilterQueryChange}
            onApply={handleSmartFilterApply}
            onClear={handleSmartFilterClear}
            isActive={smartFilterCount > 0}
            activeFilterCount={smartFilterCount}
            currentUserId={userId || undefined}
          />

          {/* Filter Mode Toggle */}
          <div className="flex items-center justify-between py-2 border-t">
            <Tabs
              value={filterMode}
              onValueChange={(v) => {
                setFilterMode(v as 'simple' | 'advanced');
                const newParams = new URLSearchParams(searchParams);
                if (v === 'advanced') {
                  newParams.set('filterMode', 'advanced');
                } else {
                  newParams.delete('filterMode');
                }
                setSearchParams(newParams, { replace: true });
              }}
            >
              <TabsList>
                <TabsTrigger value="simple">Simple Filters</TabsTrigger>
                <TabsTrigger value="advanced">Advanced (AND/OR)</TabsTrigger>
              </TabsList>
            </Tabs>
            {currentViewId && (
              <ViewSubscriptionButton
                viewId={currentViewId}
                viewName="Current View"
                variant="outline"
                size="sm"
              />
            )}
          </div>

          {/* Filters - Simple or Advanced */}
          {filterMode === 'simple' ? (
            <AdvancedFilters
              tasks={tasks}
              projects={projects || []}
              users={users || []}
              availableStatuses={availableStatuses}
              onFilterChange={handleFilterChange}
              onActiveFiltersChange={handleActiveFiltersChange}
            />
          ) : (
            <AdvancedFiltersV2
              tasks={tasks}
              projects={projects || []}
              users={users || []}
              availableStatuses={availableStatuses}
              onFilterChange={handleFilterChange}
              onActiveFiltersChange={handleActiveFiltersChange}
            />
          )}

          {/* Sort Controls */}
          <div className="flex items-center gap-3 pt-3 border-t flex-wrap">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              Sort by:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange(option.value)}
                  className="gap-1 h-8"
                >
                  {option.label}
                  {sortBy === option.value && (
                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
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
              <Button variant="secondary" size="sm" disabled={isBulkProcessing || checkDeletePending()} className="h-8">
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
              <Button variant="secondary" size="sm" disabled={isBulkProcessing || checkDeletePending()} className="h-8">
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
              <Button variant="secondary" size="sm" disabled={isBulkProcessing || checkDeletePending()} className="h-8">
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
            disabled={isBulkProcessing || checkDeletePending()}
            onClick={() => setShowDeleteConfirm(true)}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {checkDeletePending() ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedTasks.size} tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              You will have 5 seconds to undo this action. After that, the tasks will be permanently deleted
              along with all associated comments, attachments, and history.
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
                Sorted by {sortOptions.find(o => o.value === sortBy)?.label} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
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
                    onClick={(event) => handleTaskRowClick(task.id, event)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <Checkbox 
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => {}}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskSelection(task.id, e as unknown as React.MouseEvent);
                        }}
                        data-ignore-row-click
                        className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px]"
                        aria-label={`Select task ${task.title}`}
                      />
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          openTaskModal(task.id);
                        }}
                        data-ignore-row-click
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
                        {task.tags.split(",").map((tag: string, i: number) => (
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
                        onClick={(event) => handleTaskRowClick(task.id, event)}
                      >
                        <TableCell className="w-10">
                          <Checkbox 
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={() => {}}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskSelection(task.id, e as unknown as React.MouseEvent);
                            }}
                            data-ignore-row-click
                            aria-label={`Select task ${task.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <button 
                              onClick={(event) => {
                                event.stopPropagation();
                                openTaskModal(task.id);
                              }}
                              data-ignore-row-click
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
                                {task.tags.split(",").map((tag: string, i: number) => (
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
                            onClick={(event) => {
                              event.stopPropagation();
                              openTaskModal(task.id);
                            }}
                            data-ignore-row-click
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
              {hasActiveFilters && (
                <Button onClick={handleClearAll}>
                  Clear All Filters
                </Button>
              )}
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
