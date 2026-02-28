import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  X, 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronDown,
  Save,
  Trash2,
  Check,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  applyAdvancedFilter,
  validateAdvancedFilter,
  type AdvancedTaskFilter,
  type FieldCondition,
  type ConditionGroup,
  type FilterOperator,
  type TaskFilterField,
} from "@/services/advancedFilterApi";
import type { Task } from "@/hooks/useApi";

// Re-export types for backward compatibility
export type FilterType = "status" | "priority" | "assignee" | "project" | "dueDate" | "tags" | "title" | "description";

export interface FilterCriteria {
  id: string;
  type: FilterType;
  operator: "equals" | "notEquals" | "contains" | "before" | "after" | "between";
  value: string | string[] | Date | DateRange;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria[];
  logic: "AND" | "OR";
}

interface AdvancedFiltersProps {
  tasks?: Task[];
  projects?: Array<{ id: number; name: string }>;
  users?: Array<{ userId: number; username: string }>;
  availableStatuses?: string[];
  onFilterChange: (filteredTasks: Task[], pagination?: { totalCount: number; totalPages: number; hasNextPage: boolean }) => void;
  onActiveFiltersChange?: (count: number) => void;
  organizationId?: number;
}

// UI Filter Row Type
interface UIFilterRow {
  id: string;
  field: TaskFilterField;
  operator: FilterOperator;
  value: unknown;
  groupId?: string; // null means top level
}

// Filter Group Type
interface FilterGroup {
  id: string;
  operator: "AND" | "OR";
  filterIds: string[];
}

const filterTypeOptions: { value: TaskFilterField; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "assignedUserId", label: "Assignee" },
  { value: "authorUserId", label: "Author" },
  { value: "projectId", label: "Project" },
  { value: "dueDate", label: "Due Date" },
  { value: "startDate", label: "Start Date" },
  { value: "tags", label: "Tags" },
  { value: "taskType", label: "Task Type" },
  { value: "points", label: "Story Points" },
];

const operatorOptions: { value: FilterOperator; label: string; types: string[] }[] = [
  { value: "equals", label: "equals", types: ["string", "number", "boolean", "date"] },
  { value: "notEquals", label: "not equals", types: ["string", "number", "boolean", "date"] },
  { value: "contains", label: "contains", types: ["string"] },
  { value: "notContains", label: "does not contain", types: ["string"] },
  { value: "startsWith", label: "starts with", types: ["string"] },
  { value: "endsWith", label: "ends with", types: ["string"] },
  { value: "greaterThan", label: "after / greater than", types: ["number", "date"] },
  { value: "lessThan", label: "before / less than", types: ["number", "date"] },
  { value: "greaterThanOrEqual", label: "on or after", types: ["number", "date"] },
  { value: "lessThanOrEqual", label: "on or before", types: ["number", "date"] },
  { value: "in", label: "is in", types: ["string", "number"] },
  { value: "notIn", label: "is not in", types: ["string", "number"] },
  { value: "isEmpty", label: "is empty", types: ["string", "date", "number"] },
  { value: "isNotEmpty", label: "is not empty", types: ["string", "date", "number"] },
];

const priorityOptions = ["P0", "P1", "P2", "P3", "P4"];
const taskTypeOptions = ["Feature", "Bug", "Chore"];

export const AdvancedFiltersV2: React.FC<AdvancedFiltersProps> = ({
  tasks = [],
  projects = [],
  users = [],
  availableStatuses = [],
  onFilterChange,
  onActiveFiltersChange,
}) => {
  const { toast } = useToast();
  
  // State
  const [filterRows, setFilterRows] = useState<UIFilterRow[]>([]);
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [rootOperator, setRootOperator] = useState<"AND" | "OR">("AND");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedFilterIds, setSelectedFilterIds] = useState<string[]>([]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("taskluid_saved_filters_v2");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved filters", e);
      }
    }
  }, []);

  // Save filters to localStorage
  const persistSavedFilters = useCallback((filters: SavedFilter[]) => {
    localStorage.setItem("taskluid_saved_filters_v2", JSON.stringify(filters));
    setSavedFilters(filters);
  }, []);

  // Get unique tags from tasks
  const availableTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    tasks?.forEach((task) => {
      if (task.tags) {
        task.tags.split(",").forEach((tag) => tagsSet.add(tag.trim()));
      }
    });
    return Array.from(tagsSet).sort();
  }, [tasks]);

  // Convert UI state to API filter format
  const buildAdvancedFilter = useCallback((): AdvancedTaskFilter => {
    // Group filters by their groupId
    const filtersByGroup = new Map<string | undefined, UIFilterRow[]>();
    filterRows.forEach((row) => {
      const groupId = row.groupId;
      const existing = filtersByGroup.get(groupId);
      if (existing) {
        existing.push(row);
      } else {
        filtersByGroup.set(groupId, [row]);
      }
    });

    // Build conditions for each group
    const buildGroupConditions = (groupRows: UIFilterRow[]): (FieldCondition | ConditionGroup)[] => {
      return groupRows.map((row): FieldCondition => {
        let value = row.value;
        
        // Convert string IDs to numbers for numeric fields
        if (["assignedUserId", "authorUserId", "projectId", "cycleId", "id", "points"].includes(row.field)) {
          if (typeof value === "string" && value) {
            value = parseInt(value, 10);
          }
        }

        // Handle date range for between operator
        if (row.operator === "between" && value && typeof value === "object") {
          const range = value as DateRange;
          if (range.from && range.to) {
            value = { from: range.from, to: range.to };
          }
        }

        return {
          field: row.field,
          operator: row.operator,
          value: value as FieldCondition["value"],
        };
      });
    };

    // Build root conditions
    const rootConditions: (FieldCondition | ConditionGroup)[] = [];

    // Add ungrouped filters directly
    const ungrouped = filtersByGroup.get(undefined) || [];
    rootConditions.push(...buildGroupConditions(ungrouped));

    // Add each group as a ConditionGroup
    groups.forEach((group) => {
      const groupFilters = filtersByGroup.get(group.id) || [];
      if (groupFilters.length > 0) {
        rootConditions.push({
          operator: group.operator,
          conditions: buildGroupConditions(groupFilters),
        });
      }
    });

    return {
      operator: rootOperator,
      conditions: rootConditions,
    };
  }, [filterRows, groups, rootOperator]);

  // Apply filters via API
  // GREPTILE CONFIDENCE: Pagination metadata is passed to onFilterChange callback
  // via response.pagination (totalCount, totalPages, hasNextPage)
  const applyFilters = useCallback(async () => {
    if (filterRows.length === 0) {
      onFilterChange(tasks, undefined);
      return;
    }

    setIsLoading(true);
    try {
      const filter = buildAdvancedFilter();
      
      // Validate first
      const validation = await validateAdvancedFilter(filter);
      if (!validation.valid) {
        toast({
          title: "Invalid Filter",
          description: validation.error || "Please check your filter configuration",
          variant: "destructive",
        });
        return;
      }

      const response = await applyAdvancedFilter(filter, {
        page: 1,
        limit: 100,
        sortBy: "updatedAt",
        sortOrder: "desc",
      });

      if (response.success) {
        onFilterChange(response.tasks as unknown as Task[], {
          totalCount: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
          hasNextPage: response.pagination.hasNextPage,
        });
        toast({
          title: "Filters Applied",
          description: `Found ${response.pagination.totalCount} tasks matching your criteria`,
        });
      }
    } catch (error) {
      console.error("Failed to apply filters:", error);
      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterRows, buildAdvancedFilter, onFilterChange, tasks, toast]);

  // Notify parent of active filter count
  useEffect(() => {
    onActiveFiltersChange?.(filterRows.length);
  }, [filterRows.length, onActiveFiltersChange]);

  // Add a new filter row
  const addFilter = useCallback(() => {
    const newFilter: UIFilterRow = {
      id: Math.random().toString(36).substr(2, 9),
      field: "status",
      operator: "equals",
      value: availableStatuses[0] || "",
    };
    setFilterRows((prev) => [...prev, newFilter]);
    if (!isExpanded) setIsExpanded(true);
  }, [availableStatuses, isExpanded]);

  // Update a filter row
  const updateFilter = useCallback((id: string, updates: Partial<UIFilterRow>) => {
    setFilterRows((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  // Remove a filter row
  const removeFilter = useCallback((id: string) => {
    setFilterRows((prev) => prev.filter((f) => f.id !== id));
    // Remove from groups if in one
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        filterIds: g.filterIds.filter((fid) => fid !== id),
      }))
    );
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilterRows([]);
    setGroups([]);
    onFilterChange(tasks, undefined);
  }, [onFilterChange, tasks]);

  // Create a group from selected filters
  const createGroup = useCallback(() => {
    if (selectedFilterIds.length < 2) return;

    const newGroup: FilterGroup = {
      id: Math.random().toString(36).substr(2, 9),
      operator: "OR",
      filterIds: selectedFilterIds,
    };

    // Update filter rows with group assignment
    setFilterRows((prev) =>
      prev.map((f) =>
        selectedFilterIds.includes(f.id) ? { ...f, groupId: newGroup.id } : f
      )
    );

    setGroups((prev) => [...prev, newGroup]);
    setSelectedFilterIds([]);
    setGroupDialogOpen(false);
  }, [selectedFilterIds]);

  // Remove a group
  const removeGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    // Unassign filters from this group
    setFilterRows((prev) =>
      prev.map((f) => (f.groupId === groupId ? { ...f, groupId: undefined } : f))
    );
  }, []);

  // Update group operator
  const updateGroupOperator = useCallback((groupId: string, operator: "AND" | "OR") => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, operator } : g))
    );
  }, []);

  // Save current filter combination
  const saveFilter = useCallback(() => {
    if (!filterName.trim()) return;

    // Convert to legacy format for backward compatibility
    const legacyCriteria: FilterCriteria[] = filterRows.map((row) => ({
      id: row.id,
      type: row.field as FilterType,
      operator: row.operator as FilterCriteria["operator"],
      value: row.value as string,
    }));

    const newSavedFilter: SavedFilter = {
      id: Math.random().toString(36).substr(2, 9),
      name: filterName,
      criteria: legacyCriteria,
      logic: rootOperator,
    };

    persistSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
    setSaveDialogOpen(false);
    
    toast({
      title: "Filter Saved",
      description: `"${filterName}" has been saved for quick access`,
    });
  }, [filterName, filterRows, rootOperator, savedFilters, persistSavedFilters, toast]);

  // Load a saved filter
  const loadSavedFilter = useCallback((savedFilter: SavedFilter) => {
    const rows: UIFilterRow[] = savedFilter.criteria.map((c) => ({
      id: c.id,
      field: c.type as TaskFilterField,
      operator: c.operator as FilterOperator,
      value: c.value,
    }));
    setFilterRows(rows);
    setRootOperator(savedFilter.logic);
    setGroups([]); // Reset groups when loading legacy filters
    setIsExpanded(true);
  }, []);

  // Delete a saved filter
  const deleteSavedFilter = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persistSavedFilters(savedFilters.filter((f) => f.id !== id));
  }, [savedFilters, persistSavedFilters]);

  // Get operators available for a field type
  const getOperatorsForField = useCallback((field: TaskFilterField): typeof operatorOptions => {
    const fieldType = filterTypeOptions.find((f) => f.value === field)?.value;
    if (!fieldType) return operatorOptions;

    // Determine field type
    let type = "string";
    if (["dueDate", "startDate", "updatedAt", "archivedAt"].includes(field)) {
      type = "date";
    } else if (["id", "points", "projectId", "assignedUserId", "authorUserId", "cycleId"].includes(field)) {
      type = "number";
    } else if (["triaged", "isShared"].includes(field)) {
      type = "boolean";
    }

    return operatorOptions.filter((op) => op.types.includes(type));
  }, []);

  // Render filter value input based on field type
  const renderFilterValueInput = useCallback((filter: UIFilterRow) => {
    // For isEmpty/isNotEmpty operators, no value input needed
    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
      return null;
    }

    switch (filter.field) {
      case "status":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "priority":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "taskType":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "assignedUserId":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.userId} value={user.userId.toString()}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "authorUserId":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.userId} value={user.userId.toString()}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "projectId":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "tags":
        if (filter.operator === "in" || filter.operator === "notIn") {
          return (
            <Input
              placeholder="tag1, tag2, tag3"
              value={Array.isArray(filter.value) ? (filter.value as string[]).join(", ") : (filter.value as string) || ""}
              onChange={(e) => {
                const values = e.target.value.split(",").map((t) => t.trim());
                updateFilter(filter.id, { value: values });
              }}
              className="w-[180px]"
            />
          );
        }
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "dueDate":
      case "startDate": {
        const range = (filter.value as DateRange) || { from: undefined, to: undefined };
        if (filter.operator === "between") {
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !range.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range.from ? (
                    range.to ? (
                      <>
                        {format(range.from, "LLL dd")} - {format(range.to, "LLL dd")}
                      </>
                    ) : (
                      format(range.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={range.from}
                  selected={{
                    from: range.from,
                    to: range.to,
                  }}
                  onSelect={(selectedRange) => {
                    updateFilter(filter.id, {
                      value: {
                        from: selectedRange?.from,
                        to: selectedRange?.to,
                      },
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          );
        }
        return (
          <Input
            type="date"
            value={filter.value as string}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-[180px]"
          />
        );
      }

      case "points":
      case "id":
        return (
          <Input
            type="number"
            placeholder="Enter number"
            value={(filter.value as string) || ""}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-[180px]"
          />
        );

      case "title":
      case "description":
        return (
          <Input
            placeholder={`Enter ${filter.field}...`}
            value={(filter.value as string) || ""}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-[240px]"
          />
        );

      default:
        return (
          <Input
            placeholder="Enter value..."
            value={(filter.value as string) || ""}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-[180px]"
          />
        );
    }
  }, [availableStatuses, availableTags, projects, users, updateFilter]);

  // Get filter display label
  const getFilterDisplayLabel = useCallback((filter: UIFilterRow): string => {
    const fieldLabel = filterTypeOptions.find((o) => o.value === filter.field)?.label || filter.field;
    const operatorLabel = operatorOptions.find((o) => o.value === filter.operator)?.label || filter.operator;
    
    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
      return `${fieldLabel} ${operatorLabel}`;
    }

    let valueLabel = "";
    if (filter.field === "assignedUserId") {
      valueLabel = users?.find((u) => u.userId.toString() === filter.value)?.username || (filter.value as string) || "Unassigned";
    } else if (filter.field === "authorUserId") {
      valueLabel = users?.find((u) => u.userId.toString() === filter.value)?.username || (filter.value as string);
    } else if (filter.field === "projectId") {
      valueLabel = projects?.find((p) => p.id.toString() === filter.value)?.name || (filter.value as string);
    } else if (filter.field === "dueDate" || filter.field === "startDate") {
      if (filter.operator === "between") {
        const range = filter.value as DateRange;
        valueLabel = range?.from && range?.to 
          ? `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`
          : "Date Range";
      } else {
        valueLabel = filter.value as string;
      }
    } else {
      valueLabel = String(filter.value || "");
    }

    return `${fieldLabel} ${operatorLabel} ${valueLabel}`;
  }, [projects, users]);

  // Get active filter count display
  const activeFilterCount = filterRows.length;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Toggle Button */}
        <Button
          variant={activeFilterCount > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Root Logic Toggle */}
        {filterRows.length > 1 && (
          <Select value={rootOperator} onValueChange={(v) => setRootOperator(v as "AND" | "OR")}>
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">Match ALL</SelectItem>
              <SelectItem value="OR">Match ANY</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Apply Button */}
        {filterRows.length > 0 && (
          <Button
            size="sm"
            onClick={applyFilters}
            disabled={isLoading}
            className="h-8"
          >
            {isLoading ? "Loading..." : "Apply"}
          </Button>
        )}

        {/* Saved Filters Dropdown */}
        {savedFilters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Layers className="h-3 w-3" />
                Saved Views
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-1">
                {savedFilters.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer group"
                    onClick={() => loadSavedFilter(saved)}
                  >
                    <span className="text-sm truncate">{saved.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => deleteSavedFilter(saved.id, e)}
                      aria-label={`Delete saved filter ${saved.name}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Create Group Button */}
        {filterRows.length >= 2 && (
          <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Layers className="h-3 w-3" />
                Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Filter Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Select filters to group together with AND/OR logic
                </p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {filterRows.map((filter) => (
                    <label
                      key={filter.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilterIds.includes(filter.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFilterIds([...selectedFilterIds, filter.id]);
                          } else {
                            setSelectedFilterIds(selectedFilterIds.filter((id) => id !== filter.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{getFilterDisplayLabel(filter)}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createGroup}
                    disabled={selectedFilterIds.length < 2}
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}

        {/* Active Filter Badges */}
        <div className="flex flex-wrap gap-1 ml-auto">
          {filterRows.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-accent"
              onClick={() => removeFilter(filter.id)}
            >
              {getFilterDisplayLabel(filter)}
              <X className="h-3 w-3 ml-1 hover:text-destructive" />
            </Badge>
          ))}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          {/* Groups Display */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Filter Groups</Label>
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-2 p-2 rounded bg-muted/50"
                >
                  <Select
                    value={group.operator}
                    onValueChange={(v) => updateGroupOperator(group.id, v as "AND" | "OR")}
                  >
                    <SelectTrigger className="w-[100px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">ALL of</SelectItem>
                      <SelectItem value="OR">ANY of</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    ({group.filterIds.length} filters)
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => removeGroup(group.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Filter Rows */}
          <div className="space-y-3">
            {filterRows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active filters. Click "Add Filter" to start filtering tasks.
              </p>
            )}

            {filterRows.map((filter) => {
              const group = groups.find((g) => g.id === filter.groupId);
              
              return (
                <div
                  key={filter.id}
                  className={cn(
                    "flex items-center gap-2 flex-wrap p-2 rounded",
                    group && "bg-muted/30 border-l-2 border-primary"
                  )}
                >
                  {group && (
                    <Badge variant="outline" className="text-xs">
                      {group.operator}
                    </Badge>
                  )}

                  {/* Field Select */}
                  <Select
                    value={filter.field}
                    onValueChange={(value: TaskFilterField) => {
                      // Reset value and operator when field changes
                      const defaultOperators: Record<TaskFilterField, FilterOperator> = {
                        status: "equals",
                        priority: "equals",
                        assignedUserId: "equals",
                        authorUserId: "equals",
                        projectId: "equals",
                        dueDate: "between",
                        startDate: "between",
                        tags: "contains",
                        taskType: "equals",
                        title: "contains",
                        description: "contains",
                        id: "equals",
                        points: "equals",
                        updatedAt: "between",
                        triaged: "equals",
                        archivedAt: "between",
                        isShared: "equals",
                        cycleId: "equals",
                      };
                      updateFilter(filter.id, {
                        field: value,
                        operator: defaultOperators[value],
                        value: "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator Select */}
                  <Select
                    value={filter.operator}
                    onValueChange={(value: FilterOperator) =>
                      updateFilter(filter.id, { operator: value })
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorsForField(filter.field).map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Filter Value */}
                  {renderFilterValueInput(filter)}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(filter.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Remove filter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addFilter} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>

            {filterRows.length > 0 && (
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Save className="h-4 w-4" />
                    Save View
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Filter View</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="filter-name">View Name</Label>
                      <Input
                        id="filter-name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="e.g., High Priority Bugs"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This will save {filterRows.length} filter{filterRows.length !== 1 ? "s" : ""} with{" "}
                      {rootOperator === "AND" ? "ALL" : "ANY"} matching logic.
                      {groups.length > 0 && ` Includes ${groups.length} filter group${groups.length !== 1 ? "s" : ""}.`}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveFilter} disabled={!filterName.trim()}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFiltersV2;
