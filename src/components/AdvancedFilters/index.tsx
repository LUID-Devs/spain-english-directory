import React, { useState, useMemo } from "react";
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
  Check
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, Project, User } from "@/hooks/useApi";

// Filter types
export type FilterType = "status" | "priority" | "assignee" | "project" | "dueDate" | "tags";

export interface FilterCriteria {
  id: string;
  type: FilterType;
  operator: "equals" | "notEquals" | "contains" | "before" | "after" | "between";
  value: string | string[] | Date | DateRange;
  combineWith?: "AND" | "OR";
  groupId?: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria[];
  logic?: "AND" | "OR"; // legacy support
  groupOperators?: Record<string, "AND" | "OR">;
}

interface AdvancedFiltersProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  availableStatuses: string[];
  onFilterChange: (filteredTasks: Task[]) => void;
  onActiveFiltersChange?: (count: number) => void;
}

const filterTypeOptions: { value: FilterType; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
  { value: "project", label: "Project" },
  { value: "dueDate", label: "Due Date" },
  { value: "tags", label: "Tags" },
];

const priorityOptions = ["Urgent", "High", "Medium", "Low", "Backlog"];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  tasks,
  projects,
  users,
  availableStatuses,
  onFilterChange,
  onActiveFiltersChange,
}) => {
  // State
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [groupOperators, setGroupOperators] = useState<Record<string, "AND" | "OR">>({});

  // Load saved filters from localStorage on mount
  React.useEffect(() => {
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
  const persistSavedFilters = (filters: SavedFilter[]) => {
    localStorage.setItem("taskluid_saved_filters", JSON.stringify(filters));
    setSavedFilters(filters);
  };

  // Get unique tags from tasks
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tasks?.forEach((task) => {
      if (task.tags) {
        task.tags.split(",").forEach((tag) => tagsSet.add(tag.trim()));
      }
    });
    return Array.from(tagsSet).sort();
  }, [tasks]);

  const groupOrder = useMemo(() => {
    const order: string[] = [];
    const seen = new Set<string>();
    filters.forEach((filter) => {
      const groupId = filter.groupId || "default";
      if (!seen.has(groupId)) {
        seen.add(groupId);
        order.push(groupId);
      }
    });
    return order.length > 0 ? order : ["default"];
  }, [filters]);

  const groupLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    groupOrder.forEach((groupId, index) => {
      labels[groupId] = String.fromCharCode(65 + index);
    });
    return labels;
  }, [groupOrder]);

  React.useEffect(() => {
    setGroupOperators((prev) => {
      const next: Record<string, "AND" | "OR"> = {};
      groupOrder.forEach((groupId, index) => {
        if (index === 0) return;
        next[groupId] = prev[groupId] || "AND";
      });
      return next;
    });
  }, [groupOrder]);

  // Apply a single filter criteria to a task
  function applyFilter(task: Task, filter: FilterCriteria): boolean {
    switch (filter.type) {
      case "status":
        return task.status === filter.value;
      case "priority":
        return task.priority === filter.value;
      case "assignee":
        return task.assignedUserId?.toString() === filter.value || 
               task.assignee?.userId?.toString() === filter.value;
      case "project":
        return task.projectId?.toString() === filter.value;
      case "dueDate": {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const range = filter.value as DateRange;
        
        if (filter.operator === "before") {
          return taskDate < (range.to || new Date());
        } else if (filter.operator === "after") {
          return taskDate > (range.from || new Date());
        } else if (filter.operator === "between" && range.from && range.to) {
          return taskDate >= range.from && taskDate <= range.to;
        }
        return false;
      }
      case "tags": {
        if (!task.tags) return false;
        const taskTags = task.tags.toLowerCase().split(",").map((t) => t.trim());
        const filterTag = (filter.value as string).toLowerCase();
        return taskTags.includes(filterTag);
      }
      default:
        return true;
    }
  }

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    if (!tasks || filters.length === 0) return tasks || [];

    return tasks.filter((task) => {
      if (filters.length === 0) return true;

      const grouped: Record<string, FilterCriteria[]> = {};
      filters.forEach((filter) => {
        const groupId = filter.groupId || "default";
        grouped[groupId] = grouped[groupId] || [];
        grouped[groupId].push(filter);
      });

      let result = true;
      groupOrder.forEach((groupId, groupIndex) => {
        const groupFilters = grouped[groupId] || [];
        if (groupFilters.length === 0) return;

        let groupResult = applyFilter(task, groupFilters[0]);
        for (let i = 1; i < groupFilters.length; i += 1) {
          const current = applyFilter(task, groupFilters[i]);
          const combineWith = groupFilters[i].combineWith || "AND";
          groupResult = combineWith === "OR" ? groupResult || current : groupResult && current;
        }

        if (groupIndex === 0) {
          result = groupResult;
        } else {
          const groupOperator = groupOperators[groupId] || "AND";
          result = groupOperator === "OR" ? result || groupResult : result && groupResult;
        }
      });

      return result;
    });
  }, [tasks, filters, groupOrder, groupOperators]);

  // Notify parent of filter changes
  React.useEffect(() => {
    onFilterChange(filteredTasks);
    onActiveFiltersChange?.(filters.length);
  }, [filteredTasks, filters.length, onFilterChange, onActiveFiltersChange]);

  // Add a new filter
  const addFilter = () => {
    const newFilter: FilterCriteria = {
      id: Math.random().toString(36).slice(2, 11),
      type: "status",
      operator: "equals",
      value: availableStatuses[0] || "",
      combineWith: "AND",
      groupId: groupOrder[0] || "default",
    };
    setFilters([...filters, newFilter]);
    if (!isExpanded) setIsExpanded(true);
  };

  // Add a new filter group
  const addGroup = () => {
    const newGroupId = Math.random().toString(36).slice(2, 11);
    const newFilter: FilterCriteria = {
      id: Math.random().toString(36).slice(2, 11),
      type: "status",
      operator: "equals",
      value: availableStatuses[0] || "",
      combineWith: "AND",
      groupId: newGroupId,
    };
    setGroupOperators((prev) => ({ ...prev, [newGroupId]: "AND" }));
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
    setGroupOperators({});
  };

  // Save current filter combination
  const saveFilter = () => {
    if (!filterName.trim()) return;
    
    const newSavedFilter: SavedFilter = {
      id: Math.random().toString(36).slice(2, 11),
      name: filterName,
      criteria: [...filters],
      groupOperators,
    };
    
    persistSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
    setSaveDialogOpen(false);
  };

  // Load a saved filter
  const loadSavedFilter = (savedFilter: SavedFilter) => {
    const legacyLogic = savedFilter.logic || "AND";
    const criteria = savedFilter.criteria.map((criterion, index) => ({
      ...criterion,
      combineWith: index === 0 ? undefined : criterion.combineWith || legacyLogic,
    }));
    setFilters(criteria);
    setGroupOperators(savedFilter.groupOperators || {});
    setIsExpanded(true);
  };

  // Delete a saved filter
  const deleteSavedFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persistSavedFilters(savedFilters.filter((f) => f.id !== id));
  };

  // Get active filter count display
  const activeFilterCount = filters.length;

  const groupedFilters = useMemo(() => {
    const grouped: Record<string, FilterCriteria[]> = {};
    groupOrder.forEach((groupId) => {
      grouped[groupId] = [];
    });
    filters.forEach((filter) => {
      const groupId = filter.groupId || "default";
      if (!grouped[groupId]) grouped[groupId] = [];
      grouped[groupId].push(filter);
    });
    return grouped;
  }, [filters, groupOrder]);

  // Render filter value input based on type
  const renderFilterValueInput = (filter: FilterCriteria) => {
    switch (filter.type) {
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

        {/* Logic handled per condition */}

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
              {filter.type === "dueDate"
                ? "Date Range"
                : filter.type === "assignee"
                ? users?.find((u) => u.userId.toString() === filter.value)?.username || "Unknown"
                : filter.type === "project"
                ? projects?.find((p) => p.id.toString() === filter.value)?.name || "Unknown"
                : String(filter.value)}
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
            
            {groupOrder.map((groupId, groupIndex) => (
              <div key={groupId} className="space-y-2">
                <div className="flex items-center gap-2">
                  {groupIndex > 0 && (
                    <Select
                      value={groupOperators[groupId] || "AND"}
                      onValueChange={(value) =>
                        setGroupOperators((prev) => ({
                          ...prev,
                          [groupId]: value as "AND" | "OR",
                        }))
                      }
                    >
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Badge variant="outline">Group {groupLabels[groupId]}</Badge>
                </div>

                {(groupedFilters[groupId] || []).map((filter, index) => (
                  <div key={filter.id} className="flex items-center gap-2 flex-wrap">
                    {index > 0 && (
                      <Select
                        value={filter.combineWith || "AND"}
                        onValueChange={(value) => updateFilter(filter.id, { combineWith: value as "AND" | "OR" })}
                      >
                        <SelectTrigger className="w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {groupOrder.length > 1 && (
                      <Select
                        value={filter.groupId || groupId}
                        onValueChange={(value) => updateFilter(filter.id, { groupId: value })}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {groupOrder.map((id) => (
                            <SelectItem key={id} value={id}>
                              Group {groupLabels[id]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

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
                        };
                        updateFilter(filter.id, {
                          type: value,
                          value: defaultValues[value],
                          operator: value === "dueDate" ? "between" : "equals",
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

                    {/* Operator (only for some types) */}
                    {filter.type === "tags" && (
                      <Select
                        value={filter.operator}
                        onValueChange={(value: any) => updateFilter(filter.id, { operator: value })}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="equals">equals</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

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
            ))}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={addFilter} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Filter
              </Button>
              <Button variant="outline" size="sm" onClick={addGroup} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Group
              </Button>
            </div>

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
                      This will save {filters.length} filter{filters.length !== 1 ? "s" : ""} with per-condition AND/OR logic.
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
