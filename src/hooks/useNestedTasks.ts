import { useState, useCallback, useMemo } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { apiService, Task } from '@/services/apiService';
import { toast } from 'sonner';

interface UseNestedTasksOptions {
  projectId?: number;
  parentTaskId?: number;
  initialExpanded?: boolean;
}

interface UseNestedTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  expandedTaskIds: number[];
  toggleExpand: (taskId: number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  expandToTask: (taskId: number) => void;
  createSubTask: (parentTaskId: number, taskData: Partial<Task>) => Promise<Task | null>;
  moveTask: (taskId: number, newParentId: number | null, newOrder?: number) => Promise<void>;
  setParentTask: (taskId: number, parentTaskId: number | null) => Promise<void>;
  getTaskHierarchy: (taskId: number) => Promise<{
    task: Task;
    ancestors: Task[];
    descendants: Task[];
    siblings: Task[];
  } | null>;
  refreshTasks: () => Promise<void>;
  getRootTasks: () => Task[];
  getTaskChildren: (parentTaskId: number) => Task[];
  getTaskDepth: (taskId: number) => number;
  canNestMore: (parentTaskId: number) => boolean;
}

export const useNestedTasks = (options: UseNestedTasksOptions = {}): UseNestedTasksReturn => {
  const { projectId, parentTaskId, initialExpanded = false } = options;
  const { tasks, setTasks, setLoading, setError } = useApiStore();
  
  const [expandedTaskIds, setExpandedTaskIds] = useState<number[]>([]);
  const [isLoading, setIsLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Toggle expand/collapse for a task
  const toggleExpand = useCallback((taskId: number) => {
    setExpandedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  // Expand all tasks
  const expandAll = useCallback(() => {
    const allTaskIds = tasks.data?.map(t => t.id) || [];
    setExpandedTaskIds(allTaskIds);
  }, [tasks.data]);

  // Collapse all tasks
  const collapseAll = useCallback(() => {
    setExpandedTaskIds([]);
  }, []);

  // Expand path to a specific task (showing all ancestors)
  const expandToTask = useCallback((taskId: number) => {
    const task = tasks.data?.find(t => t.id === taskId);
    if (!task) return;

    const ancestorIds: number[] = [];
    let currentTask = task;
    
    while (currentTask.parentTaskId) {
      ancestorIds.push(currentTask.parentTaskId);
      currentTask = tasks.data?.find(t => t.id === currentTask.parentTaskId) || currentTask;
    }

    setExpandedTaskIds(prev => [...new Set([...prev, ...ancestorIds])]);
  }, [tasks.data]);

  // Create a sub-task
  const createSubTask = useCallback(async (
    parentTaskId: number, 
    taskData: Partial<Task>
  ): Promise<Task | null> => {
    const loadingToast = toast.loading('Creating sub-task...');
    
    try {
      const newTask = await apiService.createSubTask(parentTaskId, {
        ...taskData,
        projectId: taskData.projectId || projectId,
      });
      
      // Update local state
      if (tasks.data) {
        setTasks([...tasks.data, newTask]);
      }
      
      // Auto-expand parent
      setExpandedTaskIds(prev => 
        prev.includes(parentTaskId) ? prev : [...prev, parentTaskId]
      );
      
      toast.success('Sub-task created successfully!', { id: loadingToast });
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sub-task';
      toast.error(errorMessage, { id: loadingToast });
      setErrorState(errorMessage);
      return null;
    }
  }, [tasks.data, setTasks, projectId]);

  // Move a task to a new parent or reorder
  const moveTask = useCallback(async (
    taskId: number,
    newParentId: number | null,
    newOrder?: number
  ): Promise<void> => {
    try {
      await apiService.moveSubTask(taskId, newParentId, newOrder);
      
      // Optimistic update
      if (tasks.data) {
        const updatedTasks = tasks.data.map(t => 
          t.id === taskId 
            ? { ...t, parentTaskId: newParentId, order: newOrder }
            : t
        );
        setTasks(updatedTasks);
      }
      
      toast.success('Task moved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move task';
      toast.error(errorMessage);
      throw err;
    }
  }, [tasks.data, setTasks]);

  // Set parent task
  const setParentTask = useCallback(async (
    taskId: number,
    parentTaskId: number | null
  ): Promise<void> => {
    try {
      await apiService.setParentTask(taskId, parentTaskId);
      
      // Optimistic update
      if (tasks.data) {
        const updatedTasks = tasks.data.map(t => 
          t.id === taskId ? { ...t, parentTaskId } : t
        );
        setTasks(updatedTasks);
      }
      
      toast.success(parentTaskId ? 'Task nested successfully' : 'Task unnested successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update parent task';
      toast.error(errorMessage);
      throw err;
    }
  }, [tasks.data, setTasks]);

  // Get task hierarchy
  const getTaskHierarchy = useCallback(async (taskId: number) => {
    try {
      return await apiService.getTaskHierarchy(taskId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get task hierarchy';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Refresh tasks
  const refreshTasks = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoadingState(true);
    setErrorState(null);
    
    try {
      const freshTasks = await apiService.getProjectTasksWithHierarchy(projectId, {
        includeSubTasks: true,
      });
      setTasks(freshTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh tasks';
      setErrorState(errorMessage);
    } finally {
      setIsLoadingState(false);
    }
  }, [projectId, setTasks]);

  // Get root tasks (no parent)
  const getRootTasks = useCallback((): Task[] => {
    return tasks.data?.filter(t => !t.parentTaskId) || [];
  }, [tasks.data]);

  // Get children of a specific task
  const getTaskChildren = useCallback((parentTaskId: number): Task[] => {
    return tasks.data?.filter(t => t.parentTaskId === parentTaskId) || [];
  }, [tasks.data]);

  // Calculate depth of a task in the hierarchy
  const getTaskDepth = useCallback((taskId: number): number => {
    const task = tasks.data?.find(t => t.id === taskId);
    if (!task || !task.parentTaskId) return 0;
    
    let depth = 0;
    let currentTask = task;
    
    while (currentTask.parentTaskId) {
      depth++;
      currentTask = tasks.data?.find(t => t.id === currentTask.parentTaskId) || currentTask;
      if (!currentTask.parentTaskId) break;
    }
    
    return depth;
  }, [tasks.data]);

  // Check if a task can have more nested children
  const canNestMore = useCallback((parentTaskId: number): boolean => {
    const depth = getTaskDepth(parentTaskId);
    return depth < 10; // Maximum nesting depth of 10
  }, [getTaskDepth]);

  return {
    tasks: tasks.data || [],
    isLoading: tasks.isLoading || isLoading,
    error: tasks.error || error,
    expandedTaskIds,
    toggleExpand,
    expandAll,
    collapseAll,
    expandToTask,
    createSubTask,
    moveTask,
    setParentTask,
    getTaskHierarchy,
    refreshTasks,
    getRootTasks,
    getTaskChildren,
    getTaskDepth,
    canNestMore,
  };
};

export default useNestedTasks;
