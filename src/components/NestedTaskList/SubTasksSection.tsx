import React, { useState } from 'react';
import { Task } from '@/services/apiService';
import { useNestedTasks } from '@/hooks/useNestedTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  GitCommitVertical, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubTaskItemProps {
  task: Task;
  depth?: number;
  isExpanded?: boolean;
  onToggleExpand?: (taskId: number) => void;
  onSubTaskClick?: (taskId: number) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  task,
  depth = 0,
  isExpanded = false,
  onToggleExpand,
  onSubTaskClick,
}) => {
  const hasSubTasks = task.subTaskCount && task.subTaskCount > 0;
  const isCompleted = task.status === 'Completed';

  return (
    <div 
      className={cn(
        'flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer group',
        isCompleted && 'opacity-60'
      )}
      style={{ paddingLeft: `${12 + depth * 20}px` }}
      onClick={() => onSubTaskClick?.(task.id)}
    >
      {/* Expand/Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        disabled={!hasSubTasks}
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand?.(task.id);
        }}
      >
        {hasSubTasks && (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )
        )}
      </Button>

      {/* Status indicator */}
      <div className={cn(
        'w-2 h-2 rounded-full',
        isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
      )} />

      {/* Task title */}
      <span className={cn(
        'flex-1 text-sm truncate',
        isCompleted && 'line-through text-muted-foreground'
      )}>
        {task.title}
      </span>

      {/* Sub-task count */}
      {hasSubTasks && (
        <span className="text-xs text-muted-foreground">
          {task.subTaskCount}
        </span>
      )}
    </div>
  );
};

interface SubTasksSectionProps {
  parentTaskId: number;
  projectId: number;
  onSubTaskClick?: (taskId: number) => void;
  className?: string;
}

export const SubTasksSection: React.FC<SubTasksSectionProps> = ({
  parentTaskId,
  projectId,
  onSubTaskClick,
  className,
}) => {
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<number[]>([]);

  const {
    tasks,
    isLoading,
    createSubTask,
    getTaskChildren,
    refreshTasks,
  } = useNestedTasks({ projectId });

  // Get direct children of the parent task
  const subTasks = getTaskChildren(parentTaskId);
  const completedCount = subTasks.filter(t => t.status === 'Completed').length;

  const handleToggleExpand = (taskId: number) => {
    setExpandedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCreateSubTask = async () => {
    if (!newSubTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      await createSubTask(parentTaskId, {
        title: newSubTaskTitle.trim(),
        projectId,
        status: 'To Do',
      });
      setNewSubTaskTitle('');
      await refreshTasks();
    } catch (error) {
      console.error('Failed to create sub-task:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSubTask();
    } else if (e.key === 'Escape') {
      setNewSubTaskTitle('');
    }
  };

  // Recursively render sub-tasks
  const renderSubTasks = (parentId: number, depth: number = 0): React.ReactNode => {
    const children = getTaskChildren(parentId);
    if (children.length === 0) return null;

    return children.map(task => (
      <React.Fragment key={task.id}>
        <SubTaskItem
          task={task}
          depth={depth}
          isExpanded={expandedTaskIds.includes(task.id)}
          onToggleExpand={handleToggleExpand}
          onSubTaskClick={onSubTaskClick}
        />
        {expandedTaskIds.includes(task.id) && renderSubTasks(task.id, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommitVertical className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Sub-tasks</h3>
          {subTasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{subTasks.length}
            </span>
          )}
        </div>
        
        {/* Progress indicator */}
        {subTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(completedCount / subTasks.length) * 100}%` }}
              />
            </div>
            {completedCount === subTasks.length && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Sub-tasks list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : subTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No sub-tasks yet. Add one below.
        </p>
      ) : (
        <div className="border rounded-lg divide-y">
          {renderSubTasks(parentTaskId, 0)}
        </div>
      )}

      {/* Add sub-task input */}
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Add a sub-task..."
          value={newSubTaskTitle}
          onChange={(e) => setNewSubTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
          disabled={isAdding}
        />
        <Button
          size="sm"
          className="h-8"
          onClick={handleCreateSubTask}
          disabled={!newSubTaskTitle.trim() || isAdding}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Add'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubTasksSection;
