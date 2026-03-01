import React from 'react';
import { Task } from '@/services/apiService';
import { cn } from '@/lib/utils';
import { Circle, GitCommitVertical, CornerDownRight } from 'lucide-react';

interface TaskHierarchyIndicatorProps {
  task: Task;
  depth?: number;
  showConnector?: boolean;
  className?: string;
}

export const TaskHierarchyIndicator: React.FC<TaskHierarchyIndicatorProps> = ({
  task,
  depth = 0,
  showConnector = true,
  className,
}) => {
  const hasSubTasks = task.subTaskCount && task.subTaskCount > 0;
  
  // Generate connector lines based on depth
  const renderConnectors = () => {
    const connectors = [];
    for (let i = 0; i < depth; i++) {
      connectors.push(
        <div
          key={i}
          className={cn(
            'absolute top-0 bottom-0 w-px bg-border',
            i === depth - 1 && hasSubTasks && 'bg-primary/50'
          )}
          style={{ left: `${i * 16 + 8}px` }}
        />
      );
    }
    return connectors;
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      {/* Connector lines */}
      {showConnector && depth > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {renderConnectors()}
        </div>
      )}
      
      {/* Node indicator */}
      <div 
        className={cn(
          'relative z-10 flex items-center justify-center w-4 h-4 rounded-full border-2',
          hasSubTasks 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/30 bg-background',
          depth === 0 && 'w-5 h-5 border-primary/50'
        )}
        style={{ marginLeft: depth > 0 ? `${depth * 16}px` : 0 }}
      >
        {hasSubTasks ? (
          <GitCommitVertical className="w-3 h-3 text-primary" />
        ) : (
          <Circle className="w-2 h-2 text-muted-foreground" />
        )}
      </div>
      
      {/* Depth indicator badge */}
      {depth > 0 && (
        <span className="ml-2 text-xs text-muted-foreground">
          L{depth}
        </span>
      )}
    </div>
  );
};

interface TaskBreadcrumbProps {
  ancestors: Task[];
  onTaskClick?: (taskId: number) => void;
  className?: string;
}

export const TaskBreadcrumb: React.FC<TaskBreadcrumbProps> = ({
  ancestors,
  onTaskClick,
  className,
}) => {
  if (ancestors.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      {ancestors.map((task, index) => (
        <React.Fragment key={task.id}>
          {index > 0 && (
            <CornerDownRight className="w-3 h-3 text-muted-foreground mx-1" />
          )}
          <button
            onClick={() => onTaskClick?.(task.id)}
            className="text-muted-foreground hover:text-primary hover:underline truncate max-w-[120px]"
            title={task.title}
          >
            {task.title}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

interface TaskDepthBadgeProps {
  depth: number;
  maxDepth?: number;
  className?: string;
}

export const TaskDepthBadge: React.FC<TaskDepthBadgeProps> = ({
  depth,
  maxDepth = 10,
  className,
}) => {
  const isNearLimit = depth >= maxDepth - 2;
  const isAtLimit = depth >= maxDepth;

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
        isAtLimit && 'bg-destructive/10 text-destructive',
        isNearLimit && !isAtLimit && 'bg-warning/10 text-warning',
        !isNearLimit && 'bg-muted text-muted-foreground',
        className
      )}
      title={`Hierarchy depth: ${depth}/${maxDepth}`}
    >
      {depth === 0 ? 'Root' : `L${depth}`}
    </span>
  );
};

interface SubTaskCounterProps {
  count: number;
  completedCount?: number;
  showZero?: boolean;
  className?: string;
}

export const SubTaskCounter: React.FC<SubTaskCounterProps> = ({
  count,
  completedCount,
  showZero = false,
  className,
}) => {
  if (count === 0 && !showZero) return null;

  const allCompleted = completedCount !== undefined && completedCount === count && count > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        allCompleted 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      <GitCommitVertical className="w-3 h-3" />
      {completedCount !== undefined ? (
        <span>
          {completedCount}/{count}
        </span>
      ) : (
        <span>{count}</span>
      )}
    </span>
  );
};

export default TaskHierarchyIndicator;
