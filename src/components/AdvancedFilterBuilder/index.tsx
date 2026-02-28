import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Filter, 
  X, 
  Plus, 
  Calendar as CalendarIcon, 
  Braces
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { 
  AdvancedTaskFilter, 
  FieldCondition, 
  ConditionGroup,
  TaskFilterField,
  FilterOperator 
} from '@/services/advancedFilterApi';

// Filter field options
const filterFieldOptions: { value: TaskFilterField; label: string; type: 'string' | 'number' | 'date' | 'boolean' }[] = [
  { value: 'title', label: 'Title', type: 'string' },
  { value: 'description', label: 'Description', type: 'string' },
  { value: 'status', label: 'Status', type: 'string' },
  { value: 'priority', label: 'Priority', type: 'string' },
  { value: 'taskType', label: 'Task Type', type: 'string' },
  { value: 'tags', label: 'Tags', type: 'string' },
  { value: 'assignedUserId', label: 'Assignee', type: 'number' },
  { value: 'authorUserId', label: 'Author', type: 'number' },
  { value: 'projectId', label: 'Project', type: 'number' },
  { value: 'dueDate', label: 'Due Date', type: 'date' },
  { value: 'startDate', label: 'Start Date', type: 'date' },
  { value: 'points', label: 'Story Points', type: 'number' },
];

// Operator options
const operatorOptions: { value: FilterOperator; label: string; types: string[] }[] = [
  { value: 'equals', label: 'equals', types: ['string', 'number', 'date', 'boolean'] },
  { value: 'notEquals', label: 'not equals', types: ['string', 'number', 'date', 'boolean'] },
  { value: 'contains', label: 'contains', types: ['string'] },
  { value: 'notContains', label: 'does not contain', types: ['string'] },
  { value: 'startsWith', label: 'starts with', types: ['string'] },
  { value: 'endsWith', label: 'ends with', types: ['string'] },
  { value: 'greaterThan', label: 'greater than', types: ['number', 'date'] },
  { value: 'lessThan', label: 'less than', types: ['number', 'date'] },
  { value: 'greaterThanOrEqual', label: 'greater than or equal', types: ['number', 'date'] },
  { value: 'lessThanOrEqual', label: 'less than or equal', types: ['number', 'date'] },
  { value: 'in', label: 'is in', types: ['string', 'number'] },
  { value: 'notIn', label: 'is not in', types: ['string', 'number'] },
  { value: 'isEmpty', label: 'is empty', types: ['string', 'number', 'date'] },
  { value: 'isNotEmpty', label: 'is not empty', types: ['string', 'number', 'date'] },
];

// Priority options
const priorityOptions = ['P0', 'P1', 'P2', 'P3', 'P4'];
const taskTypeOptions = ['Feature', 'Bug', 'Chore'];
const statusOptions = ['To Do', 'Work In Progress', 'Under Review', 'Completed', 'Archived'];

interface AdvancedFilterBuilderProps {
  initialFilter?: AdvancedTaskFilter;
  projects?: Array<{ id: number; name: string }>;
  users?: Array<{ userId: number; username: string }>;
  onFilterChange: (filter: AdvancedTaskFilter) => void;
  onApply?: () => void;
}

// Type guard for field condition
const isFieldCondition = (condition: FieldCondition | ConditionGroup): condition is FieldCondition => {
  return 'field' in condition;
};

// Type guard for condition group
const isConditionGroup = (condition: FieldCondition | ConditionGroup): condition is ConditionGroup => {
  return 'conditions' in condition && !('field' in condition);
};

/**
 * Advanced Filter Builder with Nested AND/OR Support
 * 
 * Features:
 * - Create nested condition groups (groups within groups)
 * - Combine AND/OR operators at any level
 * - Visual tree representation of filter structure
 * - Add, remove, reorder conditions and groups
 */
export const AdvancedFilterBuilder: React.FC<AdvancedFilterBuilderProps> = ({
  initialFilter,
  projects = [],
  users = [],
  onFilterChange,
  onApply,
}) => {
  const [filter, setFilter] = useState<AdvancedTaskFilter>(initialFilter || { operator: 'AND', conditions: [] });
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'json'>('builder');

  // Get operators for a field type
  const getOperatorsForField = (fieldType: string) => {
    return operatorOptions.filter(op => op.types.includes(fieldType));
  };

  // Add a field condition
  const addFieldCondition = useCallback((parentPath: number[] = []) => {
    const newCondition: FieldCondition = {
      field: 'title',
      operator: 'contains',
      value: '',
    };

    setFilter(prev => {
      const newFilter = { ...prev };
      let target: (FieldCondition | ConditionGroup)[] = newFilter.conditions;
      
      // Navigate to parent group
      for (let i = 0; i < parentPath.length; i++) {
        const group = target[parentPath[i]] as ConditionGroup;
        target = group.conditions;
      }
      
      target.push(newCondition);
      return newFilter;
    });
  }, []);

  // Add a condition group
  const addConditionGroup = useCallback((parentPath: number[] = []) => {
    const newGroup: ConditionGroup = {
      operator: 'OR',
      conditions: [],
    };

    setFilter(prev => {
      const newFilter = { ...prev };
      let target: (FieldCondition | ConditionGroup)[] = newFilter.conditions;
      
      for (let i = 0; i < parentPath.length; i++) {
        const group = target[parentPath[i]] as ConditionGroup;
        target = group.conditions;
      }
      
      target.push(newGroup);
      return newFilter;
    });
  }, []);

  // Remove condition at path
  const removeCondition = useCallback((path: number[]) => {
    setFilter(prev => {
      const newFilter = { ...prev };
      let target: (FieldCondition | ConditionGroup)[] = newFilter.conditions;
      
      for (let i = 0; i < path.length - 1; i++) {
        const group = target[path[i]] as ConditionGroup;
        target = group.conditions;
      }
      
      target.splice(path[path.length - 1], 1);
      return newFilter;
    });
  }, []);

  // Update field condition
  const updateFieldCondition = useCallback((path: number[], updates: Partial<FieldCondition>) => {
    setFilter(prev => {
      const newFilter = { ...prev };
      let target: (FieldCondition | ConditionGroup)[] = newFilter.conditions;
      
      for (let i = 0; i < path.length - 1; i++) {
        const group = target[path[i]] as ConditionGroup;
        target = group.conditions;
      }
      
      const condition = target[path[path.length - 1]] as FieldCondition;
      target[path[path.length - 1]] = { ...condition, ...updates };
      return newFilter;
    });
  }, []);

  // Update group operator
  const updateGroupOperator = useCallback((path: number[], operator: 'AND' | 'OR') => {
    setFilter(prev => {
      const newFilter = { ...prev };
      
      if (path.length === 0) {
        // Update root operator
        newFilter.operator = operator;
      } else {
        let target: (FieldCondition | ConditionGroup)[] = newFilter.conditions;
        
        for (let i = 0; i < path.length - 1; i++) {
          const group = target[path[i]] as ConditionGroup;
          target = group.conditions;
        }
        
        const group = target[path[path.length - 1]] as ConditionGroup;
        target[path[path.length - 1]] = { ...group, operator };
      }
      
      return newFilter;
    });
  }, []);

  // Get condition count
  const conditionCount = useMemo(() => {
    const countConditions = (conditions: (FieldCondition | ConditionGroup)[]): number => {
      let count = 0;
      for (const condition of conditions) {
        if (isFieldCondition(condition)) {
          count++;
        } else if (isConditionGroup(condition)) {
          count += countConditions(condition.conditions);
        }
      }
      return count;
    };
    return countConditions(filter.conditions);
  }, [filter]);

  // Render value input based on field type
  const renderValueInput = (condition: FieldCondition, path: number[]) => {
    const fieldDef = filterFieldOptions.find(f => f.value === condition.field);
    const fieldType = fieldDef?.type || 'string';

    // No value input for isEmpty/isNotEmpty operators
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      return null;
    }

    // Date range input
    if (fieldType === 'date' && condition.operator === 'between') {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {condition.value ? (
                typeof condition.value === 'object' && 'from' in condition.value
                  ? `${format(new Date(String(condition.value.from)), 'LLL dd')} - ${format(new Date(String(condition.value.to)), 'LLL dd')}`
                  : 'Select range'
              ) : (
                'Select range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={
                condition.value && typeof condition.value === 'object' && 'from' in condition.value
                  ? { from: new Date(String(condition.value.from)), to: new Date(String(condition.value.to)) }
                  : undefined
              }
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  updateFieldCondition(path, {
                    value: { from: range.from.toISOString(), to: range.to.toISOString() }
                  });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      );
    }

    // Priority select
    if (condition.field === 'priority') {
      return (
        <Select
          value={condition.value as string}
          onValueChange={(v) => updateFieldCondition(path, { value: v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Task type select
    if (condition.field === 'taskType') {
      return (
        <Select
          value={condition.value as string}
          onValueChange={(v) => updateFieldCondition(path, { value: v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {taskTypeOptions.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Status select
    if (condition.field === 'status') {
      return (
        <Select
          value={condition.value as string}
          onValueChange={(v) => updateFieldCondition(path, { value: v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Assignee/Author select
    if (condition.field === 'assignedUserId' || condition.field === 'authorUserId') {
      return (
        <Select
          value={String(condition.value)}
          onValueChange={(v) => updateFieldCondition(path, { value: parseInt(v) })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.userId} value={String(u.userId)}>{u.username}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Project select
    if (condition.field === 'projectId') {
      return (
        <Select
          value={String(condition.value)}
          onValueChange={(v) => updateFieldCondition(path, { value: parseInt(v) })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Default text input
    return (
      <Input
        type={fieldType === 'number' ? 'number' : 'text'}
        value={String(condition.value || '')}
        onChange={(e) => updateFieldCondition(path, { value: e.target.value })}
        className="w-[150px]"
        placeholder="Enter value..."
      />
    );
  };

  // Render a condition group recursively
  const renderConditionGroup = (
    conditions: (FieldCondition | ConditionGroup)[],
    path: number[] = [],
    isRoot = false,
    groupOperator?: 'AND' | 'OR'
  ) => {
    const operator = isRoot ? filter.operator : (groupOperator || 'AND');

    return (
      <div className={cn(
        "space-y-2",
        !isRoot && "pl-4 border-l-2 border-border ml-2"
      )}>
        {/* Operator Toggle */}
        <div className="flex items-center gap-2">
          <Select
            value={operator}
            onValueChange={(v) => updateGroupOperator(path, v as 'AND' | 'OR')}
          >
            <SelectTrigger className="w-[100px] h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">Match ALL</SelectItem>
              <SelectItem value="OR">Match ANY</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            of the following {conditions.length > 0 ? `(${conditions.length})` : ''}
          </span>
        </div>

        {/* Conditions */}
        <div className="space-y-2">
          {conditions.map((condition, index) => {
            const currentPath = [...path, index];

            if (isFieldCondition(condition)) {
              return (
                <div key={currentPath.join('-')} className="flex items-center gap-2 flex-wrap">
                  {/* Field Select */}
                  <Select
                    value={condition.field}
                    onValueChange={(v) => {
                      const fieldDef = filterFieldOptions.find(f => f.value === v);
                      updateFieldCondition(currentPath, { 
                        field: v as TaskFilterField, 
                        operator: 'equals',
                        value: fieldDef?.type === 'number' ? 0 : '' 
                      });
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterFieldOptions.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator Select */}
                  <Select
                    value={condition.operator}
                    onValueChange={(v) => updateFieldCondition(currentPath, { operator: v as FilterOperator })}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorsForField(filterFieldOptions.find(f => f.value === condition.field)?.type || 'string')
                        .map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Value Input */}
                  {renderValueInput(condition, currentPath)}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(currentPath)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            }

            if (isConditionGroup(condition)) {
              return (
                <div key={currentPath.join('-')} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Braces className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Group</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(currentPath)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive ml-auto"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {renderConditionGroup(condition.conditions, currentPath, false, condition.operator)}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Add Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addFieldCondition(path)}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addConditionGroup(path)}
            className="h-7 text-xs"
          >
            <Braces className="h-3 w-3 mr-1" />
            Add Group
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Button
          variant={conditionCount > 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {conditionCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {conditionCount}
            </Badge>
          )}
        </Button>

        {conditionCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter({ operator: 'AND', conditions: [] });
              onFilterChange({ operator: 'AND', conditions: [] });
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}

        {conditionCount > 0 && onApply && (
          <Button size="sm" onClick={onApply} className="ml-auto">
            Apply Filters
          </Button>
        )}
      </div>

      {/* Expanded Builder */}
      {isExpanded && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          {/* Tabs */}
          <div className="flex items-center gap-4 border-b pb-2">
            <button
              onClick={() => setActiveTab('builder')}
              className={cn(
                "text-sm font-medium pb-2 border-b-2 transition-colors",
                activeTab === 'builder' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Visual Builder
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={cn(
                "text-sm font-medium pb-2 border-b-2 transition-colors",
                activeTab === 'json' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              JSON View
            </button>
          </div>

          {activeTab === 'builder' ? (
            <>
              {filter.conditions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No filters yet. Add conditions to start filtering.</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => addFieldCondition([])}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addConditionGroup([])}>
                      <Braces className="h-4 w-4 mr-1" />
                      Add Group
                    </Button>
                  </div>
                </div>
              ) : (
                renderConditionGroup(filter.conditions, [], true)
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Label>Filter JSON</Label>
              <textarea
                value={JSON.stringify(filter, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFilter(parsed);
                    onFilterChange(parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full h-64 font-mono text-xs p-3 rounded-md border bg-muted"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterBuilder;
