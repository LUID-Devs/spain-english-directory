import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, Project, User } from "@/hooks/useApi";
import { useApplyAdvancedFilter, useGetFilterMetadata } from "@/hooks/useApi";
import type { AdvancedTaskFilter, FieldCondition, FilterMetadataField } from "@/services/apiService";

// Filter types
export type FilterType = "status" | "priority" | "assignee" | "project" | "dueDate" | "tags" | "title" | "description";

export interface FilterCriteria {
  id: string;
  type: FilterType;
  operator: "equals" | "notEquals" | "contains" | "notContains" | "startsWith" | "endsWith" | "before" | "after" | "between" | "greaterThan" | "lessThan" | "isEmpty" | "isNotEmpty";
  value: string | string[] | Date | DateRange | number;
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
  projects: Project[];
  users: User[];
  availableStatuses: string[];
  onFilterChange: (filteredTasks: Task[], pagination: { totalCount: number; totalPages: number; hasNextPage: boolean }) => void;
  onActiveFiltersChange?: (count: number) => void;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const filterTypeOptions: { value: FilterType; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
  { value: "project", label: "Project" },
  { value: "dueDate", label: "Due Date" },
  { value: "tags", label: "Tags" },
];

const priorityOptions = ["Urgent", "High", "Medium", "Low", "Backlog"];

// Map frontend filter type to backend field name
const mapFilterTypeToField = (type: FilterType): string => {
  const mapping: Record<FilterType, string> = {
    status: "status",
    priority: "priority",
    assignee: "assignedUserId",
    project: "projectId",
    dueDate: "dueDate",
    tags: "tags",
    title: "title",
    description: "description",
  };
  return mapping[type];
};

// Map frontend operator to backend operator
const mapOperatorToBackend = (operator: string): string => {
  const mapping: Record<string, string> = {
    equals: "equals",
    notEquals: "notEquals",
    contains: "contains",
    notContains: "notContains",
    startsWith: "startsWith",
    endsWith: "endsWith",
    before: "lessThan",
    after: "greaterThan",
    between: "between",
    greaterThan: "greaterThan",
    lessThan: "lessThan",
    isEmpty: "isEmpty",
    isNotEmpty: "isNotEmpty",
  };
  return mapping[operator] || "equals";
};

// Convert frontend criteria to backend AdvancedTaskFilter
const convertToAdvancedFilter = (criteria: FilterCriteria[], logic: "AND" | "OR"): AdvancedTaskFilter => {
  const conditions: FieldCondition[] = criteria.map((c) => {
    const baseCondition: FieldCondition = {
      field: mapFilterTypeToField(c.type) as any,
      operator: mapOperatorToBackend(c.operator) as any,
    };

    // Handle different value types
    if (c.operator !== "isEmpty" && c.operator !== "isNotEmpty") {
      if (c.type === "dueDate" && c.operator === "between") {
        const range = c.value as DateRange;
        baseCondition.value = {
          from: range.from || new Date(),
          to: range.to || new Date(),
        };
      } else if (c.type === "project" || c.type === "assignee") {
        baseCondition.value = parseInt(c.value as string, 10);
      } else {
        baseCondition.value = c.value as string;
      }
    }

    return baseCondition;
  });

  return {
    operator: logic,
    conditions,
  };
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  tasks,
  projects,
  users,
  availableStatuses,
  onFilterChange,
  onActiveFiltersChange,
  page = 1,
  limit = 50,
  sortBy = "updatedAt",
  sortOrder = "desc",
}) => {
  // State
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // API hooks
  const { applyFilter, data: filterResponse, isLoading, error } = useApplyAdvancedFilter();
  const { data: metadata } = useGetFilterMetadata({ skip: !isExpanded });

  // Load saved filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("taskluid_saved_filters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved filters", e);
      }
    }
  }, []);

  // Save filters to localStorage
  const persistSavedFilters = (filtersToSave: SavedFilter[]) => {
    localStorage.setItem("taskluid_saved_filters", JSON.stringify(filtersToSave));
    setSavedFilters(filtersToSave);
  };

  // Get unique tags from tasks (fallback if metadata not loaded)
  const availableTags = useMemo(() => {
    if (metadata?.metadata?.values?.tags) {
      return metadata.metadata.values.tags;
    }
    const tagsSet = new Set<string>();
    tasks?.forEach((task) => {
      if (task.tags) {
        task.tags.split(",").forEach((tag) => tagsSet.add(tag.trim()));
      }
    });
    return Array.from(tagsSet).sort();
  }, [tasks, metadata]);

  // Apply filters via API
  const executeFilter = useCallback(async () => {
    if (filters.length === 0) {
      onFilterChange([], { totalCount: 0, totalPages: 0, hasNextPage: false });
      return;
    }

    const advancedFilter = convertToAdvancedFilter(filters, logic);
    
    try {
      const result = await applyFilter(advancedFilter, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      if (result) {
        onFilterChange(result.tasks, {
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
          hasNextPage: result.pagination.hasNextPage,
        });
        onActiveFiltersChange?.(filters.length);
      }
    } catch (err) {
      console.error("Failed to apply filter:", err);
    }
  }, [filters, logic, page, limit, sortBy, sortOrder, applyFilter, onFilterChange, onActiveFiltersChange]);

  // Execute filter when filters, page, limit, sort changes
  useEffect(() => {
    if (filters.length > 0) {
      const timeoutId = setTimeout(() => {
        executeFilter();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      onFilterChange([], { totalCount: 0, totalPages: 0, hasNextPage: false });
      onActiveFiltersChange?.(0);
    }
  }, [filters, logic, page, limit, sortBy, sortOrder, executeFilter]);

  // Add a new filter
  const addFilter = () => {
    const newFilter: FilterCriteria = {
      id: Math.random().toString(36).substr(2, 9),
      type: "status",
      operator: "equals",
      value: availableStatuses[0] || "",
    };
    setFilters([...filters, newFilter]);
    if (!isExpanded) setIsExpanded(true);
  };

  // Update a filter
  const updateFilter = (id: string, updates: Partial<FilterCriteria>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Remove a filter
  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters([]);
    onFilterChange([], { totalCount: 0, totalPages: 0, hasNextPage: false });
    onActiveFiltersChange?.(0);
  };

  // Save current filter combination
  const saveFilter = () => {
    if (!filterName.trim()) return;
    
    const newSavedFilter: SavedFilter = {
      id: Math.random().toString(36).substr(2, 9),
      name: filterName,
      criteria: [...filters],
      logic,
    };
    
    persistSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
    setSaveDialogOpen(false);
  };

  // Load a saved filter
  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters([...savedFilter.criteria]);
    setLogic(savedFilter.logic);
    setIsExpanded(true);
  };

  // Delete a saved filter
  const deleteSavedFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persistSavedFilters(savedFilters.filter((f) => f.id !== id));
  };

  // Get active filter count display
  const activeFilterCount = filters.length;

  // Get available operators for a filter type
  const getOperatorsForType = (type: FilterType): { value: string; label: string }[] => {
    const commonOperators = [
      { value: "equals", label: "equals" },
      { value: "notEquals", label: "not equals" },
    ];

    const stringOperators = [
      { value: "contains", label: "contains" },
      { value: "notContains", label: "does not contain" },
      { value: "startsWith", label: "starts with" },
      { value: "endsWith", label: "ends with" },
    ];

    const dateOperators = [
      { value: "before", label: "before" },
      { value: "after", label: "after" },
      { value: "between", label: "between" },
    ];

    const emptyOperators = [
      { value: "isEmpty", label: "is empty" },
      { value: "isNotEmpty", label: "is not empty" },
    ];

    switch (type) {
      case "title":
      case "description":
      case "tags":
        return [...commonOperators, ...stringOperators, ...emptyOperators];
      case "status":
      case "priority":
      case "assignee":
      case "project":
        return [...commonOperators, ...emptyOperators];
      case "dueDate":
        return [...dateOperators, ...emptyOperators];
      default:
        return commonOperators;
    }
  };

  // Render filter value input based on type
  const renderFilterValueInput = (filter: FilterCriteria) => {
    // Don't show value input for isEmpty/isNotEmpty operators
    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
      return null;
    }

    switch (filter.type) {
      case "title":
      case "description":
        return (
          <Input
            type="text"
            value={filter.value as string}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder={`Enter ${filter.type}...`}
            className="w-[200px]"
          />
        );

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

      case "assignee":
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

      case "project":
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

      case "dueDate": {
        const range = (filter.value as DateRange) || { from: undefined, to: undefined };
        return (
          <div className="flex items-center gap-2">
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
                      operator: selectedRange?.to ? "between" : "after",
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      }

      default:
        return null;
    }
  };

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

        {/* Logic Toggle */}
        {filters.length > 1 && (
          <Select value={logic} onValueChange={(v) => setLogic(v as "AND" | "OR")}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">Match ALL</SelectItem>
              <SelectItem value="OR">Match ANY</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Saved Filters Dropdown */}
        {savedFilters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
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

        {/* Loading Indicator */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {/* Error Display */}
        {error && (
          <Badge variant="destructive" className="text-xs">
            Filter error
          </Badge>
        )}

        {/* Active Filter Badges */}
        <div className="flex flex-wrap gap-1 ml-auto">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-accent"
              onClick={() => removeFilter(filter.id)}
            >
              {filterTypeOptions.find((o) => o.value === filter.type)?.label}: {" "}
              {filter.operator === "isEmpty" || filter.operator === "isNotEmpty" 
                ? filter.operator === "isEmpty" ? "is empty" : "is not empty"
                : filter.type === "dueDate"
                ? "Date Range"
                : filter.type === "assignee"
                ? users?.find((u) => u.userId.toString() === filter.value)?.username || "Unknown"
                : filter.type === "project"
                ? projects?.find((p) => p.id.toString() === filter.value)?.name || "Unknown"
                : String(filter.value).slice(0, 20)}
              <X className="h-3 w-3 ml-1 hover:text-destructive" />
            </Badge>
          ))}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="border rounded-lg p-4 space-y-4 bg-card">
          {/* Filter Rows */}
          <div className="space-y-3">
            {filters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active filters. Click "Add Filter" to start filtering tasks.
              </p>
            )}
            
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center gap-2 flex-wrap">
                {/* Filter Type */}
                <Select
                  value={filter.type}
                  onValueChange={(value: FilterType) => {
                    // Reset value when type changes
                    const defaultValues: Record<FilterType, string | DateRange> = {
                      status: availableStatuses[0] || "",
                      priority: priorityOptions[0],
                      assignee: users?.[0]?.userId?.toString() || "",
                      project: projects?.[0]?.id?.toString() || "",
                      dueDate: { from: undefined, to: undefined },
                      tags: availableTags[0] || "",
                      title: "",
                      description: "",
                    };
                    updateFilter(filter.id, { 
                      type: value, 
                      value: defaultValues[value],
                      operator: value === "dueDate" ? "between" : "equals"
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

                {/* Operator */}
                <Select
                  value={filter.operator}
                  onValueChange={(value: any) => updateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorsForType(filter.type).map((op) => (
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
            ))}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addFilter} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>

            {filters.length > 0 && (
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
                      This will save {filters.length} filter{filters.length !== 1 ? "s" : ""} with{" "}
                      {logic === "AND" ? "ALL" : "ANY"} matching logic.
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

export default AdvancedFilters;
