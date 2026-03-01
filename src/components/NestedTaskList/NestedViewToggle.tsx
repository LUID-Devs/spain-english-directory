import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  List, 
  GitCommitVertical, 
  ExpandAll, 
  CollapseAll,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ViewMode = 'flat' | 'nested';

interface NestedViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  expandedCount?: number;
  totalCount?: number;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  className?: string;
  disabled?: boolean;
}

export const NestedViewToggle: React.FC<NestedViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  expandedCount = 0,
  totalCount = 0,
  onExpandAll,
  onCollapseAll,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* View mode toggle */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        <Button
          variant={viewMode === 'flat' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onViewModeChange('flat')}
          disabled={disabled}
        >
          <List className="h-3.5 w-3.5 mr-1" />
          Flat
        </Button>
        <Button
          variant={viewMode === 'nested' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onViewModeChange('nested')}
          disabled={disabled}
        >
          <GitCommitVertical className="h-3.5 w-3.5 mr-1" />
          Nested
        </Button>
      </div>

      {/* Expand/Collapse controls - only show in nested mode */}
      {viewMode === 'nested' && totalCount > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={disabled}
            >
              {expandedCount > 0 ? (
                <>
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                  {expandedCount} expanded
                </>
              ) : (
                <>
                  <ChevronRight className="h-3.5 w-3.5 mr-1" />
                  Collapsed
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExpandAll}>
              <ExpandAll className="h-4 w-4 mr-2" />
              Expand All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCollapseAll}>
              <CollapseAll className="h-4 w-4 mr-2" />
              Collapse All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

interface NestedViewBadgeProps {
  depth: number;
  maxDepth?: number;
  className?: string;
}

export const NestedViewBadge: React.FC<NestedViewBadgeProps> = ({
  depth,
  maxDepth = 10,
  className,
}) => {
  const isNearLimit = depth >= maxDepth - 2;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
        depth === 0 && 'bg-primary/10 text-primary',
        depth > 0 && !isNearLimit && 'bg-muted text-muted-foreground',
        isNearLimit && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        className
      )}
    >
      {depth === 0 ? 'Root' : `L${depth}`}
    </span>
  );
};

export default NestedViewToggle;
