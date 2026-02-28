import React, { useState, useCallback, useEffect } from "react";
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  Plus,
  Share,
  Table,
  Search,
  Folder,
  X,
  Check,
  Download,
  FileSpreadsheet,
  FileJson,
  Bookmark,
  BookmarkPlus,
  MoreHorizontal,
  Star,
  Trash2,
  Edit3,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Priority, SavedView, useGetProjectViewsQuery, useCreateViewMutation, useUpdateViewMutation, useDeleteViewMutation, useSetDefaultViewMutation } from "@/hooks/useApi";
import { AdvancedTaskFilter } from "@/services/apiService";

// Type guard to check if filter is the legacy format
function isLegacyFilter(filters: AdvancedTaskFilter | { priority?: string | null; status?: string | null; assigneeId?: number | null; searchQuery?: string | null }): filters is { priority?: string | null; status?: string | null; assigneeId?: number | null; searchQuery?: string | null } {
  return filters && typeof filters === 'object' && ('priority' in filters || 'status' in filters || 'assigneeId' in filters || 'searchQuery' in filters);
}

export type FilterState = {
  priority: string | null;
  status: string | null;
  assigneeId: number | null;
};

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectName: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  projectId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableStatuses: string[];
  availableAssignees: { userId: number; username: string }[];
};

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  projectName,
  setIsModalNewTaskOpen,
  projectId,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableStatuses,
  availableAssignees,
}: Props) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);

  const projectIdNum = parseInt(projectId || '0');
  
  const { data: savedViews, isLoading: viewsLoading, refetch: refetchViews } = useGetProjectViewsQuery(
    projectIdNum || undefined,
    { skip: !projectIdNum }
  );
  const [createView] = useCreateViewMutation();
  const [updateView] = useUpdateViewMutation();
  const [deleteView] = useDeleteViewMutation();
  const [setDefaultView] = useSetDefaultViewMutation();

  const applyView = useCallback((view: SavedView) => {
    setSelectedViewId(view.id);
    if (isLegacyFilter(view.filters)) {
      onFiltersChange({
        priority: view.filters.priority ?? null,
        status: view.filters.status ?? null,
        assigneeId: view.filters.assigneeId ?? null,
      });
      if (view.filters.searchQuery) {
        onSearchChange(view.filters.searchQuery);
      }
    }
  }, [onFiltersChange, onSearchChange]);

  // Load default view on mount - inline the applyView logic to avoid setState-in-effect issue
  useEffect(() => {
    if (savedViews && savedViews.length > 0 && selectedViewId === null) {
      const defaultView = savedViews.find(v => v.isDefault);
      if (defaultView && isLegacyFilter(defaultView.filters)) {
        // Inline applyView logic to avoid cascading renders
        setSelectedViewId(defaultView.id);
        onFiltersChange({
          priority: defaultView.filters.priority ?? null,
          status: defaultView.filters.status ?? null,
          assigneeId: defaultView.filters.assigneeId ?? null,
        });
        if (defaultView.filters.searchQuery) {
          onSearchChange(defaultView.filters.searchQuery);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedViews]);

  const handleShare = () => {
    const projectUrl = `${window.location.origin}/dashboard/projects/${projectId}`;
    navigator.clipboard.writeText(projectUrl).then(() => {
      toast.success("Project link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Preparing CSV export...");
      const exportFilters: { projectId?: number; status?: string; assigneeId?: number } = {};
      if (projectId && projectId !== '0') exportFilters.projectId = parseInt(projectId);
      if (filters.status) exportFilters.status = filters.status;
      if (filters.assigneeId !== null) exportFilters.assigneeId = filters.assigneeId;

      const blob = await apiService.exportTasksCSV(exportFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleExportJSON = async () => {
    try {
      toast.info("Preparing JSON export...");
      const exportFilters: { projectId?: number; status?: string; assigneeId?: number } = {};
      if (projectId && projectId !== '0') exportFilters.projectId = parseInt(projectId);
      if (filters.status) exportFilters.status = filters.status;
      if (filters.assigneeId !== null) exportFilters.assigneeId = filters.assigneeId;

      const blob = await apiService.exportTasksJSON(exportFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("JSON exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export JSON");
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({
      priority: null,
      status: null,
      assigneeId: null,
    });
    onSearchChange("");
    setSelectedViewId(null);
  };

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    try {
      if (editingView) {
        await updateView({
          viewId: editingView.id,
          data: {
            name: viewName,
            filters: {
              priority: filters.priority,
              status: filters.status,
              assigneeId: filters.assigneeId,
              searchQuery,
            },
            isDefault,
            isShared,
          },
        });
        toast.success("View updated successfully");
      } else {
        await createView({
          projectId: projectIdNum,
          name: viewName,
          filters: {
            priority: filters.priority,
            status: filters.status,
            assigneeId: filters.assigneeId,
            searchQuery,
          },
          isDefault,
          isShared,
        });
        toast.success("View saved successfully");
      }
      setIsSaveDialogOpen(false);
      setViewName("");
      setIsDefault(false);
      setIsShared(false);
      setEditingView(null);
      refetchViews();
    } catch (error: any) {
      toast.error(error.message || "Failed to save view");
    }
  };

  const handleDeleteView = async (viewId: number) => {
    try {
      await deleteView(viewId);
      toast.success("View deleted successfully");
      refetchViews();
      if (selectedViewId === viewId) {
        setSelectedViewId(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete view");
    }
  };

  const handleSetDefault = async (viewId: number) => {
    try {
      await setDefaultView(viewId);
      toast.success("Default view set successfully");
      refetchViews();
    } catch (error: any) {
      toast.error(error.message || "Failed to set default view");
    }
  };

  const handleEditView = (view: SavedView) => {
    setEditingView(view);
    setViewName(view.name);
    setIsDefault(view.isDefault);
    setIsShared(view.isShared);
    setIsSaveDialogOpen(true);
    setIsManageDialogOpen(false);
  };

  const openSaveDialog = () => {
    setEditingView(null);
    setViewName("");
    setIsDefault(false);
    setIsShared(false);
    setIsSaveDialogOpen(true);
  };

  const activeFiltersCount = [filters.priority, filters.status, filters.assigneeId].filter(
    (value) => value !== null && value !== undefined
  ).length;
  const currentView = savedViews?.find(v => v.id === selectedViewId);

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Save View Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingView ? "Edit View" : "Save Current View"}</DialogTitle>
            <DialogDescription>
              {editingView 
                ? "Update your saved view settings." 
                : "Save your current filter and search configuration as a named view."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="viewName">View Name</Label>
              <Input
                id="viewName"
                placeholder="e.g., High Priority Bugs"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
              />
              <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                Set as default view for this project
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isShared"
                checked={isShared}
                onCheckedChange={(checked) => setIsShared(checked as boolean)}
              />
              <Label htmlFor="isShared" className="text-sm cursor-pointer">
                Share with team members
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView}>
              {editingView ? "Update View" : "Save View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Views Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Saved Views</DialogTitle>
            <DialogDescription>
              Edit, set default, or delete your saved views.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {savedViews?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No saved views yet.
              </p>
            ) : (
              savedViews?.map((view) => (
                <div
                  key={view.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    selectedViewId === view.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {view.isDefault && <Star className="h-4 w-4 text-yellow-500 shrink-0" />}
                    {view.isShared && <Eye className="h-4 w-4 text-blue-500 shrink-0" />}
                    <span className="font-medium truncate">{view.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => applyView(view)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!view.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSetDefault(view.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditView(view)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDeleteView(view.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsManageDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Folder className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl truncate">{projectName}</CardTitle>
                <p className="text-sm text-muted-foreground hidden sm:block">Project management and task tracking</p>
              </div>
            </div>
            <Button onClick={() => setIsModalNewTaskOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation and Controls */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Tab Navigation - Scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
              <TabButton
                name="Board"
                icon={<Grid3x3 className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                name="List"
                icon={<List className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                name="Timeline"
                icon={<Clock className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TabButton
                name="Table"
                icon={<Table className="h-4 w-4" />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
              {/* Saved Views Dropdown */}
              {savedViews && savedViews.length > 0 && (
                <Select
                  value={selectedViewId?.toString() || "custom"}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      handleClearFilters();
                    } else if (value === "manage") {
                      setIsManageDialogOpen(true);
                    } else {
                      const view = savedViews.find(v => v.id.toString() === value);
                      if (view) applyView(view);
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <Bookmark className="h-4 w-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Select view">
                      {currentView ? currentView.name : "Custom View"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">
                      <span className="text-muted-foreground">Custom View</span>
                    </SelectItem>
                    {savedViews.map((view) => (
                      <SelectItem key={view.id} value={view.id.toString()}>
                        <div className="flex items-center gap-2">
                          {view.isDefault && <Star className="h-3 w-3 text-yellow-500" />}
                          {view.isShared && <Eye className="h-3 w-3 text-blue-500" />}
                          {view.name}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="manage">
                      <span className="text-primary">Manage views...</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Save View Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={openSaveDialog}
                title="Save current view"
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>

              {/* Filter Popover */}
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium">Filter Tasks</h4>
                      <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear all
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsFilterOpen(false);
                            openSaveDialog();
                          }}
                          className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <BookmarkPlus className="h-3 w-3 mr-1" />
                          Save view
                        </Button>
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Priority</Label>
                      <Select
                        value={filters.priority || "all"}
                        onValueChange={(value) =>
                          onFiltersChange({ ...filters, priority: value === "all" ? null : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All priorities</SelectItem>
                          {Object.values(Priority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Status</Label>
                      <Select
                        value={filters.status || "all"}
                        onValueChange={(value) =>
                          onFiltersChange({ ...filters, status: value === "all" ? null : value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assignee Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm">Assignee</Label>
                      <Select
                        value={filters.assigneeId?.toString() || "all"}
                        onValueChange={(value) =>
                          onFiltersChange({
                            ...filters,
                            assigneeId: value === "all" ? null : value === "unassigned" ? 0 : parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All assignees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All assignees</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {availableAssignees?.map((user) => (
                            <SelectItem key={user.userId} value={user.userId.toString()}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Share Button */}
              <Button variant="ghost" size="sm" onClick={handleShare} title="Share project">
                <Share className="h-4 w-4" />
              </Button>

              {/* Export CSV Button */}
              <Button variant="ghost" size="sm" onClick={handleExportCSV} title="Export as CSV">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>

              {/* Export JSON Button */}
              <Button variant="ghost" size="sm" onClick={handleExportJSON} title="Export as JSON">
                <FileJson className="h-4 w-4" />
              </Button>

              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none order-first sm:order-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Task"
                  className="pl-10 w-full sm:w-48 md:w-64"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => onSearchChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(activeFiltersCount > 0 || searchQuery || currentView) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t flex-wrap">
              <span className="text-sm text-muted-foreground">Active:</span>
              {currentView && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  {currentView.name}
                  {currentView.isDefault && <Star className="h-3 w-3 ml-1" />}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => onSearchChange("")} className="ml-1 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Priority: {filters.priority}
                  <button
                    onClick={() => onFiltersChange({ ...filters, priority: null })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <button
                    onClick={() => onFiltersChange({ ...filters, status: null })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.assigneeId !== null && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Assignee: {filters.assigneeId === 0 ? "Unassigned" : availableAssignees?.find(u => u.userId === filters.assigneeId)?.username || "Unknown"}
                  <button
                    onClick={() => onFiltersChange({ ...filters, assigneeId: null })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {!currentView && (activeFiltersCount > 0 || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleClearFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={() => setActiveTab(name)}
      className={cn(
        "flex items-center gap-2",
        isActive && "bg-primary text-primary-foreground"
      )}
    >
      {icon}
      {name}
    </Button>
  );
};

export default ProjectHeader;
