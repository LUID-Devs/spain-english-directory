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
  kind: "rule";
  type: FilterType;
  operator: "equals" | "notEquals" | "contains" | "before" | "after" | "between";
  value: string | string[] | Date | DateRange;
}

export interface FilterGroup {
  id: string;
  kind: "group";
  logic: "AND" | "OR";
  children: FilterNode[];
}

export type FilterNode = FilterCriteria | FilterGroup;

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface SavedFilter {
  id: string;
  name: string;
  rootGroup: FilterGroup;
}

interface AdvancedFiltersProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  availableStatuses: string[];
  onFilterChange: (filteredTasks: Task[]) => void;
  onActiveFiltersChange?: (count: number) => void;
}

// Helper function to recursively deserialize dates in filter nodes
const deserializeNodeDates = (node: any): FilterNode => {
  if (node.kind === "rule") {
    const rule = { ...node };
    // Handle dueDate type with DateRange value
    if (rule.type === "dueDate" && rule.value && typeof rule.value === "object") {
      const range = rule.value as { from?: string; to?: string };
      rule.value = {
        from: range.from ? new Date(range.from) : undefined,
        to: range.to ? new Date(range.to) : undefined,
      };
    }
    return rule as FilterCriteria;
  }
  // For groups, recursively process children
  return {
    ...node,
    children: (node.children || []).map(deserializeNodeDates),
  } as FilterGroup;
};

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
  const [rootGroup, setRootGroup] = useState<FilterGroup>({
    id: "root",
    kind: "group",
    logic: "AND",
    children: [],
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to create unique IDs
  const createId = React.useCallback(() => Math.random().toString(36).slice(2, 11), []);

  const normalizeSavedFilter = React.useCallback((saved: any): SavedFilter => {
    if (saved?.rootGroup) {
      // Deserialize dates in the new format
      return {
        id: saved.id || createId(),
        name: saved.name || "Untitled",
        rootGroup: deserializeNodeDates(saved.rootGroup) as FilterGroup,
      };
    }
    // Backward compatibility for old format
    const criteria: FilterCriteria[] = (saved?.criteria || []).map((rule: any) => {
      const deserialized = deserializeNodeDates({ ...rule, kind: "rule" }) as FilterCriteria;
      return deserialized;
    });
    return {
      id: saved?.id || createId(),
      name: saved?.name || "Untitled",
      rootGroup: {
        id: "root",
        kind: "group",
        logic: saved?.logic || "AND",
        children: criteria,
      },
    };
  }, [createId]);

  // Helper function to create unique IDs
  const createId = React.useCallback(() => Math.random().toString(36).substr(2, 9), []);

  const normalizeSavedFilter = React.useCallback((saved: any): SavedFilter => {
    if (saved?.rootGroup) {
      // Deserialize dates in the new format
      return {
        id: saved.id || createId(),
        name: saved.name || "Untitled",
        rootGroup: deserializeNodeDates(saved.rootGroup) as FilterGroup,
      };
    }
    // Backward compatibility for old format
    const criteria: FilterCriteria[] = (saved?.criteria || []).map((rule: any) => {
      const deserialized = deserializeNodeDates({ ...rule, kind: "rule" }) as FilterCriteria;
      return deserialized;
    });
    return {
      id: saved?.id || createId(),
      name: saved?.name || "Untitled",
      rootGroup: {
        id: "root",
        kind: "group",
        logic: saved?.logic || "AND",
        children: criteria,
      },
    };
  }, [createId]);

  // Load saved filters from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("taskluid_saved_filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedFilters(Array.isArray(parsed) ? parsed.map(normalizeSavedFilter) : []);
      } catch (e) {
        console.error("Failed to load saved filters", e);
      }
    }
  }, [normalizeSavedFilter]);

  // Save filters to localStorage
  const persistSavedFilters = (filters: SavedFilter[]) => {
    localStorage.setItem("taskluid_saved_filters", JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const countRules = (node: FilterNode): number => {
    if (node.kind === "rule") return 1;
    return node.children.reduce((acc, child) => acc + countRules(child), 0);
  };

  const collectRules = (node: FilterNode): FilterCriteria[] => {
    if (node.kind === "rule") return [node];
    return node.children.flatMap((child) => collectRules(child));
  };

  const updateGroupById = (groupId: string, updater: (group: FilterGroup) => FilterGroup) => {
    const apply = (node: FilterNode): FilterNode => {
      if (node.kind === "group") {
        if (node.id === groupId) return updater(node);
        return { ...node, children: node.children.map(apply) };
      }
      return node;
    };
    setRootGroup((prev) => apply(prev) as FilterGroup);
  };

  const updateRuleById = (ruleId: string, updates: Partial<FilterCriteria>) => {
    const apply = (node: FilterNode): FilterNode => {
      if (node.kind === "rule") {
        return node.id === ruleId ? { ...node, ...updates } : node;
      }
      return { ...node, children: node.children.map(apply) };
    };
    setRootGroup((prev) => apply(prev) as FilterGroup);
  };

  const removeNodeById = (nodeId: string) => {
    const apply = (node: FilterNode): FilterNode => {
      if (node.kind === "group") {
        return {
          ...node,
          children: node.children
            .filter((child) => child.id !== nodeId)
            .map(apply),
        };
      }
      return node;
    };
    setRootGroup((prev) => apply(prev) as FilterGroup);
  };

  const addRuleToGroup = (groupId: string) => {
    const newRule: FilterCriteria = {
      id: createId(),
      kind: "rule",
      type: "status",
      operator: "equals",
      value: availableStatuses[0] || "",
    };
    updateGroupById(groupId, (group) => ({
      ...group,
      children: [...group.children, newRule],
    }));
    if (!isExpanded) setIsExpanded(true);
  };

  const addGroupToGroup = (groupId: string) => {
    const newGroup: FilterGroup = {
      id: createId(),
      kind: "group",
      logic: "AND",
      children: [],
    };
    updateGroupById(groupId, (group) => ({
      ...group,
      children: [...group.children, newGroup],
    }));
    if (!isExpanded) setIsExpanded(true);
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
        if (filter.operator === "contains") {
          return taskTags.some((tag) => tag.includes(filterTag));
        }
        return taskTags.includes(filterTag);
      }
      default:
        return true;
    }
  }

  const evaluateNode = (task: Task, node: FilterNode): boolean => {
    if (node.kind === "rule") return applyFilter(task, node);
    if (node.children.length === 0) return true;
    const results = node.children.map((child) => evaluateNode(task, child));
    return node.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
  };

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    if (!tasks || rootGroup.children.length === 0) return tasks || [];

    return tasks.filter((task) => evaluateNode(task, rootGroup));
  }, [tasks, rootGroup]);

  // Notify parent of filter changes
  React.useEffect(() => {
    onFilterChange(filteredTasks);
    onActiveFiltersChange?.(countRules(rootGroup));
  }, [filteredTasks, rootGroup, onFilterChange, onActiveFiltersChange]);

  // Clear all filters
  const clearAllFilters = () => {
    setRootGroup((prev) => ({ ...prev, children: [] }));
  };

  // Save current filter combination
  const saveFilter = () => {
    if (!filterName.trim()) return;

    const newSavedFilter: SavedFilter = {
      id: createId(),
      name: filterName,
      rootGroup: rootGroup,
    };

    persistSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
    setSaveDialogOpen(false);
  };

  // Load a saved filter
  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setRootGroup(savedFilter.rootGroup);
    setIsExpanded(true);
  };

  // Delete a saved filter
  const deleteSavedFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persistSavedFilters(savedFilters.filter((f) => f.id !== id));
  };

  // Get active filter count display
  const activeFilterCount = countRules(rootGroup);
  const flatRules = collectRules(rootGroup);

  // Render filter value input based on type
  const renderFilterValueInput = (filter: FilterCriteria) => {
    switch (filter.type) {
      case "status":
        return (
          <Select
            value={filter.value as string}
            onValueChange={(value) => updateRuleById(filter.id, { value })}
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
            onValueChange={(value) => updateRuleById(filter.id, { value })}
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
            onValueChange={(value) => updateRuleById(filter.id, { value })}
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
            onValueChange={(value) => updateRuleById(filter.id, { value })}
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
            onValueChange={(value) => updateRuleById(filter.id, { value })}
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
                    updateRuleById(filter.id, {
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

  const renderRuleRow = (filter: FilterCriteria) => (
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
          };
          updateRuleById(filter.id, {
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
          onValueChange={(value: any) => updateRuleById(filter.id, { operator: value })}
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
        onClick={() => removeNodeById(filter.id)}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        aria-label="Remove filter"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderGroup = (group: FilterGroup, depth = 0) => (
    <div
      key={group.id}
      className={cn(
        "space-y-3 rounded-lg border p-3",
        depth > 0 ? "bg-muted/10" : "bg-card"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase text-muted-foreground">
          {depth === 0 ? "Filters" : "Group"}
        </span>
        {group.children.length > 1 && (
          <Select
            value={group.logic}
            onValueChange={(value) =>
              updateGroupById(group.id, (existing) => ({
                ...existing,
                logic: value as "AND" | "OR",
              }))
            }
          >
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">Match ALL</SelectItem>
              <SelectItem value="OR">Match ANY</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addRuleToGroup(group.id)}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addGroupToGroup(group.id)}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Group
          </Button>
          {group.id !== "root" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeNodeById(group.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Remove group"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {group.children.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No filters in this group yet.
          </p>
        )}
        {group.children.map((child) =>
          child.kind === "group" ? renderGroup(child, depth + 1) : renderRuleRow(child)
        )}
      </div>
    </div>
  );

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
        {rootGroup.children.length > 1 && (
          <Select
            value={rootGroup.logic}
            onValueChange={(v) =>
              updateGroupById("root", (group) => ({ ...group, logic: v as "AND" | "OR" }))
            }
          >
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

        {/* Active Filter Badges */}
        <div className="flex flex-wrap gap-1 ml-auto">
          {flatRules.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-accent"
              onClick={() => removeNodeById(filter.id)}
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
        <div className="space-y-4">
          {renderGroup(rootGroup)}

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => addRuleToGroup("root")} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => addGroupToGroup("root")} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Group
              </Button>
            </div>

            {activeFilterCount > 0 && (
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
                      This will save {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} with{" "}
                      {rootGroup.logic === "AND" ? "ALL" : "ANY"} matching logic.
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
