import React, { useState, useCallback, useMemo } from 'react';
import { Task } from '@/services/apiService';
import TaskCard from '@/components/TaskCard';
import { ChevronRight, ChevronDown, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NestedTaskItemProps {
  task: Task;
  depth?: number;
  isExpanded?: boolean;
  onToggleExpand?: (taskId: number) => void;
  onSelect?: (taskId: number, selected: boolean) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  onAddSubTask?: (parentTaskId: number) => void;
  onDragStart?: (taskId: number, parentTaskId: number | null) => void;
  onDragOver?: (targetTaskId: number, position: 'before' | 'after' | 'child') => void;
  onDrop?: () => void;
  draggable?: boolean;
  className?: string;
}

const NestedTaskItem: React.FC<NestedTaskItemProps> = ({
  task,
  depth = 0,
  isExpanded = false,
  onToggleExpand,
  onSelect,
  isSelected = false,
  selectionMode = false,
  onAddSubTask,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
  className,
}) => {
  const hasSubTasks = task.subTaskCount && task.subTaskCount > 0;
  const isDraggable = draggable && depth === 0; // Only root tasks draggable at top level

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('parentTaskId', task.parentTaskId?.toString() || '');
    onDragStart?.(task.id, task.parentTaskId || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'child';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'child';
    }
    
    onDragOver?.(task.id, position);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.();
  };

  return (
    <div
      className={cn('relative', className)}
      style={{ marginLeft: depth > 0 ? `${depth * 24}px` : undefined }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hierarchy connector lines */}
      {depth > 0 && (
        <div className="absolute left-[-12px] top-0 bottom-0 w-px bg-border" />
      )}
      
      <div className="flex items-start gap-2 group">
        {/* Expand/Collapse button */}
        <div className="flex items-center gap-1 pt-3">
          {hasSubTasks ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.(task.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          ) : (
            <div className="h-5 w-5" />
          )}
          
          {/* Drag handle */}
          {draggable && depth === 0 && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Task Card */}
        <div className="flex-1">
          <TaskCard
            task={task}
            isSelected={isSelected}
            onSelect={onSelect}
            selectionMode={selectionMode}
          />
        </div>

        {/* Add sub-task button */}
        <div className="pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onAddSubTask?.(task.id);
            }}
            title="Add sub-task"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NestedTaskListProps {
  tasks: Task[];
  onSelect?: (taskId: number, selected: boolean) => void;
  selectedTaskIds?: number[];
  selectionMode?: boolean;
  onAddSubTask?: (parentTaskId: number) => void;
  onToggleExpand?: (taskId: number) => void;
  expandedTaskIds?: number[];
  draggable?: boolean;
  onReorder?: (taskId: number, newParentId: number | null, newOrder: number) => void;
  className?: string;
  emptyState?: React.ReactNode;
  maxDepth?: number;
}

export const NestedTaskList: React.FC<NestedTaskListProps> = ({
  tasks,
  onSelect,
  selectedTaskIds = [],
  selectionMode = false,
  onAddSubTask,
  onToggleExpand,
  expandedTaskIds = [],
  draggable = false,
  onReorder,
  className,
  emptyState,
  maxDepth = 10,
}) => {
  const [dragState, setDragState] = useState<{
    taskId: number | null;
    parentTaskId: number | null;
    targetTaskId: number | null;
    position: 'before' | 'after' | 'child' | null;
  }>({
    taskId: null,
    parentTaskId: null,
    targetTaskId: null,
    position: null,
  });

  // Build task tree structure
  const taskTree = useMemo(() => {
    const taskMap = new Map<number, Task & { children: Task[] }>();
    const rootTasks: (Task & { children: Task[] })[] = [];

    // First pass: create task objects with children array
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Second pass: build hierarchy
    tasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id)!;
      if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
        const parent = taskMap.get(task.parentTaskId)!;
        parent.children.push(taskWithChildren);
      } else {
        rootTasks.push(taskWithChildren);
      }
    });

    return rootTasks;
  }, [tasks]);

  const handleDragStart = useCallback((taskId: number, parentTaskId: number | null) => {
    setDragState(prev => ({ ...prev, taskId, parentTaskId }));
  }, []);

  const handleDragOver = useCallback((targetTaskId: number, position: 'before' | 'after' | 'child') => {
    setDragState(prev => ({ ...prev, targetTaskId, position }));
  }, []);

  const handleDrop = useCallback(() => {
    if (dragState.taskId && dragState.targetTaskId && dragState.position) {
      let newParentId: number | null = null;
      let newOrder = 0;

      // Calculate new parent and order based on drop position
      if (dragState.position === 'child') {
        newParentId = dragState.targetTaskId;
        newOrder = 0; // Add as first child
      } else {
        // Find the target task's parent
        const targetTask = tasks.find(t => t.id === dragState.targetTaskId);
        newParentId = targetTask?.parentTaskId || null;
        
        // Calculate order based on position
        const siblingTasks = tasks.filter(t => t.parentTaskId === newParentId);
        const targetIndex = siblingTasks.findIndex(t => t.id === dragState.targetTaskId);
        newOrder = dragState.position === 'before' ? targetIndex : targetIndex + 1;
      }

      onReorder?.(dragState.taskId, newParentId, newOrder);
    }
    setDragState({ taskId: null, parentTaskId: null, targetTaskId: null, position: null });
  }, [dragState, tasks, onReorder]);

  // Recursively render task and its children
  const renderTaskTree = (
    task: Task & { children: Task[] },
    depth: number = 0
  ): React.ReactNode => {
    if (depth > maxDepth) return null;

    const isExpanded = expandedTaskIds.includes(task.id);
    const isSelected = selectedTaskIds.includes(task.id);

    return (
      <React.Fragment key={task.id}>
        <NestedTaskItem
          task={task}
          depth={depth}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
          isSelected={isSelected}
          selectionMode={selectionMode}
          onAddSubTask={onAddSubTask}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggable={draggable}
          className={cn(
            dragState.targetTaskId === task.id && dragState.position === 'before' && 'border-t-2 border-primary',
            dragState.targetTaskId === task.id && dragState.position === 'after' && 'border-b-2 border-primary',
            dragState.targetTaskId === task.id && dragState.position === 'child' && 'bg-primary/5 rounded-lg'
          )}
        />
        
        {/* Render children if expanded */}
        {isExpanded && task.children && task.children.length > 0 && (
          <div className="mt-1">
            {task.children.map(child => renderTaskTree(child as Task & { children: Task[] }, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  if (taskTree.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        {emptyState || (
          <p className="text-muted-foreground">No tasks found</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {taskTree.map(task => renderTaskTree(task, 0))}
    </div>
  );
};

export default NestedTaskList;
